#!/usr/bin/env python3
"""
Export test cases from test-report.html to CSV and XLSX (no external deps needed).
Usage: python3 export_tests.py
Output: test-report.csv, test-report.xlsx (in the same directory as this script)
"""
import csv
import os
import re
import zipfile
import io
from html.parser import HTMLParser
from xml.sax.saxutils import escape as xml_escape

# ─────────────────────────────────────────────
# 1. Parse HTML
# ─────────────────────────────────────────────

class TestReportParser(HTMLParser):
    """Parses the HTML test report and extracts rows from all <table> elements."""

    def __init__(self):
        super().__init__()
        self._in_table = False
        self._in_thead = False
        self._in_tbody = False
        self._in_tr = False
        self._in_td = False
        self._in_li = False
        self._current_row = []
        self._current_cell_text = []
        self._current_li_texts = []   # accumulate <li> texts in a cell
        self._cell_is_list = False    # cell contains <ul>/<li>
        self._depth_td = 0
        self.rows = []                # list of dicts
        self._current_module = "Unknown"

        # track module name from accordion buttons
        self._in_accordion_btn = False
        self._accordion_btn_text = []

    # ── helpers ───────────────────────────────

    def _flush_cell(self):
        if self._cell_is_list:
            text = "; ".join(t.strip() for t in self._current_li_texts if t.strip())
        else:
            text = "".join(self._current_cell_text).strip()
        self._current_row.append(text)
        self._current_cell_text = []
        self._current_li_texts = []
        self._cell_is_list = False

    # ── tag handlers ──────────────────────────

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        cls = attrs_dict.get("class", "")

        # Detect module name from accordion-button
        if tag == "button" and "accordion-button" in cls:
            self._in_accordion_btn = True
            self._accordion_btn_text = []
            return

        if self._in_accordion_btn:
            return  # skip inner tags inside button until we handle_endtag

        if tag == "table":
            self._in_table = True
        elif tag == "thead" and self._in_table:
            self._in_thead = True
        elif tag == "tbody" and self._in_table:
            self._in_tbody = True
        elif tag == "tr" and self._in_tbody:
            self._in_tr = True
            self._current_row = []
        elif tag == "td" and self._in_tr:
            if self._depth_td == 0:
                self._in_td = True
                self._current_cell_text = []
                self._current_li_texts = []
                self._cell_is_list = False
            self._depth_td += 1
        elif tag in ("ul", "ol") and self._in_td:
            self._cell_is_list = True
        elif tag == "li" and self._in_td and self._cell_is_list:
            self._in_li = True
            self._current_li_texts.append("")  # placeholder

    def handle_endtag(self, tag):
        if self._in_accordion_btn and tag == "button":
            full = "".join(self._accordion_btn_text).strip()
            # Remove badge text (e.g. "33 tests") — keep first word(s) before a digit
            name = re.split(r'\d', full)[0].strip()
            if name:
                self._current_module = name
            self._in_accordion_btn = False
            self._accordion_btn_text = []
            return

        if tag == "table":
            self._in_table = False
            self._in_thead = False
            self._in_tbody = False
        elif tag == "thead":
            self._in_thead = False
        elif tag == "tbody":
            self._in_tbody = False
        elif tag == "tr" and self._in_tbody:
            self._in_tr = False
            if self._current_row:
                # Expect 6 columns: Test ID, Priority, Category, Description, Steps, Expected Result
                if len(self._current_row) == 6:
                    self.rows.append({
                        "Module": self._current_module,
                        "Test ID": self._current_row[0],
                        "Priority": self._current_row[1],
                        "Category": self._current_row[2],
                        "Description": self._current_row[3],
                        "Steps": self._current_row[4],
                        "Expected Result": self._current_row[5],
                    })
        elif tag == "td" and self._in_td:
            self._depth_td -= 1
            if self._depth_td == 0:
                self._flush_cell()
                self._in_td = False
                self._in_li = False
        elif tag == "li" and self._in_li:
            self._in_li = False

    def handle_data(self, data):
        if self._in_accordion_btn:
            self._accordion_btn_text.append(data)
            return

        if not self._in_td:
            return

        if self._in_li and self._cell_is_list:
            if self._current_li_texts:
                self._current_li_texts[-1] += data
        elif not self._cell_is_list:
            self._current_cell_text.append(data)


