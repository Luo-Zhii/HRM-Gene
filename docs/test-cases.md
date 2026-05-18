# Tài liệu Ca Kiểm thử IEEE-829 — Hệ thống HRM

> Chuẩn IEEE-829 | Tiếng Việt | Bao hàm toàn bộ 22 module
>
> **Ngày tạo:** 2026-05-18 | **Phiên bản:** 1.0

---

## Cấu trúc Ca Kiểm thử

Mỗi ca kiểm thử tuân theo chuẩn IEEE-829 với các trường:

| Trường | Mô tả |
|--------|-------|
| **TC-ID** | Mã định danh duy nhất: `TC-{MODULE}-{STT}` |
| **Hạng mục** | Endpoint / chức năng được kiểm thử |
| **Đầu vào** | Dữ liệu, tham số, body, header |
| **Đầu ra mong đợi** | HTTP status, cấu trúc response, thay đổi DB |
| **Yêu cầu môi trường** | Database state, tài khoản, file, biến môi trường |
| **Thủ tục đặc biệt** | Các bước thực hiện, thứ tự, điều kiện tiên quyết |
| **Phụ thuộc** | Các TC phải chạy trước |

### Phân loại độ ưu tiên

| Mức | Ký hiệu | Mô tả |
|-----|---------|-------|
| P0 | Nghiêm trọng | Chức năng cốt lõi, crash hệ thống |
| P1 | Cao | Tính năng chính, ảnh hưởng người dùng |
| P2 | Trung bình | Tính năng phụ, edge case |
| P3 | Thấp | UI/UX, nice-to-have |

### Loại ca kiểm thử

- **BLACK-BOX** — Kiểm thử hộp đen (API endpoint)
- **WHITE-BOX** — Kiểm thử hộp trắng (logic nội bộ)
- **INTEGRATION** — Tích hợp liên module
- **WS** — WebSocket real-time

---

## 1. Module: Auth (Xác thực)

### TC-AUTH-01 — Đăng nhập thành công (P0 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /auth/login` |
| **Đầu vào** | `{ "email": "user@company.com", "password": "Pass@123" }` |
| **Đầu ra mong đợi** | **200** `{ success: true, user: { employee_id, email, first_name, last_name, ... }, access_token: "eyJ..." }` — Cookie `access_token` được set HttpOnly |
| **Yêu cầu môi trường** | DB có employee với email trên, `employment_status = 'Active'`, password đã hash bcrypt |
| **Thủ tục đặc biệt** | Gửi POST request không kèm Authorization header |
| **Phụ thuộc** | TC-EMPLOYEE-01 (tạo nhân viên) |

### TC-AUTH-02 — Đăng nhập sai mật khẩu (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /auth/login` |
| **Đầu vào** | `{ "email": "user@company.com", "password": "WrongPass" }` |
| **Đầu ra mong đợi** | **401** `{ error: "Invalid credentials" }` — Không có cookie |
| **Yêu cầu môi trường** | DB có employee với email trên, trạng thái Active |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | Không |

### TC-AUTH-03 — Đăng nhập tài khoản đã nghỉ việc quá ngày (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /auth/login` |
| **Đầu vào** | `{ "email": "terminated@company.com", "password": "Pass@123" }` |
| **Đầu ra mong đợi** | **401** `{ error: "Account has been deactivated" }` |
| **Yêu cầu môi trường** | Employee có `employment_status = 'Terminated'`, `resignation_date` đã qua |
| **Thủ tục đặc biệt** | Cần offboard nhân viên trước |
| **Phụ thuộc** | TC-EMPLOYEE-08 (offboard) |

### TC-AUTH-04 — Đăng nhập thiếu trường (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /auth/login` |
| **Đầu vào** | `{ "email": "user@company.com" }` (thiếu password) |
| **Đầu ra mong đợi** | **400** BadRequestException |
| **Yêu cầu môi trường** | Validation pipe hoạt động |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | Không |

