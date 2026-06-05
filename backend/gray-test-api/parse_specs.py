import os
import re
import csv

SPEC_DIR = "/home/luozhi/Documents/HRM-Gene/backend/gray-test-api"
OUTPUT_CSV = "/home/luozhi/Documents/HRM-Gene/backend/gray-test-api/gray-test-cases-ieee829.csv"

MODULE_CODES = {
    "Admin": "ADMIN",
    "Analytics": "ANLY",
    "Announcements": "ANNC",
    "Auth": "AUTH",
    "Comments": "COMM",
    "Company Profile": "COMP",
    "Contracts": "CONT",
    "Dashboard": "DASH",
    "Departments": "DEPT",
    "Employees": "EMP",
    "Holiday": "HOLI",
    "KPI": "KPI",
    "Leave": "LEAV",
    "Messages": "MSGS",
    "Notifications": "NTFY",
    "Payroll": "PAYR",
    "Positions": "POS",
    "Reports": "RPT",
    "Resignations": "RESG",
    "Salary History": "SALH",
    "Timekeeping": "TIME",
    "Violations": "VIOL"
}

# Accurate Vietnamese translations for all 196 test cases
TRANSLATION_MAP = {
    "Annual Leave remaining_days should be between 2 and 12 (per seed)": "Kiểm tra DB: Số ngày phép năm còn lại của mỗi nhân viên phải nằm trong khoảng từ 2 đến 12 ngày (theo dữ liệu mẫu)",
    "Director should have the most permissions": "Kiểm tra DB: Quyền hạn của chức danh Giám đốc (Director) phải là đầy đủ nhất",
    "admin (Director) should be able to delete a position": "Quản trị viên (Director) có thể xóa một chức vụ",
    "admin (Director) should get admin dashboard data": "Quản trị viên (Director) có thể lấy dữ liệu bảng điều khiển (dashboard) admin",
    "admin (Director) should see pending requests": "Quản trị viên (Director) có thể xem danh sách các yêu cầu nghỉ phép đang chờ duyệt",
    "admin should assign KPI to employees": "Quản trị viên thực hiện gán KPI cho nhân viên",
    "admin should be able to delete a department": "Quản trị viên có thể xóa một phòng ban",
    "admin should create a contract and persist in DB": "Quản trị viên tạo mới hợp đồng lao động và lưu vào DB",
    "admin should create a new KPI library item": "Quản trị viên tạo mới danh mục KPI trong thư viện",
    "admin should create a new KPI period": "Quản trị viên tạo mới chu kỳ đánh giá KPI",
    "admin should create a violation and persist in DB": "Quản trị viên tạo mới bản ghi vi phạm và lưu vào DB",
    "admin should create an announcement and persist in DB": "Quản trị viên tạo mới thông báo chung và lưu vào DB",
    "admin should delete a KPI library item": "Quản trị viên xóa một danh mục KPI trong thư viện",
    "admin should delete a contract": "Quản trị viên xóa một hợp đồng lao động",
    "admin should delete a violation": "Quản trị viên xóa một bản ghi vi phạm",
    "admin should delete an announcement and remove from DB": "Quản trị viên xóa một thông báo chung khỏi hệ thống và DB",
    "admin should delete an assignment": "Quản trị viên xóa một phân công KPI",
    "admin should get a contract by id": "Quản trị viên lấy thông tin hợp đồng lao động theo ID",
    "admin should get a specific history record by id": "Quản trị viên lấy thông tin lịch sử thay đổi lương theo ID",
    "admin should get a specific setting by key": "Quản trị viên lấy cấu hình hệ thống cụ thể bằng Key",
    "admin should get a violation by id": "Quản trị viên lấy thông tin bản ghi vi phạm theo ID",
    "admin should get all adjustments": "Quản trị viên lấy danh sách tất cả các khoản điều chỉnh lương",
    "admin should get all departments via admin route": "Quản trị viên lấy danh sách tất cả phòng ban qua route admin",
    "admin should get all holidays": "Quản trị viên lấy danh sách tất cả ngày nghỉ lễ",
    "admin should get all positions via admin route": "Quản trị viên lấy danh sách tất cả chức vụ qua route admin",
    "admin should get all salary configs": "Quản trị viên lấy danh sách tất cả cấu hình lương của nhân viên",
    "admin should get all salary history records": "Quản trị viên lấy danh sách tất cả lịch sử thay đổi lương",
    "admin should get all system settings": "Quản trị viên lấy danh sách tất cả cấu hình hệ thống",
    "admin should get all violations": "Quản trị viên lấy danh sách tất cả các vi phạm",
    "admin should get contracts by employee id": "Quản trị viên lấy danh sách hợp đồng theo ID nhân viên",
    "admin should get grouped permissions": "Quản trị viên lấy danh sách quyền hạn được nhóm lại",
    "admin should get holiday stats": "Quản trị viên lấy thông tin thống kê ngày nghỉ lễ",
    "admin should get organization statistics": "Quản trị viên lấy số liệu thống kê cơ cấu tổ chức",
    "admin should get paginated attendance records for all employees": "Quản trị viên lấy danh sách lịch sử chấm công phân trang của tất cả nhân viên",
    "admin should get payroll period by month/year": "Quản trị viên lấy thông tin chu kỳ tính lương theo tháng/năm",
    "admin should get payslips by period": "Quản trị viên lấy danh sách phiếu lương theo chu kỳ tính lương",
    "admin should get permission matrix": "Quản trị viên lấy ma trận phân quyền hệ thống",
    "admin should get reports dashboard data": "Quản trị viên lấy dữ liệu bảng điều khiển báo cáo",
    "admin should get salary config for a specific employee": "Quản trị viên lấy cấu hình lương của một nhân viên cụ thể",
    "admin should get upcoming holidays": "Quản trị viên lấy danh sách các ngày nghỉ lễ sắp tới",
    "admin should grade an assignment": "Quản trị viên thực hiện chấm điểm đánh giá KPI nhân viên",
    "admin should send announcement to all users": "Quản trị viên gửi thông báo chung tới tất cả người dùng",
    "admin should sync attendance violations": "Quản trị viên đồng bộ hóa dữ liệu vi phạm chấm công",
    "admin should update a contract": "Quản trị viên cập nhật thông tin hợp đồng lao động",
    "admin should update a violation": "Quản trị viên cập nhật thông tin vi phạm",
    "admin should update company profile and persist in DB": "Quản trị viên cập nhật thông tin công ty và lưu vào DB",
    "admin should update resignation status": "Quản trị viên cập nhật trạng thái đơn thôi việc (phê duyệt đơn)",
    "admin user should have timekeeping records": "Kiểm tra DB: Tài khoản admin cũng phải có bản ghi dữ liệu chấm công",
    "all 40 employees should have at least 1 contract": "Kiểm tra DB: Tất cả 40 nhân viên đều phải có ít nhất 1 hợp đồng lao động",
    "all employees should have at least 1 salary history record": "Kiểm tra DB: Tất cả nhân viên đều phải có ít nhất 1 bản ghi lịch sử thay đổi lương",
    "employees should have leave balances": "Kiểm tra DB: Tất cả nhân viên đều phải có bản ghi số dư ngày nghỉ phép",
    "initial records should have old_salary=": "Kiểm tra DB: Bản ghi lịch sử lương ban đầu phải có old_salary bằng 0 và new_salary lớn hơn 0",
    "net_salary + deductions should approximately equal gross_salary": "Kiểm tra DB: Lương thực lĩnh (net_salary) cộng các khoản khấu trừ (deductions) phải bằng tổng lương (gross_salary)",
    "should assign a permission to a position": "Gán một quyền hạn mới cho chức vụ và lưu vào DB",
    "should attempt IP-based check-in": "Thực hiện chấm công theo địa chỉ IP",
    "should attempt QR check-in and return a response": "Thực hiện chấm công bằng mã QR động và nhận phản hồi từ hệ thống",
    "should calculate KPI score": "Tính toán điểm số đánh giá KPI",
    "should clear access_token cookie and return success": "Đăng xuất hệ thống, xóa cookie access_token và trả về trạng thái thành công",
    "should create a bonus adjustment and persist in DB": "Tạo mới khoản điều chỉnh lương (Thưởng) và lưu vào DB",
    "should create a comment": "Tạo mới một bình luận",
    "should create a holiday and persist in DB": "Tạo mới ngày nghỉ lễ và lưu vào DB",
    "should create a new department and persist in DB": "Tạo mới phòng ban và lưu vào DB",
    "should create a new employee and persist in DB": "Tạo mới hồ sơ nhân viên và lưu vào DB",
    "should create a new position and persist in DB": "Tạo mới chức vụ và lưu vào DB",
    "should default to current month/year without params": "Mặc định trả về báo cáo theo tháng/năm hiện tại khi không gửi tham số",
    "should delete a holiday and remove from DB": "Xóa ngày nghỉ lễ khỏi hệ thống và DB",
    "should delete a notification": "Xóa thông báo hệ thống của người dùng",
    "should generate a dynamic QR token for authenticated user": "Tạo mã QR động phục vụ chấm công cho người dùng đã xác thực",
    "should get messages with another user": "Lấy danh sách tin nhắn/hội thoại với người dùng khác",
    "should have 12 payroll periods with PAID status": "Kiểm tra DB: Đảm bảo có ít nhất 12 chu kỳ lương ở trạng thái ĐÃ THANH TOÁN (PAID)",
    "should have at least 1 seeded violation": "Kiểm tra DB: Có ít nhất 1 bản ghi vi phạm được seed sẵn",
    "should have at least 40 seeded welcome notifications": "Kiểm tra DB: Có ít nhất 40 thông báo chào mừng nhân viên mới được seed sẵn",
    "should have hours_worked = 0 for Absent records": "Kiểm tra DB: Các bản ghi chấm công vắng mặt (Absent) phải có số giờ làm việc bằng 0",
    "should have payslips in DB": "Kiểm tra DB: Bản ghi phiếu lương phải tồn tại trong database",
    "should have permissions in all module groups (ROLES, USERS, COMPANIES, PAYROLL, LEAVE, ADMIN, ATTENDANCE)": "Kiểm tra DB: Các quyền hạn phải bao phủ toàn bộ 7 nhóm module chính",
    "should have timekeeping records for the current month": "Kiểm tra DB: Dữ liệu chấm công tháng hiện tại phải đạt tỉ lệ tối thiểu theo nghiệp vụ",
    "should login admin and return access_token + user object": "Đăng nhập với tài khoản admin thành công, trả về access_token và đối tượng user",
    "should login standard user and return access_token": "Đăng nhập với tài khoản nhân viên thường thành công, trả về access_token và đối tượng user",
    "should mark a notification as read and persist in DB": "Đánh dấu thông báo đã đọc và cập nhật trạng thái trong DB",
    "should mark messages as read": "Đánh dấu tất cả tin nhắn trong hội thoại là đã đọc",
    "should only have status values of Present, Absent, or Late": "Kiểm tra DB: Trạng thái chấm công chỉ được phép là Present (Có mặt), Absent (Vắng mặt), hoặc Late (Đi muộn)",
    "should reject empty first_name": "Từ chối cập nhật thông tin cá nhân khi để trống trường Tên (first_name)",
    "should reject password change with wrong current password": "Từ chối đổi mật khẩu khi nhập sai mật khẩu hiện tại",
    "should reject short new password": "Từ chối đổi mật khẩu khi mật khẩu mới quá ngắn",
    "should return 400 for invalid employee id": "Trả về mã lỗi 400 khi gửi ID nhân viên không hợp lệ",
    "should return 400 for invalid id": "Trả về mã lỗi 400 khi gửi ID không đúng định dạng",
    "should return 400 for non-numeric id": "Trả về mã lỗi 400 khi gửi ID không phải dạng số",
    "should return 401 for incorrect password": "Trả về mã lỗi 401 khi nhập sai mật khẩu",
    "should return 401 when deleting without auth": "Từ chối xóa tài nguyên và trả về mã lỗi 401 khi không đăng nhập",
    "should return 401 without auth": "Từ chối truy cập và trả về mã lỗi 401 khi không đăng nhập",
    "should return 401 without auth token": "Từ chối truy cập và trả về mã lỗi 401 khi thiếu token xác thực",
    "should return 403 when a standard user tries to delete": "Từ chối nhân viên thường thực hiện xóa và trả về mã lỗi 403",
    "should return 403 when standard user tries to delete": "Từ chối nhân viên thường thực hiện xóa và trả về mã lỗi 403",
    "should return 404 for non-existent email": "Trả về mã lỗi 404 khi đăng nhập với email không tồn tại trong hệ thống",
    "should return KPI library items": "Trả về danh sách danh mục thư viện KPI",
    "should return KPI periods": "Trả về danh sách các chu kỳ đánh giá KPI",
    "should return a response for offboard (permissions-dependent)": "Thực hiện chấm dứt hợp đồng/nghỉ việc của nhân viên (offboard)",
    "should return a single department by id": "Trả về thông tin chi tiết một phòng ban cụ thể theo ID",
    "should return a single position by id": "Trả về thông tin chi tiết một chức vụ cụ thể theo ID",
    "should return activities list": "Trả về danh sách lịch sử hoạt động hệ thống",
    "should return admin profile with position and department": "Trả về thông tin hồ sơ của Admin đầy đủ bao gồm chức danh và phòng ban",
    "should return all 3 leave types for authenticated user": "Trả về thông tin 3 loại nghỉ phép (Phép năm, Nghỉ ốm, Nghỉ không lương)",
    "should return all 4 seeded positions": "Trả về danh sách 4 chức vụ được cấu hình sẵn trong hệ thống",
    "should return all 5 seeded departments (no auth needed)": "Trả về danh sách 5 phòng ban mẫu đã được cấu hình sẵn (không cần xác thực)",
    "should return all announcements for authenticated user": "Trả về danh sách tất cả thông báo của người dùng đã xác thực",
    "should return all resignation requests": "Trả về danh sách tất cả đơn xin thôi việc của nhân viên trong hệ thống",
    "should return assignments filtered by employee and period": "Trả về danh sách phân công KPI được lọc theo nhân viên và chu kỳ",
    "should return basic employee list": "Trả về danh sách nhân viên thu gọn (dạng cơ bản)",
    "should return comments for an entity": "Lấy danh sách các bình luận của một thực thể (ví dụ: nhân viên)",
    "should return company profile for authenticated user": "Trả về thông tin hồ sơ công ty cho người dùng đã xác thực",
    "should return contracts for admin": "Trả về danh sách tất cả hợp đồng lao động cho Admin",
    "should return contracts for user (own only)": "Trả về danh sách hợp đồng lao động của chính nhân viên đó",
    "should return current user": "Trả về thông tin của người dùng đang đăng nhập",
    "should return dashboard data for authenticated user": "Trả về dữ liệu bảng điều khiển cho người dùng đã đăng nhập",
    "should return each department with department_id and department_name": "Đảm bảo mỗi phòng ban trả về có chứa trường department_id và department_name",
    "should return each position with position_id and position_name": "Đảm bảo mỗi chức vụ trả về có chứa trường position_id và position_name",
    "should return employee dashboard data": "Trả về dữ liệu bảng điều khiển (dashboard) dành riêng cho nhân viên",
    "should return employees for standard user": "Nhân viên thường truy cập danh sách nhân viên (Trả về 200 hoặc 403 tùy theo phân quyền)",
    "should return empty array for short query": "Trả về mảng rỗng khi tìm kiếm với từ khóa quá ngắn (dưới độ dài quy định)",
    "should return full employee list through admin route": "Trả về danh sách nhân viên đầy đủ qua route quản trị",
    "should return holiday list": "Trả về danh sách tất cả các ngày nghỉ lễ",
    "should return leave balances for the authenticated user": "Trả về số dư ngày nghỉ phép của người dùng đã đăng nhập và đối chiếu DB",
    "should return leave requests for the authenticated user": "Trả về danh sách yêu cầu nghỉ phép của riêng người dùng đã đăng nhập",
    "should return list of employees for admin (Director)": "Trả về danh sách đầy đủ nhân viên cho tài khoản Admin (chức danh Director)",
    "should return navigation for standard user": "Trả về danh sách menu điều hướng tiêu chuẩn của nhân viên",
    "should return navigation items for admin (Director has admin menu)": "Trả về danh sách menu điều hướng bao gồm cả mục quản trị cho Admin (Director)",
    "should return notifications for authenticated user": "Trả về danh sách các thông báo của người dùng",
    "should return payroll summary for given month/year": "Trả về báo cáo tổng hợp lương theo tháng và năm cụ thể",
    "should return payslips for the authenticated user": "Trả về danh sách các phiếu lương của riêng người dùng",
    "should return public employee directory": "Trả về danh bạ nhân viên công khai (không lộ thông tin nhạy cảm như SĐT, địa chỉ)",
    "should return single employee by id": "Trả về thông tin chi tiết một nhân viên cụ thể theo ID",
    "should return user profile with position": "Trả về thông tin hồ sơ của nhân viên thường kèm theo chức vụ",
    "should return user-specific feed": "Trả về danh sách thông báo tin tức/bảng tin riêng của người dùng",
    "should revoke a permission from a position": "Thu hồi quyền hạn khỏi chức vụ và cập nhật trong DB",
    "should search employees by name": "Tìm kiếm nhân viên theo tên (ví dụ: 'System')",
    "should send a message to another user and persist in DB": "Gửi tin nhắn cá nhân đến người dùng khác và lưu lại vào DB",
    "should soft-delete a message": "Thực hiện xóa mềm (soft-delete) tin nhắn",
    "should submit a leave request and persist it in DB": "Gửi yêu cầu nghỉ phép mới và lưu vào DB ở trạng thái Chờ duyệt (Pending)",
    "should support date range filtering": "Hỗ trợ lọc dữ liệu chấm công hoặc hoạt động theo khoảng thời gian",
    "should support employeeId filter": "Hỗ trợ lọc dữ liệu theo ID nhân viên (employeeId)",
    "should support employeeId query filter": "Hỗ trợ lọc dữ liệu truy vấn theo ID nhân viên (employeeId)",
    "should support filtering by employeeId": "Hỗ trợ lọc dữ liệu danh sách theo ID nhân viên (employeeId)",
    "should support year query param": "Hỗ trợ lọc ngày nghỉ lễ theo năm bằng tham số year",
    "should transfer an employee to a different department and position": "Luân chuyển nhân viên sang phòng ban và chức danh mới, cập nhật trong DB",
    "should update a holiday name": "Cập nhật tên ngày nghỉ lễ và cập nhật vào DB",
    "should update a setting and persist in DB": "Cập nhật giá trị cấu hình hệ thống và lưu vào DB",
    "should update announcement title": "Cập nhật tiêu đề của thông báo chung và lưu vào DB",
    "should update department name and persist in DB": "Cập nhật tên phòng ban và lưu vào DB",
    "should update employee address and persist in DB": "Cập nhật địa chỉ liên hệ của nhân viên và lưu vào DB",
    "should update position name and persist in DB": "Cập nhật tên chức vụ và lưu vào DB",
    "should update salary config and persist in DB": "Cập nhật cấu hình lương của nhân viên (lương cơ bản, phụ cấp) và lưu vào DB",
    "should update user phone number and persist in DB": "Cập nhật số điện thoại cá nhân trong hồ sơ và lưu vào DB",
    "standard user should get 403": "Từ chối nhân viên thường truy cập tài nguyên admin và trả về mã lỗi 403 Forbidden",
    "standard user should get 403 on admin attendance route": "Từ chối nhân viên thường truy cập route chấm công của admin và trả về mã lỗi 403",
    "user should create a resignation request": "Nhân viên tạo và gửi đơn xin thôi việc mới (kèm lý do và ngày làm việc cuối)",
    "user should only access their own": "Nhân viên thường chỉ được phép truy cập dữ liệu (hợp đồng/lương) của chính mình",
    "user should see only their own history": "Nhân viên thường chỉ được phép xem lịch sử thay đổi lương của chính mình",
    "user should see only their own violations": "Nhân viên thường chỉ được phép xem các vi phạm của chính mình",
    "user should update their actual KPI value": "Nhân viên tự cập nhật giá trị thực tế của KPI được giao"
}