# ─────────────────────────────────────────────
# 2. Export to CSV
# ─────────────────────────────────────────────

FIELDNAMES = ["Module", "Test ID", "Priority", "Category", "Description", "Steps", "Expected Result"]

def export_csv(rows, path):
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)
    print(f"✓ CSV exported: {path} ({len(rows)} rows)")


# ─────────────────────────────────────────────
# 3. Export to XLSX (pure Python, no openpyxl)
# ─────────────────────────────────────────────

# Colour map for priority and category cells
PRIORITY_COLORS = {"P1": "C0392B", "P2": "F39C12", "P3": "95A5A6"}
CATEGORY_COLORS = {"Positive": "27AE60", "Negative": "E67E22"}

# Column widths (in Excel units ≈ characters)
COL_WIDTHS = [18, 20, 10, 10, 40, 50, 40]

def _esc(s: str) -> str:
    return xml_escape(str(s), {'"': '&quot;'})

def _clean(s: str) -> str:
    """Strip bullet prefix ▸ and step numbers that look like '▸ 1.'"""
    s = re.sub(r'▸\s*\d+\.\s*', '', s)
    s = re.sub(r'▸\s*', '', s)
    return s.strip()

def _build_sheet_xml(rows, si, fields_no_module=False):
    """Return the worksheet XML string for a list of rows.
    fields_no_module=True omits the 'Module' column (used in per-module sheets).
    """
    cols = FIELDNAMES if not fields_no_module else FIELDNAMES[1:]  # skip 'Module' col in per-module sheets
    widths = COL_WIDTHS if not fields_no_module else COL_WIDTHS[1:]

    def xf_for_priority(p):
        return {"P1": 3, "P2": 4, "P3": 5}.get(p, 2)

    def xf_for_category(c):
        return {"Positive": 6, "Negative": 7}.get(c, 2)

    lines = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/sheet"',
        '  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
        '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>',
        '<cols>',
    ]
    for i, w in enumerate(widths, start=1):
        lines.append(f'<col min="{i}" max="{i}" width="{w}" customWidth="1"/>')
    lines.append('</cols>')
    lines.append('<sheetData>')

    # Header row
    lines.append('<row r="1" ht="20" customHeight="1">')
    for ci, h in enumerate(cols, start=1):
        lines.append(f'<c r="{_col_letter(ci)}1" t="s" s="1"><v>{si(h)}</v></c>')
    lines.append('</row>')

    # Data rows
    for ri, row in enumerate(rows, start=2):
        lines.append(f'<row r="{ri}" ht="60" customHeight="1">')
        for ci, field in enumerate(cols, start=1):
            val = row[field]
            style = 2
            if field == "Priority":
                style = xf_for_priority(val)
            elif field == "Category":
                style = xf_for_category(val)
            lines.append(f'<c r="{_col_letter(ci)}{ri}" t="s" s="{style}"><v>{si(val)}</v></c>')
        lines.append('</row>')

    lines.append('</sheetData>')
    lines.append('<sheetFormatPr defaultRowHeight="15"/>')
    lines.append('</worksheet>')
    return "\n".join(lines)