### TC-AUTH-05 — Đăng xuất (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /auth/logout` |
| **Đầu vào** | Không có body |
| **Đầu ra mong đợi** | **201** `{ success: true }` — Cookie `access_token` bị xóa |
| **Yêu cầu môi trường** | Đang có cookie `access_token` hợp lệ |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-AUTH-06 — Lấy thông tin cá nhân (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /auth/profile` |
| **Đầu vào** | Authorization header / cookie JWT hợp lệ |
| **Đầu ra mong đợi** | **200** `Employee` object gồm: employee_id, email, first_name, last_name, department, position, bankInfo, permissions[] — **không** có password |
| **Yêu cầu môi trường** | Employee có department, position, bankInfo |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-AUTH-07 — Lấy thông tin không có token (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /auth/profile` |
| **Đầu vào** | Không có Authorization header, không có cookie |
| **Đầu ra mong đợi** | **401** UnauthorizedException |
| **Yêu cầu môi trường** | Không |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | Không |

### TC-AUTH-08 — Cập nhật hồ sơ cá nhân (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PATCH /auth/profile/update` |
| **Đầu vào** | `{ "first_name": "Nguyễn", "last_name": "Văn A", "phone_number": "0987654321", "address": "Hà Nội" }` |
| **Đầu ra mong đợi** | **200** — Profile đầy đủ với thông tin đã cập nhật |
| **Yêu cầu môi trường** | Đã đăng nhập |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-AUTH-09 — Upload avatar (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /auth/profile/avatar` |
| **Đầu vào** | Multipart form: `file` = ảnh JPG/PNG < 5MB |
| **Đầu ra mong đợi** | **201** — Profile với `avatar_url` đã cập nhật, file được lưu trong `./uploads/avatars/` |
| **Yêu cầu môi trường** | Thư mục `./uploads/avatars/` tồn tại, có quyền ghi |
| **Thủ tục đặc biệt** | Content-Type: multipart/form-data |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-AUTH-10 — Upload avatar sai định dạng (P3 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /auth/profile/avatar` |
| **Đầu vào** | Multipart form: `file` = file `.pdf` |
| **Đầu ra mong đợi** | **400** `{ message: "Only image files are allowed" }` |
| **Yêu cầu môi trường** | Không |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-AUTH-11 — Lấy navigation (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /auth/navigation` |
| **Đầu vào** | JWT của employee thường |
| **Đầu ra mong đợi** | **200** `{ main: [...], admin: [] }` — Admin rỗng với người dùng thường |
| **Yêu cầu môi trường** | Employee có position không phải Admin |
| **Thủ tục đặc biệt** | Response có header Cache-Control: no-cache |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-AUTH-12 — Đăng ký admin với secret key (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /auth/admin-register` |
| **Đầu vào** | `{ "email": "admin@company.com", "password": "Admin@123", "department_id": 1, "position_id": 1, "secretKey": "<ADMIN_SECRET_KEY>", "first_name": "Quản", "last_name": "Trị" }` |
| **Đầu ra mong đợi** | **201** `{ message: "Account created successfully", id: number }` |
| **Yêu cầu môi trường** | Biến môi trường `ADMIN_SECRET_KEY` được set |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-DEPT-01, TC-POS-01 |

### TC-AUTH-13 — Đăng ký admin sai secret key (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /auth/admin-register` |
| **Đầu vào** | `{ ..., "secretKey": "wrong-key" }` |
| **Đầu ra mong đợi** | **401** `{ message: "Invalid secret key" }` |
| **Yêu cầu môi trường** | `ADMIN_SECRET_KEY` được set, giá trị khác "wrong-key" |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | Không |

---

## 2. Module: Employees (Quản lý Nhân viên)

### TC-EMPLOYEE-01 — Tạo nhân viên mới (P0 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /employees` |
| **Đầu vào** | `{ "email": "newuser@company.com", "password": "Pass@123", "first_name": "Nguyễn", "last_name": "Văn B", "department_id": 1, "position_id": 2 }` |
| **Đầu ra mong đợi** | **201** — Employee object với các trường đã nhập, password đã hash bcrypt(10), có notification chào mừng |
| **Yêu cầu môi trường** | Department ID 1 và Position ID 2 tồn tại, email chưa được dùng |
| **Thủ tục đặc biệt** | Kiểm tra bảng notification có bản ghi chào mừng |
| **Phụ thuộc** | TC-DEPT-01, TC-POS-01 |

### TC-EMPLOYEE-02 — Tạo nhân viên trùng email (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /employees` |
| **Đầu vào** | `{ "email": "newuser@company.com", ... }` (email đã tồn tại) |
| **Đầu ra mong đợi** | **409** Conflict — `{ message: "Email already exists" }` |
| **Yêu cầu môi trường** | DB có employee với email trên |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-EMPLOYEE-01 |

### TC-EMPLOYEE-03 — Tạo nhân viên thiếu trường bắt buộc (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /employees` |
| **Đầu vào** | `{ "email": "test@company.com" }` (thiếu password, first_name, last_name) |
| **Đầu ra mong đợi** | **400** BadRequestException — validation error |
| **Yêu cầu môi trường** | Validation pipe hoạt động |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | Không |

### TC-EMPLOYEE-04 — Lấy danh sách toàn bộ nhân viên (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /employees` |
| **Đầu vào** | JWT hợp lệ (Admin) |
| **Đầu ra mong đợi** | **200** — Mảng Employee[] kèm base_salary, department, position |
| **Yêu cầu môi trường** | DB có ít nhất 1 employee |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-EMPLOYEE-05 — Xem danh bạ nhân viên (public) (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /employees/directory` hoặc `GET /employees/staff-directory` |
| **Đầu vào** | JWT của nhân viên phòng ban X |
| **Đầu ra mong đợi** | **200** — Chỉ hiển thị nhân viên Active cùng phòng ban; không có phone_number, address, bankInfo, password |
| **Yêu cầu môi trường** | Nhân viên thuộc department_id = 1 |
| **Thủ tục đặc biệt** | Row-level security: chỉ trả về employee cùng department |
| **Phụ thuộc** | TC-EMPLOYEE-01 |

### TC-EMPLOYEE-06 — Tìm kiếm nhân viên (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /employees/search?q=Nguyễn` |
| **Đầu vào** | Query param `q` = "Nguyễn" |
| **Đầu ra mong đợi** | **200** — Tối đa 5 kết quả: `[{ type: "employee", id, name, email }]` |
| **Yêu cầu môi trường** | DB có nhân viên tên "Nguyễn" |
| **Thủ tục đặc biệt** | Tìm kiếm ILIKE trên first_name, last_name, email |
| **Phụ thuộc** | TC-EMPLOYEE-01 |

### TC-EMPLOYEE-07 — Tìm kiếm với từ khóa quá ngắn (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /employees/search?q=A` |
| **Đầu vào** | Query param `q` = "A" (1 ký tự) |
| **Đầu ra mong đợi** | **400** — Yêu cầu tối thiểu 2 ký tự |
| **Yêu cầu môi trường** | Không |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | Không |

### TC-EMPLOYEE-08 — Offboard nhân viên (P0 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PATCH /employees/:id/offboard` |
| **Đầu vào** | `{ "employment_status": "Terminated", "resignation_reason": "Personal", "resignation_date": "2026-05-18" }` |
| **Đầu ra mong đợi** | **200** — Employee có `employment_status = 'Terminated'`, contract Active bị chấm dứt |
| **Yêu cầu môi trường** | Employee có ít nhất 1 contract Active |
| **Thủ tục đặc biệt** | Kiểm tra bảng contract: status → 'Terminated' |
| **Phụ thuộc** | TC-EMPLOYEE-01, TC-CONTRACT-01 |

### TC-EMPLOYEE-09 — Cập nhật thông tin nhân viên (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PATCH /employees/:id` |
| **Đầu vào** | `{ "first_name": "Trần", "department_id": 2 }` |
| **Đầu ra mong đợi** | **200** — Employee đã cập nhật. Nếu đang là manager của dept cũ → tự động gỡ quyền manager |
| **Yêu cầu môi trường** | Employee là manager của department 1 |
| **Thủ tục đặc biệt** | Kiểm tra department 1: manager_id → NULL |
| **Phụ thuộc** | TC-EMPLOYEE-01, TC-DEPT-02 |

### TC-EMPLOYEE-10 — Xóa nhân viên (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `DELETE /employees/:id` |
| **Đầu vào** | ID của employee |
| **Đầu ra mong đợi** | **200** — Employee bị xóa cứng khỏi DB |
| **Yêu cầu môi trường** | Employee tồn tại |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-EMPLOYEE-01 |

---

## 3. Module: Leave (Nghỉ phép)

### TC-LEAVE-01 — Nộp đơn nghỉ phép (P0 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /leave/request` |
| **Đầu vào** | `{ "leave_type_id": 1, "start_date": "2026-05-20", "end_date": "2026-05-22", "reason": "Nghỉ việc riêng" }` |
| **Đầu ra mong đợi** | **201** `{ request_id, status: "Pending", message: "Leave request submitted successfully" }` — Notification gửi đến Admin/HR/Director qua WebSocket |
| **Yêu cầu môi trường** | LeaveType ID 1 tồn tại, Employee tồn tại và Active |
| **Thủ tục đặc biệt** | Kiểm tra bảng notification có bản ghi cho từng Admin |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-LEAVE-02 — Nộp đơn với LeaveType không tồn tại (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /leave/request` |
| **Đầu vào** | `{ "leave_type_id": 9999, ... }` |
| **Đầu ra mong đợi** | **404** NotFoundException — `{ message: "Leave type not found" }` |
| **Yêu cầu môi trường** | Không có LeaveType ID 9999 |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | Không |

### TC-LEAVE-03 — Duyệt đơn nghỉ phép (Approved) (P0 — INTEGRATION)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PATCH /leave/request/:id/approve` |
| **Đầu vào** | `{ "status": "Approved", "reason": "Đồng ý" }` — Admin JWT |
| **Đầu ra mong đợi** | **200** `{ request_id, status: "Approved", message }` — LeaveBalance bị trừ ngày làm việc (T2-T6), notification gửi cho nhân viên |
| **Yêu cầu môi trường** | LeaveRequest ở trạng thái Pending, Admin có quyền `manage:leave` |
| **Thủ tục đặc biệt** | Kiểm tra LeaveBalance: remaining_days giảm đúng số ngày làm việc; nếu chưa có balance → tự tạo mới |
| **Phụ thuộc** | TC-LEAVE-01 |

### TC-LEAVE-04 — Từ chối đơn nghỉ phép (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PATCH /leave/request/:id/approve` |
| **Đầu vào** | `{ "status": "Rejected", "reason": "Không phù hợp thời điểm" }` |
| **Đầu ra mong đợi** | **200** — Trạng thái thành Rejected, không thay đổi LeaveBalance |
| **Yêu cầu môi trường** | LeaveRequest Pending |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-LEAVE-01 |

### TC-LEAVE-05 — Từ chối đơn đã Approved → hoàn lại ngày phép (P1 — INTEGRATION)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PATCH /leave/request/:id/approve` |
| **Đầu vào** | `{ "status": "Rejected" }` lên đơn đã Approved |
| **Đầu ra mong đợi** | **200** — LeaveBalance được hoàn lại số ngày đã trừ trước đó |
| **Yêu cầu môi trường** | LeaveRequest ở trạng thái Approved, đã có LeaveBalance bị trừ |
| **Thủ tục đặc biệt** | Kiểm tra remaining_days tăng đúng số ngày đã trừ |
| **Phụ thuộc** | TC-LEAVE-03 |

### TC-LEAVE-06 — Xem số dư nghỉ phép (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /leave/balance` |
| **Đầu vào** | JWT của nhân viên |
| **Đầu ra mong đợi** | **200** `[{ balance_id, leave_type_name, remaining_days }]` |
| **Yêu cầu môi trường** | Nhân viên có ít nhất 1 LeaveBalance |
| **Thủ tục đặc biệt** | Tự động lấy employee_id từ JWT |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-LEAVE-07 — Xem danh sách đơn nghỉ phép của mình (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /leave/my-requests` |
| **Đầu vào** | JWT của nhân viên |
| **Đầu ra mong đợi** | **200** — Mảng leave requests kèm leave_type_name, manager_approver email, admin_note |
| **Yêu cầu môi trường** | Nhân viên đã nộp ít nhất 1 đơn |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-LEAVE-01 |

### TC-LEAVE-08 — Admin xem danh sách đơn chờ duyệt (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /leave/pending-requests` |
| **Đầu vào** | JWT của Admin có quyền `manage:leave` |
| **Đầu ra mong đợi** | **200** `{ data: [...], stats: { total, pending, approved, rejected } }` |
| **Yêu cầu môi trường** | Có ít nhất 1 leave request |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-LEAVE-01 |

### TC-LEAVE-09 — Duyệt đơn với trạng thái Approved_By_Manager (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PATCH /leave/request/:id/approve` |
| **Đầu vào** | `{ "status": "Approved_By_Manager" }` |
| **Đầu ra mong đợi** | **200** — Trạng thái cập nhật thành Approved_By_Manager |
| **Yêu cầu môi trường** | LeaveRequest Pending |
| **Thủ tục đặc biệt** | Khấu trừ ngày phép tương tự Approved |
| **Phụ thuộc** | TC-LEAVE-01 |

---

## 4. Module: Timekeeping (Chấm công)

### TC-TK-01 — Tạo mã QR động (P0 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /timekeeping/dynamic-qr` |
| **Đầu vào** | JWT hợp lệ |
| **Đầu ra mong đợi** | **200** `{ token: "uuid-v4-string" }` |
| **Yêu cầu môi trường** | Không |
| **Thủ tục đặc biệt** | Token có TTL 35 giây, lưu trong Map bộ nhớ |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-TK-02 — Check-in bằng QR (P0 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /timekeeping/check-in/qr` |
| **Đầu vào** | `{ "token": "<uuid-từ-TC-TK-01>" }` |
| **Đầu ra mong đợi** | **201** `{ status: "CHECK_IN", time: "...", message: "Check-in thành công lúc HH:mm", timekeeping_id: N }` — Trạng thái "Late" nếu sau 08:30, "Present" nếu trước |
| **Yêu cầu môi trường** | Token QR chưa hết hạn (35s), chưa có bản ghi check-in hôm nay |
| **Thủ tục đặc biệt** | Token bị xóa khỏi Map sau khi dùng |
| **Phụ thuộc** | TC-TK-01 |

### TC-TK-03 — Check-in QR với token hết hạn (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /timekeeping/check-in/qr` |
| **Đầu vào** | `{ "token": "expired-or-invalid-uuid" }` |
| **Đầu ra mong đợi** | **400** `{ message: "Mã QR không hợp lệ hoặc đã hết hạn" }` |
| **Yêu cầu môi trường** | Token không tồn tại trong Map |
| **Thủ tục đặc biệt** | Đợi 36 giây sau khi tạo token |
| **Phụ thuộc** | TC-TK-01 |

### TC-TK-04 — Check-out bằng QR (P0 — INTEGRATION)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /timekeeping/check-in/qr` |
| **Đầu vào** | `{ "token": "<uuid>" }` — khi đã check-in trước đó |
| **Đầu ra mong đợi** | **201** `{ status: "CHECK_OUT", time: "...", duration: N, message: "Check-out thành công. Thời gian làm việc: N giờ", timekeeping_id: N }` |
| **Yêu cầu môi trường** | Đã có bản ghi check-in hôm nay, chưa check-out |
| **Thủ tục đặc biệt** | Kiểm tra hours_worked. Nếu < 8 → tự động tạo Violation "Incomplete Shift" |
| **Phụ thuộc** | TC-TK-02 |

### TC-TK-05 — Check-out với hours_worked < 8 (tự động tạo vi phạm) (P0 — INTEGRATION)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /timekeeping/check-in/qr` (check-out) |
| **Đầu vào** | Token QR, check-out sau 4 giờ làm |
| **Đầu ra mong đợi** | **201** — Ngoài kết quả check-out, DB có thêm 1 Violation (Incomplete Shift, PENDING) và 1 Notification cảnh báo |
| **Yêu cầu môi trường** | Đã check-in, check-out với hours_worked < 8 |
| **Thủ tục đặc biệt** | Kiểm tra bảng violation và notification |
| **Phụ thuộc** | TC-TK-02 |

### TC-TK-06 — Debounce 60 giây (P2 — WHITE-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /timekeeping/check-in/qr` |
| **Đầu vào** | Gửi 2 request check-in liên tiếp trong vòng 60 giây |
| **Đầu ra mong đợi** | Request thứ 2 bị từ chối — `{ message: "Vui lòng đợi trước khi thực hiện thao tác tiếp theo" }` |
| **Yêu cầu môi trường** | Đã check-in lần 1 |
| **Thủ tục đặc biệt** | Gửi request thứ 2 trong vòng 60 giây |
| **Phụ thuộc** | TC-TK-02 |

### TC-TK-07 — Check-in bằng IP (whitelist) (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /timekeeping/check-in/ip` |
| **Đầu vào** | JWT + IP client nằm trong whitelist |
| **Đầu ra mong đợi** | **201** `{ status: "CHECK_IN", ... }` — SHIFT_START là 18:30 (ca tối) |
| **Yêu cầu môi trường** | `COMPANY_IP_WHITELIST` setting chứa IP client |
| **Thủ tục đặc biệt** | IPWhitelistGuard kiểm tra trước khi vào service |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-TK-08 — Check-in IP bị từ chối (IP không trong whitelist) (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /timekeeping/check-in/ip` |
| **Đầu vào** | JWT + IP không trong whitelist |
| **Đầu ra mong đợi** | **403** ForbiddenException |
| **Yêu cầu môi trường** | IP client không có trong `COMPANY_IP_WHITELIST` |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-TK-09 — Admin xem báo cáo chấm công (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /attendance/admin/all?page=1&limit=50&startDate=2026-05-01&endDate=2026-05-18` |
| **Đầu vào** | JWT Admin có quyền `manage:system` |
| **Đầu ra mong đợi** | **200** `{ data: TimeKeeping[], stats: { totalEmployees, present, late, absent }, total, page, limit, totalPages }` |
| **Yêu cầu môi trường** | Có dữ liệu chấm công trong tháng 5/2026 |
| **Thủ tục đặc biệt** | Mặc định 30 ngày nếu không có startDate/endDate |
| **Phụ thuộc** | TC-TK-02 |

---

## 5. Module: Payroll (Bảng lương)

### TC-PAYROLL-01 — Tạo bảng lương hàng loạt (P0 — INTEGRATION)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /payroll/generate` |
| **Đầu vào** | `{ "month": 5, "year": 2026 }` — Admin JWT (`manage:payroll`) |
| **Đầu ra mong đợi** | **201** `{ period_id, month, year, generated, total_gross, total_deductions, total_net, total_bonus }` — Mỗi employee có 1 payslip |
| **Yêu cầu môi trường** | Có employee + SalaryConfig + TimeKeeping tháng 5; PayrollPeriod chưa tồn tại |
| **Thủ tục đặc biệt** | Pipeline: timekeeping → leave → adjustments → KPI → OT → insurance (10.5%) → PIT (7 bậc) → net |
| **Phụ thuộc** | TC-EMPLOYEE-01, TC-TK-02 |

### TC-PAYROLL-02 — Tạo lại bảng lương tháng đã có (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /payroll/generate` |
| **Đầu vào** | `{ "month": 5, "year": 2026 }` — khi PayrollPeriod đã tồn tại |
| **Đầu ra mong đợi** | UPSERT payslip (không tạo period mới) |
| **Yêu cầu môi trường** | PayrollPeriod tháng 5/2026 đã tồn tại |
| **Thủ tục đặc biệt** | Kiểm tra payslip được cập nhật, không bị duplicate |
| **Phụ thuộc** | TC-PAYROLL-01 |

### TC-PAYROLL-03 — Tạo bảng lương đơn lẻ (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /payroll/generate-single` |
| **Đầu vào** | `{ "employee_id": 1, "month": 5, "year": 2026 }` |
| **Đầu ra mong đợi** | **201** — Payslip detail đầy đủ: earnings breakdown, deductions (insurance + PIT), net_pay_in_words |
| **Yêu cầu môi trường** | Employee 1 có SalaryConfig |
| **Thủ tục đặc biệt** | Kiểm tra net_pay_in_words đúng định dạng tiếng Việt |
| **Phụ thuộc** | TC-EMPLOYEE-01 |

### TC-PAYROLL-04 — Nhân viên không có SalaryConfig (P1 — WHITE-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /payroll/generate` |
| **Đầu vào** | `{ "month": 5, "year": 2026 }` — có employee thiếu SalaryConfig |
| **Đầu ra mong đợi** | Employee đó bị bỏ qua (log cảnh báo), các employee khác vẫn được tạo payslip |
| **Yêu cầu môi trường** | Ít nhất 1 employee không có SalaryConfig |
| **Thủ tục đặc biệt** | Kiểm tra log server |
| **Phụ thuộc** | TC-EMPLOYEE-01 |

### TC-PAYROLL-05 — Tính KPI bonus (chỉ khi baseSalary >= 10M) (P1 — WHITE-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /payroll/generate` |
| **Đầu vào** | Employee A: base_salary = 12M, KPI score = 90, kpi_bonus_percentage = 30%; Employee B: base_salary = 8M, KPI score = 90 |
| **Đầu ra mong đợi** | Employee A: bonus = (90/100) * (12M * 30%) = 3.24M; Employee B: bonus = 0 |
| **Yêu cầu môi trường** | KPI period, assignments đã có |
| **Thủ tục đặc biệt** | Kiểm tra công thức tính trong payslip |
| **Phụ thuộc** | TC-KPI-01, TC-KPI-06 |

### TC-PAYROLL-06 — Tính PIT 7 bậc lũy tiến (P1 — WHITE-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /payroll/generate` — verify PIT calculation |
| **Đầu vào** | Thu nhập tính thuế = 20M, giảm trừ bản thân = 11M, 1 người phụ thuộc = 4.4M |
| **Đầu ra mong đợi** | Thu nhập chịu thuế = 20M - 11M - 4.4M = 4.6M → bậc 1 (5%) = 230,000 VND |
| **Yêu cầu môi trường** | SalaryConfig có dependents_count = 1 |
| **Thủ tục đặc biệt** | Tính tay để đối chiếu |
| **Phụ thuộc** | TC-PAYROLL-01 |

### TC-PAYROLL-07 — Xem danh sách payslip (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /payroll/list?month=5&year=2026` |
| **Đầu vào** | Admin JWT (`manage:payroll`) |
| **Đầu ra mong đợi** | **200** — Mảng Payslip[] kèm employee, department, payroll_period |
| **Yêu cầu môi trường** | Đã generate payslip tháng 5/2026 |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-PAYROLL-01 |

### TC-PAYROLL-08 — Nhân viên xem payslip của mình (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /payroll/my-payslips` |
| **Đầu vào** | JWT của nhân viên |
| **Đầu ra mong đợi** | **200** — Payslip[] của nhân viên đó, sắp xếp mới nhất trước |
| **Yêu cầu môi trường** | Nhân viên đã có payslip |
| **Thủ tục đặc biệt** | Tự động lấy employee_id từ JWT |
| **Phụ thuộc** | TC-PAYROLL-01 |

### TC-PAYROLL-09 — Duyệt payslip (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PATCH /payroll/:id/approve` |
| **Đầu vào** | Admin JWT |
| **Đầu ra mong đợi** | **200** — Payslip status → APPROVED, notification gửi cho nhân viên |
| **Yêu cầu môi trường** | Payslip ở trạng thái PENDING |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-PAYROLL-01 |

### TC-PAYROLL-10 — Đánh dấu đã thanh toán (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PATCH /payroll/:id/mark-paid` |
| **Đầu vào** | Admin JWT |
| **Đầu ra mong đợi** | **200** — Payslip status → PAID, notification gửi kèm số tiền net đã format |
| **Yêu cầu môi trường** | Payslip đã APPROVED |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-PAYROLL-09 |

### TC-PAYROLL-11 — Duyệt hàng loạt payslip (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /payroll/approve-all` |
| **Đầu vào** | `{ "month": 5, "year": 2026 }` |
| **Đầu ra mong đợi** | **201** — Tất cả payslip PENDING → APPROVED, mỗi nhân viên nhận 1 notification |
| **Yêu cầu môi trường** | Có ít nhất 2 payslip PENDING |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-PAYROLL-01 |

### TC-PAYROLL-12 — Cấu hình lương (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PATCH /payroll/config/:employeeId` |
| **Đầu vào** | `{ "base_salary": "15000000", "transport_allowance": "500000", "lunch_allowance": "700000", "responsibility_allowance": "2000000", "kpi_bonus_percentage": 30 }` |
| **Đầu ra mong đợi** | **200** — SalaryConfig created/updated |
| **Yêu cầu môi trường** | Employee tồn tại |
| **Thủ tục đặc biệt** | Nếu chưa có config → INSERT; nếu có → UPDATE |
| **Phụ thuộc** | TC-EMPLOYEE-01 |

### TC-PAYROLL-13 — Tạo điều chỉnh lương (Bonus/Penalty) (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /payroll/adjustments` |
| **Đầu vào** | `{ "employee_id": 1, "type": "Bonus", "amount": "2000000", "applied_month": "05/2026", "reason": "Thưởng dự án" }` |
| **Đầu ra mong đợi** | **201** — SalaryAdjustment (status: Pending), notification cho nhân viên |
| **Yêu cầu môi trường** | Employee tồn tại |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-EMPLOYEE-01 |

---

## 6. Module: KPI (Đánh giá Hiệu suất)

### TC-KPI-01 — Tạo thư viện KPI (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /kpi/library` |
| **Đầu vào** | `{ "name": "Doanh số bán hàng", "unit": "VND", "calculation_formula": "actual/target*100" }` — Admin (`manage:system`) |
| **Đầu ra mong đợi** | **201** — KpiLibrary object |
| **Yêu cầu môi trường** | Không |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-KPI-02 — Tạo kỳ đánh giá KPI (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /kpi/period` |
| **Đầu vào** | `{ "name": "KPI Quý 2/2026", "start_date": "2026-04-01", "end_date": "2026-06-30" }` |
| **Đầu ra mong đợi** | **201** — KpiPeriod object |
| **Yêu cầu môi trường** | Không |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-KPI-03 — Gán KPI cho nhân viên (P0 — INTEGRATION)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /kpi/assign` |
| **Đầu vào** | `{ "employee_id": 1, "period_id": 1, "assignments": [{ "kpi_library_id": 1, "target_value": 100000000, "weight": 100 }] }` |
| **Đầu ra mong đợi** | **201** — Mảng KpiAssignment[], notification gửi cho nhân viên |
| **Yêu cầu môi trường** | Employee, Period, KpiLibrary tồn tại; tổng weight = 100 |
| **Thủ tục đặc biệt** | Xóa assignment cũ của employee trong period đó trước khi insert mới |
| **Phụ thuộc** | TC-EMPLOYEE-01, TC-KPI-01, TC-KPI-02 |

### TC-KPI-04 — Gán KPI với tổng weight khác 100% (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /kpi/assign` |
| **Đầu vào** | `{ ..., "assignments": [{ weight: 60 }, { weight: 30 }] }` (tổng = 90%) |
| **Đầu ra mong đợi** | **400** `{ message: "Tổng trọng số phải bằng 100%" }` |
| **Yêu cầu môi trường** | Không |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-KPI-01, TC-KPI-02 |

### TC-KPI-05 — Nhân viên cập nhật actual_value (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PATCH /kpi/assignment/:id/actual` |
| **Đầu vào** | `{ "actual_value": 85000000 }` — JWT của nhân viên được gán |
| **Đầu ra mong đợi** | **200** — Assignment updated, status → SUBMITTED |
| **Yêu cầu môi trường** | Assignment tồn tại, thuộc về nhân viên |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-KPI-03 |

### TC-KPI-06 — Quản lý chấm điểm KPI (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PATCH /kpi/assignment/:id/grade` |
| **Đầu vào** | `{ "manager_score": 90 }` — Admin/Manager JWT |
| **Đầu ra mong đợi** | **200** — Assignment updated, status → APPROVED |
| **Yêu cầu môi trường** | Assignment đã SUBMITTED |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-KPI-05 |

### TC-KPI-07 — Tính điểm KPI cuối cùng (P1 — WHITE-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /kpi/calculate-score?employee_id=1&period_id=1` |
| **Đầu vào** | Query params: employee_id, period_id |
| **Đầu ra mong đợi** | **200** — Số thực: `sum(achievement * weight/100)` với achievement = min(120, actual/target*100), dùng manager_score nếu có |
| **Yêu cầu môi trường** | Có assignment cho employee trong period |
| **Thủ tục đặc biệt** | Cap achievement ở 120% |
| **Phụ thuộc** | TC-KPI-06 |

### TC-KPI-08 — Xem KPI của tôi (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /kpi/my-performance?period_id=1` |
| **Đầu vào** | JWT nhân viên |
| **Đầu ra mong đợi** | **200** — Mảng assignment của nhân viên trong period |
| **Yêu cầu môi trường** | Đã được gán KPI |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-KPI-03 |

---

## 7. Module: Violations (Vi phạm)

### TC-VIOLATION-01 — Tạo vi phạm thủ công (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /violations` |
| **Đầu vào** | `{ "employee_id": 1, "violation_date": "2026-05-18", "violation_type": "Đi muộn", "description": "Đi muộn 30 phút", "deduction_amount": "100000", "severity": "MINOR", "status": "PENDING" }` |
| **Đầu ra mong đợi** | **201** — Violation object, notification gửi cho nhân viên |
| **Yêu cầu môi trường** | Admin có quyền `manage:employees` |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-EMPLOYEE-01 |

### TC-VIOLATION-02 — Đồng bộ chấm công thủ công (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /violations/sync-attendance` |
| **Đầu vào** | Admin JWT |
| **Đầu ra mong đợi** | **201** — Tạo violation "Incomplete Shift" cho tất cả timekeeping hôm nay có hours_worked < 8 |
| **Yêu cầu môi trường** | Có timekeeping hôm nay với hours_worked < 8 |
| **Thủ tục đặc biệt** | Không tạo trùng nếu đã có violation cho nhân viên hôm nay |
| **Phụ thuộc** | TC-TK-05 |

### TC-VIOLATION-03 — Cron tự động đồng bộ nửa đêm (P0 — WHITE-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `@Cron EVERY_DAY_AT_MIDNIGHT` — `handleDailyAttendanceSync()` |
| **Đầu vào** | Tự động kích hoạt lúc 00:00 |
| **Đầu ra mong đợi** | Tất cả timekeeping hôm qua có hours_worked < 8 → tạo violation; nếu có vi phạm mới → thông báo HR/Admin |
| **Yêu cầu môi trường** | Cron job được bật, có timekeeping thiếu giờ hôm qua |
| **Thủ tục đặc biệt** | Cần mock thời gian hoặc đợi cron thực |
| **Phụ thuộc** | TC-TK-05 |

### TC-VIOLATION-04 — Xem danh sách vi phạm (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /violations?employeeId=1` |
| **Đầu vào** | JWT hợp lệ |
| **Đầu ra mong đợi** | **200** `{ records: Violation[], stats: { total, resolved } }` |
| **Yêu cầu môi trường** | Có violation cho employee 1 |
| **Thủ tục đặc biệt** | Admin không truyền employeeId → xem tất cả |
| **Phụ thuộc** | TC-VIOLATION-01 |

### TC-VIOLATION-05 — Cập nhật vi phạm (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PATCH /violations/:id` |
| **Đầu vào** | `{ "status": "RESOLVED", "deduction_amount": "50000" }` |
| **Đầu ra mong đợi** | **200** — Violation đã cập nhật |
| **Yêu cầu môi trường** | Violation tồn tại |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-VIOLATION-01 |

---

## 8. Module: Resignations (Từ chức)

### TC-RESIGN-01 — Nộp đơn từ chức (P0 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /resignations` |
| **Đầu vào** | `{ "requested_last_day": "2026-06-18", "reason_text": "Chuyển công tác" }` |
| **Đầu ra mong đợi** | **201** — ResignationRequest (status: PENDING), notification gửi Admin/HR |
| **Yêu cầu môi trường** | Nhân viên Active, chưa có đơn PENDING nào |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-RESIGN-02 — Nộp đơn khi đã có đơn Pending (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /resignations` |
| **Đầu vào** | Như trên |
| **Đầu ra mong đợi** | **400** `{ message: "Bạn đã có đơn từ chức đang chờ xử lý" }` |
| **Yêu cầu môi trường** | Nhân viên đã có ResignationRequest PENDING |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-RESIGN-01 |

### TC-RESIGN-03 — Duyệt đơn từ chức (Approved) (P0 — INTEGRATION)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PATCH /resignations/:id` |
| **Đầu vào** | `{ "status": "APPROVED", "resignation_category": "Personal" }` |
| **Đầu ra mong đợi** | **200** — Employee: employment_status → TERMINATED, resignation_reason, resignation_date; Contract Active → Terminated; Notification gửi nhân viên |
| **Yêu cầu môi trường** | ResignationRequest PENDING, employee có contract Active |
| **Thủ tục đặc biệt** | Kiểm tra employee status và contract status sau khi approve |
| **Phụ thuộc** | TC-RESIGN-01, TC-CONTRACT-01 |

### TC-RESIGN-04 — Từ chối đơn từ chức (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PATCH /resignations/:id` |
| **Đầu vào** | `{ "status": "REJECTED" }` |
| **Đầu ra mong đợi** | **200** — ResignationRequest REJECTED, employee không bị thay đổi, notification gửi nhân viên |
| **Yêu cầu môi trường** | ResignationRequest PENDING |
| **Thủ tục đặc biệt** | Kiểm tra employee vẫn Active |
| **Phụ thuộc** | TC-RESIGN-01 |

---

## 9. Module: Notifications (Thông báo)

### TC-NOTIF-01 — Xem danh sách thông báo (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /notifications` |
| **Đầu vào** | JWT nhân viên |
| **Đầu ra mong đợi** | **200** — Tối đa 50 notification mới nhất, sắp xếp giảm dần |
| **Yêu cầu môi trường** | Có ít nhất 1 notification |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-NOTIF-02 — Đánh dấu đã đọc (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PATCH /notifications/:id/read` |
| **Đầu vào** | JWT của chủ notification |
| **Đầu ra mong đợi** | **200** — Notification.isRead → true |
| **Yêu cầu môi trường** | Notification thuộc về user |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-NOTIF-01 |

### TC-NOTIF-03 — Xóa thông báo (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `DELETE /notifications/:id` |
| **Đầu vào** | JWT của chủ notification |
| **Đầu ra mong đợi** | **200** — Notification bị xóa khỏi DB |
| **Yêu cầu môi trường** | Notification tồn tại, thuộc về user |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-NOTIF-01 |

### TC-NOTIF-04 — Gửi thông báo toàn công ty (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /notifications/announce` |
| **Đầu vào** | `{ "title": "Thông báo công ty", "message": "Họp toàn thể lúc 14h" }` — Admin/HR JWT |
| **Đầu ra mong đợi** | **201** `{ success: true, count: N }` — Mỗi employee có bật `announcements` nhận 1 notification |
| **Yêu cầu môi trường** | Người gửi có role admin/hr/hr manager/director |
| **Thủ tục đặc biệt** | Kiểm tra từng employee có bật preference `announcements` không |
| **Phụ thuộc** | TC-EMPLOYEE-01 |

### TC-NOTIF-05 — Gửi thông báo không đủ quyền (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /notifications/announce` |
| **Đầu vào** | JWT của nhân viên thường |
| **Đầu ra mong đợi** | **403** ForbiddenException |
| **Yêu cầu môi trường** | Không |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-NOTIF-06 — WebSocket: nhận thông báo real-time (P0 — WS)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | WebSocket `newNotification` event |
| **Đầu vào** | Kết nối Socket.io với cookie JWT, sau đó trigger tạo notification từ 1 service khác |
| **Đầu ra mong đợi** | Client nhận event `newNotification` với payload `{ id, title, message, type, link, isRead, createdAt }` |
| **Yêu cầu môi trường** | Client kết nối WebSocket thành công, user có bật preference tương ứng |
| **Thủ tục đặc biệt** | Cần WebSocket client (vd: Postman WebSocket, script) |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-NOTIF-07 — WebSocket: tắt preference thì không nhận (P1 — WS)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | WebSocket — kiểm tra preference filter |
| **Đầu vào** | Employee tắt `push_notifications`, trigger notification loại WARNING |
| **Đầu ra mong đợi** | Không emit event, notification không được lưu (trả về null) |
| **Yêu cầu môi trường** | Employee có `push_notifications = false` |
| **Thủ tục đặc biệt** | Kiểm tra DB không có notification mới |
| **Phụ thuộc** | TC-AUTH-08 |

---

## 10. Module: Announcements (Thông báo công ty)

### TC-ANNC-01 — Tạo announcement (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /announcements` |
| **Đầu vào** | `{ "title": "Lịch nghỉ lễ", "content": "...", "type": "general", "target_audience": "all", "priority": "normal", "status": "Active", "delivery_methods": ["in_app"] }` |
| **Đầu ra mong đợi** | **201** — Announcement, notification gửi cho toàn bộ employee (nếu có in_app) |
| **Yêu cầu môi trường** | Admin quyền `manage:system` |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-ANNC-02 — Announcement theo phòng ban (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /announcements` |
| **Đầu vào** | `{ ..., "target_audience": "dept_1" }` |
| **Đầu ra mong đợi** | **201** — Chỉ employee thuộc department 1 nhận notification |
| **Yêu cầu môi trường** | Department 1 có ít nhất 2 employee |
| **Thủ tục đặc biệt** | Kiểm tra employee department 2 không nhận notification |
| **Phụ thuộc** | TC-EMPLOYEE-01 |

### TC-ANNC-03 — Announcement không có in_app (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /announcements` |
| **Đầu vào** | `{ ..., "delivery_methods": ["email"] }` (không có 'in_app') |
| **Đầu ra mong đợi** | **201** — Announcement được lưu nhưng không gửi notification (email chưa implemented) |
| **Yêu cầu môi trường** | Không |
| **Thủ tục đặc biệt** | Kiểm tra bảng notification không có bản ghi mới |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-ANNC-04 — Xem feed thông báo (đã lọc theo dept) (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /announcements/feed` |
| **Đầu vào** | JWT nhân viên department 1 |
| **Đầu ra mong đợi** | **200** — Announcements có target_audience = 'all' hoặc 'dept_1', status = Active |
| **Yêu cầu môi trường** | Có announcement cho all và announcement cho dept_1, dept_2 |
| **Thủ tục đặc biệt** | Không thấy announcement của dept_2 |
| **Phụ thuộc** | TC-ANNC-01, TC-ANNC-02 |

---

## 11. Module: Messages (Nhắn tin 1:1)

### TC-MSG-01 — Gửi tin nhắn (P1 — BLACK-BOX + WS)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /messages` |
| **Đầu vào** | `{ "receiverId": 2, "content": "Chào bạn" }` — JWT của user 1 |
| **Đầu ra mong đợi** | **201** — Message object. User 2 nhận notification + WebSocket `newMessage` nếu online |
| **Yêu cầu môi trường** | Employee 1 và 2 tồn tại |
| **Thủ tục đặc biệt** | Kiểm tra WebSocket event trên client của user 2 |
| **Phụ thuộc** | TC-EMPLOYEE-01 |

### TC-MSG-02 — Xem hội thoại (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /messages/:otherUserId` |
| **Đầu vào** | JWT user 1, param = 2 |
| **Đầu ra mong đợi** | **200** — Mảng Message[] giữa user 1 và 2 |
| **Yêu cầu môi trường** | Đã có tin nhắn giữa 2 user |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-MSG-01 |

### TC-MSG-03 — Đánh dấu đã đọc (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PATCH /messages/:otherUserId/read` |
| **Đầu vào** | JWT user 2, param = 1 |
| **Đầu ra mong đợi** | **200** — Tất cả message từ user 1 gửi user 2: is_read → true |
| **Yêu cầu môi trường** | Có tin nhắn chưa đọc từ user 1 |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-MSG-01 |

### TC-MSG-04 — Xóa tin nhắn (soft delete) (P1 — BLACK-BOX + WS)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `DELETE /messages/:id` |
| **Đầu vào** | JWT của người gửi |
| **Đầu ra mong đợi** | **200** — Message: is_deleted = true, content → "..."; WebSocket `messageDeleted` emit cho cả sender và receiver |
| **Yêu cầu môi trường** | Message thuộc về người gửi |
| **Thủ tục đặc biệt** | Kiểm tra content đã bị thay thế, không xóa cứng |
| **Phụ thuộc** | TC-MSG-01 |

### TC-MSG-05 — Người nhận không thể xóa tin nhắn (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `DELETE /messages/:id` |
| **Đầu vào** | JWT của người nhận (không phải sender) |
| **Đầu ra mong đợi** | **403** ForbiddenException |
| **Yêu cầu môi trường** | Message có sender khác với người gọi API |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-MSG-01 |

---

## 12. Module: Comments (Bình luận)

### TC-COMMENT-01 — Thêm bình luận (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /comments` |
| **Đầu vào** | `{ "entityType": "LEAVE_REQUEST", "entityId": "1", "content": "Cần xem xét thêm" }` |
| **Đầu ra mong đợi** | **201** — Comment object (UUID id), notification gửi cho chủ entity |
| **Yêu cầu môi trường** | LeaveRequest ID 1 tồn tại |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-LEAVE-01 |

### TC-COMMENT-02 — Xem bình luận theo entity (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /comments/:entityType/:entityId` |
| **Đầu vào** | Params: LEAVE_REQUEST, 1 |
| **Đầu ra mong đợi** | **200** — Mảng Comment[] cho entity |
| **Yêu cầu môi trường** | Có comment cho entity |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-COMMENT-01 |

---

## 13. Module: Contracts (Hợp đồng)

### TC-CONTRACT-01 — Tạo hợp đồng (P0 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /contracts` |
| **Đầu vào** | `{ "employee_id": 1, "contract_number": "HD-2026-001", "contract_type": "Full-time", "start_date": "2026-05-01", "salary_rate": "15000000", "status": "Active" }` |
| **Đầu ra mong đợi** | **201** — Contract object, SalaryHistory được tạo từ SalaryConfig |
| **Yêu cầu môi trường** | Employee 1 có SalaryConfig, contract_number chưa tồn tại |
| **Thủ tục đặc biệt** | Kiểm tra bảng salary_history có bản ghi mới |
| **Phụ thuộc** | TC-EMPLOYEE-01, TC-PAYROLL-12 |

### TC-CONTRACT-02 — Tạo hợp đồng trùng mã (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /contracts` |
| **Đầu vào** | `{ "contract_number": "HD-2026-001", ... }` (mã đã tồn tại) |
| **Đầu ra mong đợi** | **409** Conflict — `{ message: "Số hợp đồng đã tồn tại" }` |
| **Yêu cầu môi trường** | Đã có contract với mã HD-2026-001 |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-CONTRACT-01 |

### TC-CONTRACT-03 — Tạo hợp đồng Active → tự động deactivate hợp đồng cũ (P1 — INTEGRATION)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /contracts` |
| **Đầu vào** | Tạo contract Active mới cho employee đã có contract Active |
| **Đầu ra mong đợi** | **201** — Contract mới Active; contract cũ → Expired |
| **Yêu cầu môi trường** | Employee có 1 contract Active |
| **Thủ tục đặc biệt** | Kiểm tra contract cũ: status = 'Expired' |
| **Phụ thuộc** | TC-CONTRACT-01 |

### TC-CONTRACT-04 — Cập nhật hợp đồng (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PATCH /contracts/:id` |
| **Đầu vào** | `{ "salary_rate": "20000000" }` |
| **Đầu ra mong đợi** | **200** — Contract updated, SalaryHistory ghi nhận old → new salary |
| **Yêu cầu môi trường** | Contract tồn tại, salary_rate thay đổi |
| **Thủ tục đặc biệt** | Kiểm tra salary_history có bản ghi mới |
| **Phụ thuộc** | TC-CONTRACT-01 |

### TC-CONTRACT-05 — Xóa hợp đồng (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `DELETE /contracts/:id` |
| **Đầu vào** | Admin JWT |
| **Đầu ra mong đợi** | **200** — Contract bị xóa cứng khỏi DB |
| **Yêu cầu môi trường** | Contract tồn tại |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-CONTRACT-01 |

### TC-CONTRACT-06 — Xem hợp đồng theo nhân viên (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /contracts/employee/:employeeId` |
| **Đầu vào** | JWT của chính nhân viên hoặc Admin |
| **Đầu ra mong đợi** | **200** — Contract[] sắp xếp: status ASC (Active trước), start_date DESC |
| **Yêu cầu môi trường** | Employee có ít nhất 1 contract |
| **Thủ tục đặc biệt** | Nhân viên thường chỉ xem được contract của mình |
| **Phụ thuộc** | TC-CONTRACT-01 |

---

## 14. Module: Departments (Phòng ban)

### TC-DEPT-01 — Tạo phòng ban (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /departments` |
| **Đầu vào** | `{ "department_name": "Phòng Kỹ thuật" }` |
| **Đầu ra mong đợi** | **201** — Department object |
| **Yêu cầu môi trường** | Không |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-DEPT-02 — Cập nhật phòng ban (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PATCH /departments/:id` |
| **Đầu vào** | `{ "department_name": "Phòng Công nghệ" }` |
| **Đầu ra mong đợi** | **200** — Department đã cập nhật |
| **Yêu cầu môi trường** | Department tồn tại |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-DEPT-01 |

### TC-DEPT-03 — Xóa phòng ban (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `DELETE /departments/:id` |
| **Đầu vào** | Admin JWT (`manage:system`) |
| **Đầu ra mong đợi** | **200** — Department bị xóa |
| **Yêu cầu môi trường** | Department không có employee |
| **Thủ tục đặc biệt** | Nếu có employee → lỗi FK constraint |
| **Phụ thuộc** | TC-DEPT-01 |

---

## 15. Module: Positions (Chức vụ)

### TC-POS-01 — Tạo chức vụ (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /positions` |
| **Đầu vào** | `{ "position_name": "Nhân viên kinh doanh" }` |
| **Đầu ra mong đợi** | **201** — Position object |
| **Yêu cầu môi trường** | position_name chưa tồn tại |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-POS-02 — Tạo chức vụ trùng tên (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /positions` |
| **Đầu vào** | `{ "position_name": "Nhân viên kinh doanh" }` (đã tồn tại) |
| **Đầu ra mong đợi** | **409** Conflict |
| **Yêu cầu môi trường** | Position name đã tồn tại |
| **Thủ tục đặc biệt** | UK constraint trên position_name |
| **Phụ thuộc** | TC-POS-01 |

---

## 16. Module: Permissions — RBAC (Phân quyền)

### TC-RBAC-01 — Xem ma trận phân quyền (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /admin/permissions/matrix` |
| **Đầu vào** | Admin JWT |
| **Đầu ra mong đợi** | **200** `[{ position_id, position_name, permissions: [{ permission_id, permission_name }] }]` |
| **Yêu cầu môi trường** | Có position và permission trong DB |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-POS-01 |

### TC-RBAC-02 — Gán quyền cho chức vụ (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /admin/permissions/assign` |
| **Đầu vào** | `{ "position_id": 1, "permission_id": 5 }` |
| **Đầu ra mong đợi** | **201** — PositionPermission created |
| **Yêu cầu môi trường** | Position và Permission tồn tại, assignment chưa có |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-POS-01 |

### TC-RBAC-03 — Gán trùng quyền (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /admin/permissions/assign` |
| **Đầu vào** | `{ "position_id": 1, "permission_id": 5 }` (đã được gán) |
| **Đầu ra mong đợi** | **400** `{ message: "Quyền này đã được gán cho chức vụ" }` |
| **Yêu cầu môi trường** | Assignment đã tồn tại |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-RBAC-02 |

### TC-RBAC-04 — Thu hồi quyền (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /admin/permissions/revoke` |
| **Đầu vào** | `{ "position_id": 1, "permission_id": 5 }` |
| **Đầu ra mong đợi** | **201** — PositionPermission bị xóa |
| **Yêu cầu môi trường** | Assignment tồn tại |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-RBAC-02 |

### TC-RBAC-05 — Cập nhật hàng loạt quyền cho chức vụ (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PUT /admin/roles/:id/permissions` |
| **Đầu vào** | `{ "permission_ids": [1, 2, 3, 4] }` |
| **Đầu ra mong đợi** | **200** — Xóa toàn bộ assignment cũ, insert batch mới |
| **Yêu cầu môi trường** | Position tồn tại, đã có 1 số assignment cũ |
| **Thủ tục đặc biệc** | Kiểm tra assignment cũ bị xóa, chỉ còn 4 assignment mới |
| **Phụ thuộc** | TC-RBAC-02 |

### TC-RBAC-06 — Guard kiểm tra quyền (P0 — WHITE-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `RolesGuard` / `PermissionsGuard` |
| **Đầu vào** | Gọi endpoint có `@Permissions("manage:payroll")` với user không có quyền |
| **Đầu ra mong đợi** | **403** ForbiddenException |
| **Yêu cầu môi trường** | User có position không được gán quyền `manage:payroll` |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-RBAC-07 — Admin bypass tất cả quyền (P1 — WHITE-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `RolesGuard` — Admin bypass |
| **Đầu vào** | User có position chứa 'admin' gọi endpoint `@Permissions("manage:payroll")` dù không có quyền cụ thể |
| **Đầu ra mong đợi** | **200** — Cho phép truy cập (bypass) |
| **Yêu cầu môi trường** | Position name chứa 'admin' hoặc 'system admin' hoặc 'director' hoặc 'hr manager' hoặc 'hr' |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-AUTH-01 |

---

## 17. Module: Company Profile (Hồ sơ công ty)

### TC-CPROFILE-01 — Xem hồ sơ công ty (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /company-profile` |
| **Đầu vào** | JWT hợp lệ |
| **Đầu ra mong đợi** | **200** — CompanyProfile object |
| **Yêu cầu môi trường** | CompanyProfile đã được tạo |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-CPROFILE-02 — Cập nhật hồ sơ công ty (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PATCH /company-profile` |
| **Đầu vào** | `{ "company_name": "Công ty TNHH ABC", "base_currency": "VND", "address": "Hà Nội" }` — Admin (`manage:system`) |
| **Đầu ra mong đợi** | **200** — CompanyProfile updated |
| **Yêu cầu môi trường** | CompanyProfile tồn tại |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-CPROFILE-01 |

### TC-CPROFILE-03 — Upload logo công ty (P3 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PATCH /company-profile/logo` |
| **Đầu vào** | Multipart: `file` = ảnh PNG/SVG |
| **Đầu ra mong đợi** | **200** — logo_url cập nhật, file lưu trong `./uploads/company/` |
| **Yêu cầu môi trường** | Thư mục `./uploads/company/` tồn tại |
| **Thủ tục đặc biệt** | Chấp nhận SVG |
| **Phụ thuộc** | TC-CPROFILE-01 |

---

## 18. Module: Company Settings (Cài đặt hệ thống)

### TC-CSETTINGS-01 — Xem tất cả settings (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /admin/settings` |
| **Đầu vào** | Admin JWT |
| **Đầu ra mong đợi** | **200** — Mảng CompanySettings[] |
| **Yêu cầu môi trường** | Có ít nhất `COMPANY_IP_WHITELIST` setting |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-CSETTINGS-02 — Cập nhật setting (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PATCH /admin/settings` |
| **Đầu vào** | `{ "key": "COMPANY_IP_WHITELIST", "value": "[\"192.168.1.0/24\"]" }` |
| **Đầu ra mong đợi** | **200** — Setting updated, IPWhitelistGuard dùng giá trị mới |
| **Yêu cầu môi trường** | Key tồn tại |
| **Thủ tục đặc biệt** | Kiểm tra IP check-in hoạt động với whitelist mới |
| **Phụ thuộc** | TC-CSETTINGS-01 |

---

## 19. Module: Dashboard (Bảng điều khiển)

### TC-DASH-01 — Dashboard nhân viên (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /dashboard/employee` |
| **Đầu vào** | JWT nhân viên |
| **Đầu ra mong đợi** | **200** `{ stats: { ptoBalance, daysWorkedThisMonth: 18 }, nextHoliday, recentAnnouncements: [...] }` |
| **Yêu cầu môi trường** | Employee có LeaveBalance, có announcement Active |
| **Thủ tục đặc biệt** | daysWorkedThisMonth hardcode = 18 |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-DASH-02 — Dashboard admin (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /dashboard/admin` |
| **Đầu vào** | Admin JWT (`manage:system`) |
| **Đầu ra mong đợi** | **200** `{ attendance: { total: 150, present: 142, absent: 5, late: 3 }, pendingApprovals: { leaveRequests: N, resignations: M } }` |
| **Yêu cầu môi trường** | Có leave requests PENDING và resignation requests PENDING |
| **Thủ tục đặc biệt** | attendance stats hardcode |
| **Phụ thuộc** | TC-LEAVE-01, TC-RESIGN-01 |

---

## 20. Module: Reports (Báo cáo)

### TC-REPORT-01 — Báo cáo tổng lương theo phòng ban (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /reports/payroll-summary?month=5&year=2026` |
| **Đầu vào** | Admin JWT |
| **Đầu ra mong đợi** | **200** `{ month, year, total_payroll, total_base_salary, total_bonus, total_deductions, employees_processed, avg_salary, payroll_by_department: [...] }` |
| **Yêu cầu môi trường** | Đã generate payslip tháng 5/2026 |
| **Thủ tục đặc biệt** | Gom nhóm theo department, tính avg_salary |
| **Phụ thuộc** | TC-PAYROLL-01 |

### TC-REPORT-02 — Báo cáo dashboard (12 tháng) (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /reports/dashboard` |
| **Đầu vào** | Admin JWT (`manage:system` hoặc `manage:payroll`) |
| **Đầu ra mong đợi** | **200** `{ salary_trend: [...], headcount_trend: [...], turnover: [...], personnel_by_department: [...] }` — mỗi mảng 12 phần tử |
| **Yêu cầu môi trường** | Có dữ liệu payroll và contract 12 tháng gần nhất |
| **Thủ tục đặc biệt** | Turnover tính từ new_hires và resigned mỗi tháng |
| **Phụ thuộc** | TC-PAYROLL-01, TC-CONTRACT-01 |

---

## 21. Module: Holiday (Ngày lễ)

### TC-HOLIDAY-01 — Xem danh sách ngày lễ (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /admin/holidays?year=2026` |
| **Đầu vào** | Admin JWT |
| **Đầu ra mong đợi** | **200** — Mảng PublicHoliday[] năm 2026 |
| **Yêu cầu môi trường** | Có ngày lễ trong DB |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-HOLIDAY-02 — Tạo ngày lễ (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /admin/holidays` |
| **Đầu vào** | `{ "name": "Tết Dương lịch", "date": "2026-01-01", "type": "public", "is_recurring": true, "year": 2026 }` |
| **Đầu ra mong đợi** | **201** — PublicHoliday object |
| **Yêu cầu môi trường** | Không |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-AUTH-01 |

### TC-HOLIDAY-03 — Seed ngày lễ Việt Nam (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /admin/holidays/seed/vietnam/2026` |
| **Đầu vào** | Admin JWT |
| **Đầu ra mong đợi** | **201** — 12 ngày lễ Việt Nam được tạo (Tết Dương lịch, Tết Nguyên đán, Giỗ Tổ Hùng Vương, 30/4, 1/5, Quốc khánh 2/9) |
| **Yêu cầu môi trường** | Chưa có dữ liệu ngày lễ 2026 |
| **Thủ tục đặc biệt** | Kiểm tra đủ 12 ngày lễ |
| **Phụ thuộc** | Không |

### TC-HOLIDAY-04 — Xóa ngày lễ (P3 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `DELETE /admin/holidays/:id` |
| **Đầu vào** | Admin JWT |
| **Đầu ra mong đợi** | **200** — PublicHoliday bị xóa |
| **Yêu cầu môi trường** | Holiday tồn tại |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-HOLIDAY-02 |

---

## 22. Module: Admin — Quản lý tổ chức

### TC-ADMIN-01 — Thống kê tổ chức (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `GET /admin/organization/stats` |
| **Đầu vào** | Admin JWT |
| **Đầu ra mong đợi** | **200** — Số liệu: departments, employees, budget |
| **Yêu cầu môi trường** | Có dữ liệu tổ chức |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | TC-DEPT-01, TC-EMPLOYEE-01 |

### TC-ADMIN-02 — Chuyển phòng ban nhân viên (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `PUT /admin/employees/:id/transfer` |
| **Đầu vào** | `{ "department_id": 2, "position_id": 3 }` |
| **Đầu ra mong đợi** | **200** — Employee cập nhật dept/pos; nếu đang là manager dept cũ → gỡ quyền manager |
| **Yêu cầu môi trường** | Employee là manager department 1 |
| **Thủ tục đặc biệt** | Kiểm tra department 1: manager_id → NULL |
| **Phụ thuộc** | TC-EMPLOYEE-01 |

### TC-ADMIN-03 — Xóa mềm nhân viên (Admin) (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `DELETE /admin/employees/:id` |
| **Đầu vào** | Admin JWT |
| **Đầu ra mong đợi** | **200** — Employee: deleted_at được set, employment_status → TERMINATED, gỡ manager nếu có |
| **Yêu cầu môi trường** | Employee tồn tại, có thể là manager |
| **Thủ tục đặc biệt** | Soft delete — employee vẫn trong DB |
| **Phụ thuộc** | TC-EMPLOYEE-01 |

---

## 23. Kiểm thử Tích hợp Liên module (End-to-End)

### TC-E2E-01 — Luồng đầy đủ: Tuyển dụng → Chấm công → Nghỉ phép → Lương → Nghỉ việc (P0 — INTEGRATION)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | Toàn bộ vòng đời nhân viên |
| **Đầu vào** | Chuỗi thao tác tuần tự |
| **Đầu ra mong đợi** | Tất cả bước thành công, dữ liệu nhất quán |
| **Yêu cầu môi trường** | Database sạch hoặc có dữ liệu test |
| **Thủ tục đặc biệt** | |

**Các bước thực hiện:**

| Bước | Hành động | Endpoint | Kết quả mong đợi |
|------|-----------|----------|-------------------|
| 1 | Đăng ký admin | `POST /auth/admin-register` | 201 — Tài khoản admin |
| 2 | Đăng nhập admin | `POST /auth/login` | 200 — Token |
| 3 | Tạo phòng ban | `POST /departments` | 201 — Phòng Kỹ thuật |
| 4 | Tạo chức vụ | `POST /positions` | 201 — Lập trình viên |
| 5 | Gán quyền cho chức vụ | `POST /admin/permissions/assign` | 201 |
| 6 | Tạo nhân viên | `POST /employees` | 201 |
| 7 | Cấu hình lương | `PATCH /payroll/config/:id` | 200 |
| 8 | Tạo hợp đồng | `POST /contracts` | 201 |
| 9 | Nhân viên đăng nhập | `POST /auth/login` | 200 |
| 10 | Check-in QR | `POST /timekeeping/check-in/qr` | 201 |
| 11 | Check-out QR | `POST /timekeeping/check-in/qr` | 201 |
| 12 | Nộp đơn nghỉ phép | `POST /leave/request` | 201 |
| 13 | Admin duyệt nghỉ phép | `PATCH /leave/request/:id/approve` | 200 |
| 14 | Tạo KPI library | `POST /kpi/library` | 201 |
| 15 | Tạo KPI period | `POST /kpi/period` | 201 |
| 16 | Gán KPI | `POST /kpi/assign` | 201 |
| 17 | Nhân viên cập nhật KPI | `PATCH /kpi/assignment/:id/actual` | 200 |
| 18 | Admin chấm điểm KPI | `PATCH /kpi/assignment/:id/grade` | 200 |
| 19 | Tạo bảng lương | `POST /payroll/generate` | 201 |
| 20 | Duyệt bảng lương | `POST /payroll/approve-all` | 201 |
| 21 | Xem báo cáo | `GET /reports/payroll-summary` | 200 |
| 22 | Nhân viên nộp đơn từ chức | `POST /resignations` | 201 |
| 23 | Admin duyệt từ chức | `PATCH /resignations/:id` | 200 |
| 24 | Kiểm tra trạng thái cuối | `GET /employees/:id` | 200 — TERMINATED, contract Terminated |

**Phụ thuộc:** Không — đây là ca kiểm thử độc lập

---

### TC-E2E-02 — WebSocket: Nhận thông báo xuyên suốt (P1 — WS)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | Kiểm tra WebSocket nhận notification từ nhiều nguồn |
| **Đầu vào** | Kết nối WebSocket, thực hiện các hành động tạo notification |
| **Đầu ra mong đợi** | Nhận các event: `newNotification` cho leave, payroll, violation, announcement, message |
| **Yêu cầu môi trường** | WebSocket client kết nối với JWT cookie |
| **Thủ tục đặc biệt** | |

| Bước | Trigger | Event mong đợi |
|------|---------|----------------|
| 1 | Nộp leave request → admin | Admin nhận `newNotification` (LEAVE_REQUEST) |
| 2 | Duyệt leave → employee | Employee nhận `newNotification` (LEAVE) |
| 3 | Tạo violation → employee | Employee nhận `newNotification` (DISCIPLINE) |
| 4 | Tạo payslip → employee | Employee nhận `newNotification` (PAYROLL) |
| 5 | Tạo announcement (in_app) → all | Employee nhận `newNotification` (ANNOUNCEMENT) |
| 6 | Gửi message → receiver | Receiver nhận `newMessage` |

---

## 24. Kiểm thử Bảo mật (Security)

### TC-SEC-01 — SQL Injection (P0 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | Tất cả endpoint nhận tham số string |
| **Đầu vào** | `' OR '1'='1`, `'; DROP TABLE employee; --` trong query params và body |
| **Đầu ra mong đợi** | **400** validation error hoặc kết quả rỗng — không có SQL execution |
| **Yêu cầu môi trường** | TypeORM + parameterized queries |
| **Thủ tục đặc biệt** | Test trên tất cả GET endpoint có query params |
| **Phụ thuộc** | Không |

### TC-SEC-02 — XSS (P0 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | Tất cả endpoint nhận text input |
| **Đầu vào** | `<script>alert('xss')</script>` trong first_name, reason, description, content |
| **Đầu ra mong đợi** | Dữ liệu lưu nguyên bản (backend không escape), frontend phải escape khi render |
| **Yêu cầu môi trường** | Không |
| **Thủ tục đặc biệt** | Kiểm tra response chứa nguyên script tag |
| **Phụ thuộc** | Không |

### TC-SEC-03 — JWT hết hạn / giả mạo (P0 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | Tất cả endpoint yêu cầu JwtAuthGuard |
| **Đầu vào** | Token hết hạn, token tự tạo với secret sai, không có token |
| **Đầu ra mong đợi** | **401** UnauthorizedException |
| **Yêu cầu môi trường** | Không |
| **Thủ tục đặc biệt** | Không |
| **Phụ thuộc** | Không |

### TC-SEC-04 — CSRF qua cookie (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | Endpoint POST/PATCH/DELETE |
| **Đầu vào** | Request từ origin khác, không có cookie JWT |
| **Đầu ra mong đợi** | **401** UnauthorizedException |
| **Yêu cầu môi trường** | CORS được cấu hình |
| **Thủ tục đặc biệt** | Gửi request với Origin header khác |
| **Phụ thuộc** | Không |

### TC-SEC-05 — IDOR (Insecure Direct Object Reference) (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | Endpoint lấy dữ liệu theo ID |
| **Đầu vào** | User A cố gắng truy cập payslip của user B (`GET /payroll/999`) |
| **Đầu ra mong đợi** | **403** hoặc **404** — không cho phép truy cập dữ liệu của người khác |
| **Yêu cầu môi trường** | User A và B khác department |
| **Thủ tục đặc biệt** | Test trên: payslip, contract, leave request |
| **Phụ thuộc** | TC-EMPLOYEE-01 |

### TC-SEC-06 — Rate Limiting Brute Force (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Hạng mục** | `POST /auth/login` |
| **Đầu vào** | 10 request liên tiếp với sai mật khẩu |
| **Đầu ra mong đợi** | **429** Too Many Requests (nếu có rate limiting) |
| **Yêu cầu môi trường** | Rate limiting được cấu hình |
| **Thủ tục đặc biệt** | Gửi nhanh 10 request |
| **Phụ thuộc** | Không |

---

## Tổng kết

| Module | Số TC | P0 | P1 | P2 | P3 | BLACK-BOX | WHITE-BOX | INTEGRATION | WS |
|--------|-------|----|----|----|----|-----------|-----------|-------------|-----|
| Auth | 13 | 1 | 6 | 5 | 1 | 13 | 0 | 0 | 0 |
| Employees | 10 | 2 | 5 | 3 | 0 | 10 | 0 | 0 | 0 |
| Leave | 9 | 2 | 5 | 2 | 0 | 7 | 0 | 2 | 0 |
| Timekeeping | 9 | 3 | 4 | 2 | 0 | 7 | 1 | 1 | 0 |
| Payroll | 13 | 1 | 8 | 3 | 1 | 9 | 3 | 1 | 0 |
| KPI | 8 | 1 | 5 | 1 | 1 | 6 | 1 | 1 | 0 |
| Violations | 5 | 1 | 2 | 2 | 0 | 4 | 1 | 0 | 0 |
| Resignations | 4 | 2 | 2 | 0 | 0 | 3 | 0 | 1 | 0 |
| Notifications | 7 | 1 | 3 | 2 | 1 | 5 | 0 | 0 | 2 |
| Announcements | 4 | 0 | 3 | 1 | 0 | 4 | 0 | 0 | 0 |
| Messages | 5 | 0 | 3 | 2 | 0 | 4 | 0 | 0 | 2 |
| Comments | 2 | 0 | 0 | 2 | 0 | 2 | 0 | 0 | 0 |
| Contracts | 6 | 1 | 5 | 0 | 0 | 5 | 0 | 1 | 0 |
| Departments | 3 | 0 | 1 | 2 | 0 | 3 | 0 | 0 | 0 |
| Positions | 2 | 0 | 1 | 1 | 0 | 2 | 0 | 0 | 0 |
| RBAC | 7 | 1 | 4 | 1 | 1 | 5 | 2 | 0 | 0 |
| Company Profile | 3 | 0 | 0 | 2 | 1 | 3 | 0 | 0 | 0 |
| Company Settings | 2 | 0 | 0 | 2 | 0 | 2 | 0 | 0 | 0 |
| Dashboard | 2 | 0 | 2 | 0 | 0 | 2 | 0 | 0 | 0 |
| Reports | 2 | 0 | 2 | 0 | 0 | 2 | 0 | 0 | 0 |
| Holiday | 4 | 0 | 0 | 3 | 1 | 4 | 0 | 0 | 0 |
| Admin | 3 | 0 | 0 | 3 | 0 | 3 | 0 | 0 | 0 |
| **E2E** | 2 | 1 | 1 | 0 | 0 | 0 | 0 | 1 | 1 |
| **Security** | 6 | 3 | 2 | 1 | 0 | 6 | 0 | 0 | 0 |
| **Tổng** | **129** | **20** | **64** | **40** | **5** | **111** | **8** | **8** | **5** |

### Định nghĩa mức độ nghiêm trọng

| Mức | Định nghĩa | Hành động |
|-----|-----------|-----------|
| **P0** | Hệ thống không hoạt động / mất dữ liệu / lỗ hổng bảo mật nghiêm trọng | Sửa ngay, block release |
| **P1** | Chức năng chính bị lỗi, ảnh hưởng người dùng | Sửa trước release |
| **P2** | Edge case, lỗi phụ, ảnh hưởng thấp | Sửa trong iteration tiếp theo |
| **P3** | UI/UX, nice-to-have | Backlog |