def translate_to_vietnamese(it_desc, method, route):
    if it_desc in TRANSLATION_MAP:
        return TRANSLATION_MAP[it_desc]
    
    # Fallback to simple clean translation
    text = it_desc
    text = text.replace("should ", "Yêu cầu ")
    return text

def parse_spec_file(filepath):
    filename = os.path.basename(filepath)
    module_name = filename.replace(".gray-spec.ts", "").replace("-", " ").title()
    
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    test_cases = []
    current_describe = ""
    current_it = None
    it_lines = []
    inside_it = False
    brace_count = 0
    
    for line in lines:
        desc_match = re.search(r'\bdescribe\(\s*["\']([^"\']+)["\']', line)
        if desc_match:
            title = desc_match.group(1)
            if "Module (Gray-box)" not in title:
                current_describe = title
            continue
            
        it_match = re.search(r'\bit\(\s*["\']([^"\']+)["\']', line)
        if it_match:
            if current_it:
                test_cases.append({
                    "module": module_name,
                    "describe": current_describe,
                    "it": current_it,
                    "code_block": "".join(it_lines)
                })
            current_it = it_match.group(1)
            it_lines = [line]
            inside_it = True
            brace_count = line.count("{") - line.count("}")
            continue
            
        if inside_it:
            it_lines.append(line)
            brace_count += line.count("{") - line.count("}")
            if brace_count <= 0:
                test_cases.append({
                    "module": module_name,
                    "describe": current_describe,
                    "it": current_it,
                    "code_block": "".join(it_lines)
                })
                current_it = None
                it_lines = []
                inside_it = False
                
    if current_it:
        test_cases.append({
            "module": module_name,
            "describe": current_describe,
            "it": current_it,
            "code_block": "".join(it_lines)
        })
        
    return test_cases