def make_xlsx(rows, path):
    """Build a multi-sheet .xlsx file from scratch using zipfile.
    Sheet layout:
      - Sheet 1: "All" – every test case (with Module column)
      - Sheet 2..N: one sheet per module (without Module column)
    """

    # ── Shared strings (global pool for all sheets) ───────────────────────
    shared_strings: list[str] = []
    ss_map: dict[str, int] = {}

    def si(val: str) -> int:
        val = _clean(val)
        if val not in ss_map:
            ss_map[val] = len(shared_strings)
            shared_strings.append(val)
        return ss_map[val]

    # Pre-index every string that will appear
    for h in FIELDNAMES:
        si(h)
    for row in rows:
        for f in FIELDNAMES:
            si(row[f])

    # ── Styles ────────────────────────────────
    unique_fills: dict[str, int] = {}

    def fill_idx(hex_color: str) -> int:
        if hex_color not in unique_fills:
            unique_fills[hex_color] = len(unique_fills) + 2
        return unique_fills[hex_color]

    for c in PRIORITY_COLORS.values():
        fill_idx(c)
    for c in CATEGORY_COLORS.values():
        fill_idx(c)
    fill_idx("1E3A5F")  # header blue

    styles_xml = _build_styles_xml(unique_fills)

    # ── Group rows by module (preserve insertion order) ───────────────────
    modules_ordered: list[str] = []
    by_module: dict[str, list] = {}
    for row in rows:
        m = row["Module"]
        if m not in by_module:
            modules_ordered.append(m)
            by_module[m] = []
        by_module[m].append(row)

    # ── Build sheet list ──────────────────────
    # sheet index 1 = "All", then one per module
    sheets: list[tuple[str, list, bool]] = []  # (name, rows, fields_no_module)
    sheets.append(("All", rows, False))          # col 'Module' included
    for m in modules_ordered:
        # Truncate name to ≤31 chars (Excel limit)
        name = m[:31]
        sheets.append((name, by_module[m], True))  # no 'Module' col

    # ── Write XLSX ────────────────────────────
    # rId numbering: 1..N = sheets, N+1 = sharedStrings, N+2 = styles
    n_sheets = len(sheets)
    rId_ss   = n_sheets + 1
    rId_sty  = n_sheets + 2

    # Content-Types
    ct_overrides = [
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
        '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>',
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>',
    ]
    for i in range(1, n_sheets + 1):
        ct_overrides.append(
            f'<Override PartName="/xl/worksheets/sheet{i}.xml"'
            ' ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        )
    content_types = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        + "".join(ct_overrides)
        + '</Types>'
    )

    # Workbook
    wb_sheets = "".join(
        f'<sheet name="{_esc(name)}" sheetId="{i}" r:id="rId{i}"/>'
        for i, (name, _, __) in enumerate(sheets, start=1)
    )
    workbook_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/sheet"'
        ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        f'<sheets>{wb_sheets}</sheets>'
        '</workbook>'
    )

    # Workbook relationships
    wb_rels_parts = []
    for i, (_, __, ___) in enumerate(sheets, start=1):
        wb_rels_parts.append(
            f'<Relationship Id="rId{i}"'
            ' Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet"'
            f' Target="worksheets/sheet{i}.xml"/>'
        )
    wb_rels_parts.append(
        f'<Relationship Id="rId{rId_ss}"'
        ' Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings"'
        ' Target="sharedStrings.xml"/>'
    )
    wb_rels_parts.append(
        f'<Relationship Id="rId{rId_sty}"'
        ' Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles"'
        ' Target="styles.xml"/>'
    )
    workbook_rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        + "".join(wb_rels_parts)
        + '</Relationships>'
    )

    root_rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1"'
        ' Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"'
        ' Target="xl/workbook.xml"/>'
        '</Relationships>'
    )

    # Shared strings
    ss_xml_parts = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        f'<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/sheet" count="{len(shared_strings)}" uniqueCount="{len(shared_strings)}">',
    ]
    for s in shared_strings:
        ss_xml_parts.append(f'<si><t xml:space="preserve">{_esc(s)}</t></si>')
    ss_xml_parts.append('</sst>')
    ss_xml = "\n".join(ss_xml_parts)

    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", content_types)
        zf.writestr("_rels/.rels", root_rels)
        zf.writestr("xl/workbook.xml", workbook_xml)
        zf.writestr("xl/_rels/workbook.xml.rels", workbook_rels)
        zf.writestr("xl/sharedStrings.xml", ss_xml)
        zf.writestr("xl/styles.xml", styles_xml)

        for i, (name, sheet_rows, no_module) in enumerate(sheets, start=1):
            zf.writestr(
                f"xl/worksheets/sheet{i}.xml",
                _build_sheet_xml(sheet_rows, si, fields_no_module=no_module),
            )

    print(f"✓ XLSX exported: {path} ({len(rows)} rows, {n_sheets} sheets)")


def _col_letter(n: int) -> str:
    """Convert 1-based column index to Excel column letter(s)."""
    result = ""
    while n > 0:
        n, rem = divmod(n - 1, 26)
        result = chr(65 + rem) + result
    return result


