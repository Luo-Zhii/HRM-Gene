/**
 * Converts a non-negative integer into Vietnamese words.
 * Example: 16157571 → "Mười sáu triệu, một trăm năm mươi bảy nghìn, năm trăm bảy mươi mốt đồng"
 *
 * Falls back to English-style output in parentheses for the payslip footer.
 */

const ONES = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
const TEENS = ["mười", "mười một", "mười hai", "mười ba", "mười bốn", "mười lăm", "mười sáu", "mười bảy", "mười tám", "mười chín"];
const TENS = ["", "mười", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"];

function threeDigits(n: number): string {
  if (n === 0) return "";
  const h = Math.floor(n / 100);
  const rem = n % 100;
  const t = Math.floor(rem / 10);
  const o = rem % 10;

  let result = "";
  if (h > 0) result += ONES[h] + " trăm";
  if (rem === 0) return result;
  result += (result ? " " : "");

  if (rem < 10) {
    result += (h > 0 ? "lẻ " : "") + ONES[o];
  } else if (rem < 20) {
    result += TEENS[rem - 10];
  } else {
    result += TENS[t];
    if (o > 0) {
      // Special case: 1 at units position after tens → "mốt", 5 → "lăm"
      const unit = o === 1 ? "mốt" : o === 5 ? "lăm" : ONES[o];
      result += " " + unit;
    }
  }
  return result;
}

/**
 * Main export: converts a number to a Vietnamese currency words string.
 * E.g. 16_157_571 → "Mười sáu triệu, một trăm năm mươi bảy nghìn, năm trăm bảy mươi mốt đồng"
 */
export function numberToVietnameseWords(amount: number): string {
  const n = Math.round(Math.abs(amount));
  if (n === 0) return "Không đồng";

  const billions = Math.floor(n / 1_000_000_000);
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1_000);
  const remainder = n % 1_000;

  const parts: string[] = [];

  if (billions > 0) parts.push(threeDigits(billions) + " tỷ");
  if (millions > 0) parts.push(threeDigits(millions) + " triệu");
  if (thousands > 0) parts.push(threeDigits(thousands) + " nghìn");
  if (remainder > 0) parts.push(threeDigits(remainder));

  const raw = parts.join(", ");
  // Capitalise first letter
  return raw.charAt(0).toUpperCase() + raw.slice(1) + " đồng";
}