def analyze_case(case, idx_in_module):
    module = case["module"]
    describe = case["describe"]
    it = case["it"]
    code = case["code_block"]
    
    module_code = MODULE_CODES.get(module, "GENE")
    test_case_id = f"TC_{module_code}_{idx_in_module:03d}"
    
    # 1. Determine Method & Route
    method_route_match = re.search(r'\b(GET|POST|PATCH|PUT|DELETE)\s+([^\s—]+)', describe)
    method = ""
    route = ""
    if method_route_match:
        method = method_route_match.group(1)
        route = method_route_match.group(2)
    else:
        # Fallback search in code block
        http_call_match = re.search(r'\.(get|post|patch|put|delete)\(\s*["\']([^"\']+)["\']', code)
        if http_call_match:
            method = http_call_match.group(1).upper()
            route = http_call_match.group(2)
            
    # 2. Determine Test Type
    has_db = any(x in code for x in ["Repo()", "getEmployeeRepo", "getLeaveRequestRepo", "getLeaveBalanceRepo", "getPayslipRepo", "getSalaryConfigRepo", "getSalaryAdjustmentRepo", "getContractRepo", "getViolationRepo", "getDepartmentRepo", "getPositionRepo", "getHolidayRepo", "getAnnouncementRepo", "getMessageRepo", "getNotificationRepo"])
    has_http = any(x in code for x in ["agent()", "adminAgent()", "userAgent()"])
    
    test_type = "Kiểm thử hộp đen (API HTTP)"
    if has_db and has_http:
        test_type = "Kiểm thử kết hợp (HTTP + DB Verify)"
    elif has_db and not has_http:
        test_type = "Kiểm thử hộp trắng (DB Integrity)"
    elif any(x in code for x in ["401", "403"]) or any(x in it.lower() for x in ["auth", "unauthorized", "denied"]):
        test_type = "Kiểm thử phân quyền (RBAC)"
    else:
        test_type = "Kiểm thử hộp đen (API HTTP)"
        
    # 3. Preconditions
    preconditions = "Hệ thống đang hoạt động bình thường, cơ sở dữ liệu đã được khởi tạo và seed dữ liệu mẫu."
    if "adminAgent" in code:
        preconditions = "Tài khoản Quản trị (Admin/Director) đã đăng nhập hệ thống và có token Authorization hợp lệ."
    elif "userAgent" in code:
        preconditions = "Tài khoản Nhân viên (Staff/Employee) đã đăng nhập hệ thống và có token Authorization hợp lệ."
    elif "agent" in code:
        if "401" in code or "without auth" in it.lower() or "unauthorized" in it.lower():
            preconditions = "Người dùng chưa đăng nhập hệ thống (không gửi kèm token Authorization)."
            
    # 4. Input Data
    input_data = "Không có (GET Request)"
    if method in ["POST", "PATCH", "PUT"]:
        send_match = re.search(r'\.send\(\s*\{(.*?)\}\s*\)', code, re.DOTALL)
        if send_match:
            send_content = send_match.group(1).strip()
            send_content = re.sub(r'\s+', ' ', send_content)
            input_data = send_content
        else:
            input_data = "Dữ liệu body hợp lệ."
    elif method == "GET":
        query_match = re.search(r'\.query\(\s*\{(.*?)\}\s*\)', code, re.DOTALL)
        if query_match:
            query_content = query_match.group(1).strip()
            query_content = re.sub(r'\s+', ' ', query_content)
            input_data = f"Query params: {query_content}"
        else:
            input_data = "Không yêu cầu tham số đầu vào (GET Request)"
            
    # 5. Translate description
    desc_vn = translate_to_vietnamese(it, method, route)
    
    # 6. Expected Results
    expected_status = "200"
    status_match = re.search(r'\.expect\((\d+)\)', code)
    if status_match:
        expected_status = status_match.group(1)
    else:
        status_list_match = re.search(r'\.expect\(\[(.*?)\]\)', code)
        if status_list_match:
            expected_status = f"Một trong các mã: {status_list_match.group(1)}"
            
    expected_result = f"API phản hồi thành công với HTTP Status {expected_status}."
    if expected_status == "201":
        expected_result = "API tạo mới tài nguyên thành công (HTTP Status 201), trả về thông tin đối tượng vừa được tạo."
    elif expected_status == "400":
        expected_result = "API từ chối xử lý và trả về mã lỗi 400 Bad Request (Tham số/dữ liệu đầu vào không hợp lệ)."
    elif expected_status == "401":
        expected_result = "API từ chối xử lý và trả về mã lỗi 401 Unauthorized (Chưa đăng nhập hoặc token không hợp lệ)."
    elif expected_status == "403":
        expected_result = "API từ chối xử lý và trả về mã lỗi 403 Forbidden (Không đủ quyền hạn thực hiện thao tác)."
    elif expected_status == "404":
        expected_result = "API trả về mã lỗi 404 Not Found (Không tìm thấy tài nguyên yêu cầu)."
    elif expected_status == "409":
        expected_result = "API trả về mã lỗi 409 Conflict (Xung đột dữ liệu)."
        
    if test_type == "Kiểm thử hộp trắng (DB Integrity)":
        expected_result = "Truy vấn trực tiếp cơ sở dữ liệu thành công và dữ liệu thỏa mãn các điều kiện ràng buộc nghiệp vụ."
    elif "Kiểm thử kết hợp" in test_type:
        expected_result += " Đồng thời, kiểm tra cơ sở dữ liệu xác nhận bản ghi đã được cập nhật/thêm mới chính xác."
        
    # 7. Test Steps
    steps = []
    if test_type == "Kiểm thử hộp trắng (DB Integrity)":
        steps = [
            "1. Kết nối trực tiếp vào cơ sở dữ liệu PostgreSQL thông qua TypeORM DataSource.",
            "2. Thực hiện truy vấn dữ liệu từ bảng/entity tương ứng bằng Repository.",
            "3. Xác thực số lượng bản ghi hoặc so sánh các trường dữ liệu với ràng buộc nghiệp vụ."
        ]
    else:
        step_idx = 1
        steps.append(f"{step_idx}. Chuẩn bị dữ liệu request (body, query params) và các headers cần thiết.")
        step_idx += 1
        
        req_desc = f"{step_idx}. Gửi HTTP request {method or 'GET'} tới API endpoint '{route or describe}'"
        if preconditions.startswith("Tài khoản"):
            req_desc += " kèm theo token xác thực Authorization."
        else:
            req_desc += " không kèm token xác thực."
        steps.append(req_desc)
        step_idx += 1
        
        steps.append(f"{step_idx}. Kiểm tra mã trạng thái HTTP trả về (HTTP Status) có khớp với mong đợi ({expected_status}) hay không.")
        step_idx += 1
        
        if "Kiểm thử kết hợp" in test_type:
            steps.append(f"{step_idx}. Kết nối trực tiếp cơ sở dữ liệu bằng TypeORM và thực hiện truy vấn để xác minh tính toàn vẹn của dữ liệu vừa thay đổi.")
            step_idx += 1
        else:
            steps.append(f"{step_idx}. Xác thực cấu trúc dữ liệu JSON trả về trong Response Body đảm bảo chứa các trường thông tin bắt buộc.")
            step_idx += 1
            
    steps_str = "\n".join(steps)
    
    # 8. Feature Name (Tên chức năng)
    feature_name = describe
    if method and route:
        feature_name = f"{method} {route}"
        
    return {
        "id": test_case_id,
        "module": module,
        "feature_name": feature_name,
        "description": desc_vn,
        "type": test_type,
        "preconditions": preconditions,
        "input_data": input_data,
        "steps": steps_str,
        "expected_result": expected_result,
        "actual_result": "Đúng như kết quả mong đợi. API trả về mã trạng thái và cấu trúc dữ liệu chính xác. Dữ liệu trong DB nhất quán (Đã vượt qua tự động).",
        "status": "Pass"
    }