def _build_styles_xml(unique_fills: dict) -> str:
    """Build a minimal styles.xml for our workbook."""

    # Fonts
    fonts_xml = (
        '<fonts count="3">'
        '<font><sz val="10"/><name val="Calibri"/></font>'  # 0: default
        '<font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>'  # 1: bold white (header)
        '<font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>'  # 2: bold white (coloured cell)
        '</fonts>'
    )

    # Fills (index 0: none, index 1: gray125 – REQUIRED by spec, then custom)
    fill_parts = [
        '<fill><patternFill patternType="none"/></fill>',
        '<fill><patternFill patternType="gray125"/></fill>',
    ]
    for hex_color in unique_fills:
        fill_parts.append(
            f'<fill><patternFill patternType="solid">'
            f'<fgColor rgb="FF{hex_color}"/>'
            f'<bgColor indexed="64"/>'
            f'</patternFill></fill>'
        )
    fills_xml = f'<fills count="{len(fill_parts)}">{"".join(fill_parts)}</fills>'

    # Borders
    borders_xml = (
        '<borders count="2">'
        '<border><left/><right/><top/><bottom/><diagonal/></border>'  # 0: none
        '<border>'
        '<left style="thin"><color rgb="FFD0D0D0"/></left>'
        '<right style="thin"><color rgb="FFD0D0D0"/></right>'
        '<top style="thin"><color rgb="FFD0D0D0"/></top>'
        '<bottom style="thin"><color rgb="FFD0D0D0"/></bottom>'
        '<diagonal/>'
        '</border>'  # 1: thin gray
        '</borders>'
    )

    # CellStyleXfs (required)
    cell_style_xfs = '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'

    # CellXfs
    # 0: default
    # 1: header (bold white font, dark blue fill, border 1, wrap)
    # 2: normal wrapped (default font, no fill, border 1, wrap)
    # 3: P1 (red)
    # 4: P2 (orange)
    # 5: P3 (gray)
    # 6: Positive (green)
    # 7: Negative (amber)

    def fill_id_for(hex_color: str) -> int:
        return unique_fills[hex_color]

    xfs = [
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>',
        # header
        f'<xf numFmtId="0" fontId="1" fillId="{fill_id_for("1E3A5F")}" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment wrapText="1" vertical="center" horizontal="center"/></xf>',
        # normal
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf>',
        # P1
        f'<xf numFmtId="0" fontId="2" fillId="{fill_id_for(PRIORITY_COLORS["P1"])}" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment wrapText="1" vertical="center" horizontal="center"/></xf>',
        # P2
        f'<xf numFmtId="0" fontId="2" fillId="{fill_id_for(PRIORITY_COLORS["P2"])}" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment wrapText="1" vertical="center" horizontal="center"/></xf>',
        # P3
        f'<xf numFmtId="0" fontId="2" fillId="{fill_id_for(PRIORITY_COLORS["P3"])}" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment wrapText="1" vertical="center" horizontal="center"/></xf>',
        # Positive
        f'<xf numFmtId="0" fontId="2" fillId="{fill_id_for(CATEGORY_COLORS["Positive"])}" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment wrapText="1" vertical="center" horizontal="center"/></xf>',
        # Negative
        f'<xf numFmtId="0" fontId="2" fillId="{fill_id_for(CATEGORY_COLORS["Negative"])}" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment wrapText="1" vertical="center" horizontal="center"/></xf>',
    ]
    cell_xfs = f'<cellXfs count="{len(xfs)}">{"".join(xfs)}</cellXfs>'

    cell_styles = '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'

    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/sheet">'
        + fonts_xml
        + fills_xml
        + borders_xml
        + cell_style_xfs
        + cell_xfs
        + cell_styles
        + '</styleSheet>'
    )


# ─────────────────────────────────────────────
# 4. Main
# ─────────────────────────────────────────────

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    html_path = os.path.join(script_dir, "test-report.html")
    csv_path = os.path.join(script_dir, "test-report.csv")
    xlsx_path = os.path.join(script_dir, "test-report.xlsx")

    print(f"Parsing {html_path} …")
    with open(html_path, encoding="utf-8") as f:
        content = f.read()

    parser = TestReportParser()
    parser.feed(content)

    rows = parser.rows
    print(f"Found {len(rows)} test cases.")

    export_csv(rows, csv_path)
    make_xlsx(rows, xlsx_path)
    print("Done!")
