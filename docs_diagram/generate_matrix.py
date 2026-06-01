import re

def parse_and_generate_matrix():
    source_path = '/home/luozhi/Documents/HRM-Gene/docs/test-cases.md'
    dest_path = '/home/luozhi/Documents/HRM-Gene/docs/test-cases-matrix.md'

    with open(source_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split by module header: ## 1. Module: Auth (Xác thực)
    module_sections = re.split(r'(^##\s+\d+\.\s+Module:.*?$|^##\s+[A-Z0-9\s]+.*?$)', content, flags=re.MULTILINE)

    def get_req_levels(module_title):
        title_lower = module_title.lower()
        if "auth" in title_lower or "rbac" in title_lower:
            return "Đăng nhập & Bảo mật", "Xác thực / Phân quyền"
        elif "employee" in title_lower or "department" in title_lower or "position" in title_lower:
            return "Nhân sự & Cơ cấu", "Thông tin nhân sự / Sơ đồ tổ chức"
        elif "leave" in title_lower or "holiday" in title_lower:
            return "Nghỉ phép & Chấm công", "Quản lý nghỉ phép"
        elif "timekeeping" in title_lower or "violation" in title_lower or "resignation" in title_lower:
            return "Nghỉ phép & Chấm công", "Chấm công / Vi phạm / Thôi việc"
        elif "payroll" in title_lower or "contract" in title_lower:
            return "Hợp đồng & Lương", "Quản lý hợp đồng & Bảng lương"
        elif "message" in title_lower or "announcement" in title_lower or "comment" in title_lower or "notification" in title_lower:
            return "Truyền thông & Thông báo", "Hộp thoại / Thông báo / Bình luận"
        elif "kpi" in title_lower:
            return "Đánh giá & KPI", "Chỉ số hiệu suất KPI"
        elif "profile" in title_lower or "settings" in title_lower or "admin" in title_lower:
            return "Thiết lập công ty", "Thiết lập hệ thống & Hồ sơ doanh nghiệp"
        elif "dashboard" in title_lower or "report" in title_lower or "analytics" in title_lower:
            return "Báo cáo & Thống kê", "Bảng thống kê / Báo cáo phân tích"
        elif "e2e" in title_lower:
            return "Kịch bản E2E", "Tích hợp đa module E2E"
        elif "security" in title_lower:
            return "Bảo mật hệ thống", "Tấn công / Rate limit / IDOR / XSS"
        else:
            return "Chức năng chung", "Hệ thống HRM"

    matrix_rows = []

    for idx in range(1, len(module_sections), 2):
        mod_title = module_sections[idx].strip()
        mod_body = module_sections[idx+1] if idx+1 < len(module_sections) else ""

        req_lvl1, req_lvl2 = get_req_levels(mod_title)

        # Parse all test cases inside this module body
        test_case_splits = re.split(r'(^###\s+TC-[A-Z0-9-]+.*?$)', mod_body, flags=re.MULTILINE)
        
        for tc_idx in range(1, len(test_case_splits), 2):
            tc_header = test_case_splits[tc_idx].strip()
            tc_body = test_case_splits[tc_idx+1] if tc_idx+1 < len(test_case_splits) else ""

            # Extract fields from header
            m_header = re.search(r'###\s*(TC-[A-Z0-9-]+)\s*—\s*(.*?)\s*\((P\d)\s*—\s*(.*?)\)', tc_header)
            if not m_header:
                continue

            tc_id = m_header.group(1).strip()
            tc_title = m_header.group(2).strip()
            priority = m_header.group(3).strip()
            tc_type_raw = m_header.group(4).strip().upper()

            # Map TC Type to clean values matching the image
            if "BLACK-BOX" in tc_type_raw:
                tc_type = "Function"
            elif "WHITE-BOX" in tc_type_raw:
                tc_type = "Logic"
            elif "INTEGRATION" in tc_type_raw:
                tc_type = "Functional" if "E2E" not in tc_id else "Scenario"
            elif "WS" in tc_type_raw:
                tc_type = "WebSocket"
            else:
                tc_type = "Function"

            if "SEC" in tc_id or "SECURITY" in tc_type_raw:
                tc_type = "Security"

            # Parse table fields from body
            def get_row_value(field_name, text):
                lines = text.split('\n')
                for line in lines:
                    if field_name.lower() in line.lower():
                        parts = [p.strip() for p in line.split('|')]
                        if len(parts) >= 3:
                            return parts[2]
                return ""

            hang_muc = get_row_value("Hạng mục (Test Item)", tc_body)
            dau_vao = get_row_value("Dữ liệu đầu vào (Inputs)", tc_body)
            dau_ra = get_row_value("Kết quả mong đợi (Expected Output)", tc_body)
            moi_truong = get_row_value("Điều kiện tiên quyết (Preconditions)", tc_body)
            thu_tuc = get_row_value("Các bước thực hiện (Test Steps)", tc_body)
            
            # Extract dependencies
            dep_row = get_row_value("Sự phụ thuộc & Mức độ ưu tiên", tc_body)
            phu_thuoc = "Không"
            if dep_row:
                m_dep = re.search(r'Phụ thuộc:\s*(.*?)(?:\||\Z)', dep_row)
                if m_dep:
                    phu_thuoc = m_dep.group(1).strip()

            # Determine Actor
            actor = "All"
            combined_text = (hang_muc + " " + dau_vao + " " + moi_truong + " " + thu_tuc).lower()
            if "admin jwt" in combined_text or "admin" in combined_text:
                actor = "Admin"
            elif "hr jwt" in combined_text or "hr" in combined_text:
                actor = "HR"
            elif "manager jwt" in combined_text or "manager" in combined_text:
                actor = "Manager"
            elif "nhân viên" in combined_text or "employee" in combined_text or "user jwt" in combined_text:
                actor = "Employee"

            # 1. Clean Test case description (Mô tả TC)
            # Make it natural and highly detailed based on the steps & preconditions, without raw input/output strings.
            description = f"Kiểm thử chức năng: {tc_title}."
            if thu_tuc and thu_tuc != "Không":
                description += f" Thực hiện bước: {thu_tuc}."
            if moi_truong and moi_truong != "Không":
                description += f" Điều kiện: {moi_truong}."
            
            description = description.replace("|", "\\|").replace("\n", " ").strip()

            # 2. Inputs
            inputs = dau_vao if dau_vao else "Không có"
            inputs = inputs.replace("|", "\\|").replace("\n", " ").strip()

            # 3. Expected Output
            expected_output = dau_ra if dau_ra else "Thành công"
            expected_output = expected_output.replace("|", "\\|").replace("\n", " ").strip()

            # 4. Clean Note (Ghi chú)
            # Describe the runtime effects like notifications, WebSocket updates, logs, etc.
            notes_list = []
            
            # Analyze text for side effects to populate Notes
            full_tc_text = (tc_body + " " + tc_title).lower()
            if "notification" in full_tc_text or "thông báo" in full_tc_text:
                notes_list.append("Hệ thống tự động tạo và gửi Notification cho các bên liên quan.")
            if "websocket" in full_tc_text or "real-time" in full_tc_text or "realtime" in full_tc_text:
                notes_list.append("Gửi tín hiệu cập nhật thời gian thực qua kênh WebSocket.")
            if "auditlog" in full_tc_text or "audit log" in full_tc_text or "nhật ký" in full_tc_text:
                notes_list.append("Ghi nhận lịch sử hoạt động vào bảng AuditLog để giám sát.")
            if "cookie" in full_tc_text:
                notes_list.append("Xử lý set/clear Cookie HttpOnly an toàn.")
            if phu_thuoc and phu_thuoc != "Không":
                notes_list.append(f"Yêu cầu chạy sau {phu_thuoc}.")
            if "late" in full_tc_text or "vi phạm" in full_tc_text or "violation" in full_tc_text:
                notes_list.append("Tự động tạo bản ghi vi phạm kỷ luật nếu đi muộn hoặc làm thiếu giờ.")

            if not notes_list:
                notes_list.append("Chạy thành công, không có phát sinh cảnh báo đặc biệt.")

            note = " ".join(notes_list)
            note = note.replace("|", "\\|").replace("\n", " ").strip()

            # Requirement Level 3 is the TC title
            req_lvl3 = tc_title

            matrix_rows.append({
                "req_lvl1": req_lvl1,
                "req_lvl2": req_lvl2,
                "req_lvl3": req_lvl3,
                "actor": actor,
                "tc_id": tc_id,
                "description": description,
                "inputs": inputs,
                "expected_output": expected_output,
                "tc_type": tc_type,
                "note": note
            })

    # Let's generate the output Markdown file
    markdown_output = []
    markdown_output.append("# Ma Trận Ca Kiểm Thử (Test Case Specification Matrix) — Hệ thống HRM")
    markdown_output.append("\n> Định dạng bảng đặc tả yêu cầu và ca kiểm thử chuyên sâu theo chuẩn IEEE-829 cải tiến.")
    markdown_output.append("\n\n| Yêu cầu cấp 1 | Yêu cầu cấp 2 | Yêu cầu cấp 3 | Actor | Mã TC (TC_ID) | Mô tả TC (Test case description) | Dữ liệu đầu vào (Inputs) | Kết quả mong đợi (Expected Output) | Kiểu TC (Test Type) | Ghi chú (Note) |")
    markdown_output.append("|---|---|---|---|---|---|---|---|---|---|")

    # Add each row
    for row in matrix_rows:
        markdown_output.append(
            f"| {row['req_lvl1']} | {row['req_lvl2']} | {row['req_lvl3']} | {row['actor']} | {row['tc_id']} | {row['description']} | {row['inputs']} | {row['expected_output']} | {row['tc_type']} | {row['note']} |"
        )

    # Save to destination
    with open(dest_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(markdown_output))

    print(f"Successfully generated matrix file in docs/test-cases-matrix.md with {len(matrix_rows)} test cases!")

if __name__ == '__main__':
    parse_and_generate_matrix()