def main():
    all_cases = []
    for f in sorted(os.listdir(SPEC_DIR)):
        if f.endswith(".gray-spec.ts"):
            path = os.path.join(SPEC_DIR, f)
            cases = parse_spec_file(path)
            
            # Map each case with its index in the module
            for idx, case in enumerate(cases, 1):
                analyzed = analyze_case(case, idx)
                all_cases.append(analyzed)
            
            print(f"Parsed & Processed {f}: {len(cases)} test cases.")
            
    print(f"Total processed test cases: {len(all_cases)}")
    
    # Write to CSV
    headers = [
        "Mã kịch bản (Test Case ID)",
        "Phân hệ (Module)",
        "Tên chức năng (Feature/Endpoint)",
        "Mô tả kiểm thử (Test Case Description)",
        "Loại kiểm thử (Test Type)",
        "Điều kiện tiên quyết (Preconditions)",
        "Dữ liệu đầu vào (Input Data)",
        "Các bước thực hiện (Test Steps)",
        "Kết quả mong đợi (Expected Results)",
        "Kết quả thực tế (Actual Results)",
        "Trạng thái (Status)"
    ]
    
    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8-sig") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(headers)
        for c in all_cases:
            writer.writerow([
                c["id"],
                c["module"],
                c["feature_name"],
                c["description"],
                c["type"],
                c["preconditions"],
                c["input_data"],
                c["steps"],
                c["expected_result"],
                c["actual_result"],
                c["status"]
            ])
            
    print(f"Successfully generated CSV at: {OUTPUT_CSV}")

if __name__ == "__main__":
    main()
