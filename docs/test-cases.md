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
| **Mã ca kiểm thử (TC-ID)** | `TC-AUTH-01` |
| **Hạng mục (Test Item)** | `POST /auth/login` |
| **Điều kiện tiên quyết (Preconditions)** | DB có employee với email trên, `employment_status = 'Active'`, password đã hash bcrypt |
| **Các bước thực hiện (Test Steps)** | Gửi POST request không kèm Authorization header |
| **Dữ liệu đầu vào (Inputs)** | `{ "email": "user@company.com", "password": "Pass@123" }` |
| **Kết quả mong đợi (Expected Output)** | **200** `{ success: true, user: { employee_id, email, first_name, last_name, ... }, access_token: "eyJ..." }` — Cookie `access_token` được set HttpOnly |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P0** (BLACK-BOX) | Phụ thuộc: TC-EMPLOYEE-01 (tạo nhân viên) |

### TC-AUTH-02 — Đăng nhập sai mật khẩu (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-AUTH-02` |
| **Hạng mục (Test Item)** | `POST /auth/login` |
| **Điều kiện tiên quyết (Preconditions)** | DB có employee với email trên, trạng thái Active |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "email": "user@company.com", "password": "WrongPass" }` |
| **Kết quả mong đợi (Expected Output)** | **401** `{ error: "Invalid credentials" }` — Không có cookie |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: Không |

### TC-AUTH-03 — Đăng nhập tài khoản đã nghỉ việc quá ngày (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-AUTH-03` |
| **Hạng mục (Test Item)** | `POST /auth/login` |
| **Điều kiện tiên quyết (Preconditions)** | Employee có `employment_status = 'Terminated'`, `resignation_date` đã qua |
| **Các bước thực hiện (Test Steps)** | Cần offboard nhân viên trước |
| **Dữ liệu đầu vào (Inputs)** | `{ "email": "terminated@company.com", "password": "Pass@123" }` |
| **Kết quả mong đợi (Expected Output)** | **401** `{ error: "Account has been deactivated" }` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-EMPLOYEE-08 (offboard) |

### TC-AUTH-04 — Đăng nhập thiếu trường (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-AUTH-04` |
| **Hạng mục (Test Item)** | `POST /auth/login` |
| **Điều kiện tiên quyết (Preconditions)** | Validation pipe hoạt động |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "email": "user@company.com" }` (thiếu password) |
| **Kết quả mong đợi (Expected Output)** | **400** BadRequestException |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: Không |

### TC-AUTH-05 — Đăng xuất (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-AUTH-05` |
| **Hạng mục (Test Item)** | `POST /auth/logout` |
| **Điều kiện tiên quyết (Preconditions)** | Đang có cookie `access_token` hợp lệ |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | Không có body |
| **Kết quả mong đợi (Expected Output)** | **201** `{ success: true }` — Cookie `access_token` bị xóa |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-AUTH-06 — Lấy thông tin cá nhân (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-AUTH-06` |
| **Hạng mục (Test Item)** | `GET /auth/profile` |
| **Điều kiện tiên quyết (Preconditions)** | Employee có department, position, bankInfo |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | Authorization header / cookie JWT hợp lệ |
| **Kết quả mong đợi (Expected Output)** | **200** `Employee` object gồm: employee_id, email, first_name, last_name, department, position, bankInfo, permissions[] — **không** có password |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-AUTH-07 — Lấy thông tin không có token (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-AUTH-07` |
| **Hạng mục (Test Item)** | `GET /auth/profile` |
| **Điều kiện tiên quyết (Preconditions)** | Không |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | Không có Authorization header, không có cookie |
| **Kết quả mong đợi (Expected Output)** | **401** UnauthorizedException |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: Không |

### TC-AUTH-08 — Cập nhật hồ sơ cá nhân (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-AUTH-08` |
| **Hạng mục (Test Item)** | `PATCH /auth/profile/update` |
| **Điều kiện tiên quyết (Preconditions)** | Đã đăng nhập |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "first_name": "Nguyễn", "last_name": "Văn A", "phone_number": "0987654321", "address": "Hà Nội" }` |
| **Kết quả mong đợi (Expected Output)** | **200** — Profile đầy đủ với thông tin đã cập nhật |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-AUTH-09 — Upload avatar (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-AUTH-09` |
| **Hạng mục (Test Item)** | `POST /auth/profile/avatar` |
| **Điều kiện tiên quyết (Preconditions)** | Thư mục `./uploads/avatars/` tồn tại, có quyền ghi |
| **Các bước thực hiện (Test Steps)** | Content-Type: multipart/form-data |
| **Dữ liệu đầu vào (Inputs)** | Multipart form: `file` = ảnh JPG/PNG < 5MB |
| **Kết quả mong đợi (Expected Output)** | **201** — Profile với `avatar_url` đã cập nhật, file được lưu trong `./uploads/avatars/` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-AUTH-10 — Upload avatar sai định dạng (P3 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-AUTH-10` |
| **Hạng mục (Test Item)** | `POST /auth/profile/avatar` |
| **Điều kiện tiên quyết (Preconditions)** | Không |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | Multipart form: `file` = file `.pdf` |
| **Kết quả mong đợi (Expected Output)** | **400** `{ message: "Only image files are allowed" }` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P3** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-AUTH-11 — Lấy navigation (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-AUTH-11` |
| **Hạng mục (Test Item)** | `GET /auth/navigation` |
| **Điều kiện tiên quyết (Preconditions)** | Employee có position không phải Admin |
| **Các bước thực hiện (Test Steps)** | Response có header Cache-Control: no-cache |
| **Dữ liệu đầu vào (Inputs)** | JWT của employee thường |
| **Kết quả mong đợi (Expected Output)** | **200** `{ main: [...], admin: [] }` — Admin rỗng với người dùng thường |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-AUTH-12 — Đăng ký admin với secret key (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-AUTH-12` |
| **Hạng mục (Test Item)** | `POST /auth/admin-register` |
| **Điều kiện tiên quyết (Preconditions)** | Biến môi trường `ADMIN_SECRET_KEY` được set |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "email": "admin@company.com", "password": "Admin@123", "department_id": 1, "position_id": 1, "secretKey": "<ADMIN_SECRET_KEY>", "first_name": "Quản", "last_name": "Trị" }` |
| **Kết quả mong đợi (Expected Output)** | **201** `{ message: "Account created successfully", id: number }` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-DEPT-01, TC-POS-01 |

### TC-AUTH-13 — Đăng ký admin sai secret key (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-AUTH-13` |
| **Hạng mục (Test Item)** | `POST /auth/admin-register` |
| **Điều kiện tiên quyết (Preconditions)** | `ADMIN_SECRET_KEY` được set, giá trị khác "wrong-key" |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ ..., "secretKey": "wrong-key" }` |
| **Kết quả mong đợi (Expected Output)** | **401** `{ message: "Invalid secret key" }` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: Không |

---

## 2. Module: Employees (Quản lý Nhân viên)

### TC-EMPLOYEE-01 — Tạo nhân viên mới (P0 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-EMPLOYEE-01` |
| **Hạng mục (Test Item)** | `POST /employees` |
| **Điều kiện tiên quyết (Preconditions)** | Department ID 1 và Position ID 2 tồn tại, email chưa được dùng |
| **Các bước thực hiện (Test Steps)** | Kiểm tra bảng notification có bản ghi chào mừng |
| **Dữ liệu đầu vào (Inputs)** | `{ "email": "newuser@company.com", "password": "Pass@123", "first_name": "Nguyễn", "last_name": "Văn B", "department_id": 1, "position_id": 2 }` |
| **Kết quả mong đợi (Expected Output)** | **201** — Employee object với các trường đã nhập, password đã hash bcrypt(10), có notification chào mừng |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P0** (BLACK-BOX) | Phụ thuộc: TC-DEPT-01, TC-POS-01 |

### TC-EMPLOYEE-02 — Tạo nhân viên trùng email (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-EMPLOYEE-02` |
| **Hạng mục (Test Item)** | `POST /employees` |
| **Điều kiện tiên quyết (Preconditions)** | DB có employee với email trên |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "email": "newuser@company.com", ... }` (email đã tồn tại) |
| **Kết quả mong đợi (Expected Output)** | **409** Conflict — `{ message: "Email already exists" }` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-EMPLOYEE-01 |

### TC-EMPLOYEE-03 — Tạo nhân viên thiếu trường bắt buộc (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-EMPLOYEE-03` |
| **Hạng mục (Test Item)** | `POST /employees` |
| **Điều kiện tiên quyết (Preconditions)** | Validation pipe hoạt động |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "email": "test@company.com" }` (thiếu password, first_name, last_name) |
| **Kết quả mong đợi (Expected Output)** | **400** BadRequestException — validation error |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: Không |

### TC-EMPLOYEE-04 — Lấy danh sách toàn bộ nhân viên (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-EMPLOYEE-04` |
| **Hạng mục (Test Item)** | `GET /employees` |
| **Điều kiện tiên quyết (Preconditions)** | DB có ít nhất 1 employee |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | JWT hợp lệ (Admin) |
| **Kết quả mong đợi (Expected Output)** | **200** — Mảng Employee[] kèm base_salary, department, position |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-EMPLOYEE-05 — Xem danh bạ nhân viên (public) (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-EMPLOYEE-05` |
| **Hạng mục (Test Item)** | `GET /employees/directory` hoặc `GET /employees/staff-directory` |
| **Điều kiện tiên quyết (Preconditions)** | Nhân viên thuộc department_id = 1 |
| **Các bước thực hiện (Test Steps)** | Row-level security: chỉ trả về employee cùng department |
| **Dữ liệu đầu vào (Inputs)** | JWT của nhân viên phòng ban X |
| **Kết quả mong đợi (Expected Output)** | **200** — Chỉ hiển thị nhân viên Active cùng phòng ban; không có phone_number, address, bankInfo, password |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-EMPLOYEE-01 |

### TC-EMPLOYEE-06 — Tìm kiếm nhân viên (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-EMPLOYEE-06` |
| **Hạng mục (Test Item)** | `GET /employees/search?q=Nguyễn` |
| **Điều kiện tiên quyết (Preconditions)** | DB có nhân viên tên "Nguyễn" |
| **Các bước thực hiện (Test Steps)** | Tìm kiếm ILIKE trên first_name, last_name, email |
| **Dữ liệu đầu vào (Inputs)** | Query param `q` = "Nguyễn" |
| **Kết quả mong đợi (Expected Output)** | **200** — Tối đa 5 kết quả: `[{ type: "employee", id, name, email }]` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-EMPLOYEE-01 |

### TC-EMPLOYEE-07 — Tìm kiếm với từ khóa quá ngắn (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-EMPLOYEE-07` |
| **Hạng mục (Test Item)** | `GET /employees/search?q=A` |
| **Điều kiện tiên quyết (Preconditions)** | Không |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | Query param `q` = "A" (1 ký tự) |
| **Kết quả mong đợi (Expected Output)** | **400** — Yêu cầu tối thiểu 2 ký tự |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: Không |

### TC-EMPLOYEE-08 — Offboard nhân viên (P0 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-EMPLOYEE-08` |
| **Hạng mục (Test Item)** | `PATCH /employees/:id/offboard` |
| **Điều kiện tiên quyết (Preconditions)** | Employee có ít nhất 1 contract Active |
| **Các bước thực hiện (Test Steps)** | Kiểm tra bảng contract: status → 'Terminated' |
| **Dữ liệu đầu vào (Inputs)** | `{ "employment_status": "Terminated", "resignation_reason": "Personal", "resignation_date": "2026-05-18" }` |
| **Kết quả mong đợi (Expected Output)** | **200** — Employee có `employment_status = 'Terminated'`, contract Active bị chấm dứt |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P0** (BLACK-BOX) | Phụ thuộc: TC-EMPLOYEE-01, TC-CONTRACT-01 |

### TC-EMPLOYEE-09 — Cập nhật thông tin nhân viên (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-EMPLOYEE-09` |
| **Hạng mục (Test Item)** | `PATCH /employees/:id` |
| **Điều kiện tiên quyết (Preconditions)** | Employee là manager của department 1 |
| **Các bước thực hiện (Test Steps)** | Kiểm tra department 1: manager_id → NULL |
| **Dữ liệu đầu vào (Inputs)** | `{ "first_name": "Trần", "department_id": 2 }` |
| **Kết quả mong đợi (Expected Output)** | **200** — Employee đã cập nhật. Nếu đang là manager của dept cũ → tự động gỡ quyền manager |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-EMPLOYEE-01, TC-DEPT-02 |

### TC-EMPLOYEE-10 — Xóa nhân viên (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-EMPLOYEE-10` |
| **Hạng mục (Test Item)** | `DELETE /employees/:id` |
| **Điều kiện tiên quyết (Preconditions)** | Employee tồn tại |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | ID của employee |
| **Kết quả mong đợi (Expected Output)** | **200** — Employee bị xóa cứng khỏi DB |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-EMPLOYEE-01 |

---

## 3. Module: Leave (Nghỉ phép)

### TC-LEAVE-01 — Nộp đơn nghỉ phép (P0 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-LEAVE-01` |
| **Hạng mục (Test Item)** | `POST /leave/request` |
| **Điều kiện tiên quyết (Preconditions)** | LeaveType ID 1 tồn tại, Employee tồn tại và Active |
| **Các bước thực hiện (Test Steps)** | Kiểm tra bảng notification có bản ghi cho từng Admin |
| **Dữ liệu đầu vào (Inputs)** | `{ "leave_type_id": 1, "start_date": "2026-05-20", "end_date": "2026-05-22", "reason": "Nghỉ việc riêng" }` |
| **Kết quả mong đợi (Expected Output)** | **201** `{ request_id, status: "Pending", message: "Leave request submitted successfully" }` — Notification gửi đến Admin/HR/Director qua WebSocket |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P0** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-LEAVE-02 — Nộp đơn với LeaveType không tồn tại (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-LEAVE-02` |
| **Hạng mục (Test Item)** | `POST /leave/request` |
| **Điều kiện tiên quyết (Preconditions)** | Không có LeaveType ID 9999 |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "leave_type_id": 9999, ... }` |
| **Kết quả mong đợi (Expected Output)** | **404** NotFoundException — `{ message: "Leave type not found" }` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: Không |

### TC-LEAVE-03 — Duyệt đơn nghỉ phép (Approved) (P0 — INTEGRATION)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-LEAVE-03` |
| **Hạng mục (Test Item)** | `PATCH /leave/request/:id/approve` |
| **Điều kiện tiên quyết (Preconditions)** | LeaveRequest ở trạng thái Pending, Admin có quyền `manage:leave` |
| **Các bước thực hiện (Test Steps)** | Kiểm tra LeaveBalance: remaining_days giảm đúng số ngày làm việc; nếu chưa có balance → tự tạo mới |
| **Dữ liệu đầu vào (Inputs)** | `{ "status": "Approved", "reason": "Đồng ý" }` — Admin JWT |
| **Kết quả mong đợi (Expected Output)** | **200** `{ request_id, status: "Approved", message }` — LeaveBalance bị trừ ngày làm việc (T2-T6), notification gửi cho nhân viên |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P0** (INTEGRATION) | Phụ thuộc: TC-LEAVE-01 |

### TC-LEAVE-04 — Từ chối đơn nghỉ phép (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-LEAVE-04` |
| **Hạng mục (Test Item)** | `PATCH /leave/request/:id/approve` |
| **Điều kiện tiên quyết (Preconditions)** | LeaveRequest Pending |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "status": "Rejected", "reason": "Không phù hợp thời điểm" }` |
| **Kết quả mong đợi (Expected Output)** | **200** — Trạng thái thành Rejected, không thay đổi LeaveBalance |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-LEAVE-01 |

### TC-LEAVE-05 — Từ chối đơn đã Approved → hoàn lại ngày phép (P1 — INTEGRATION)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-LEAVE-05` |
| **Hạng mục (Test Item)** | `PATCH /leave/request/:id/approve` |
| **Điều kiện tiên quyết (Preconditions)** | LeaveRequest ở trạng thái Approved, đã có LeaveBalance bị trừ |
| **Các bước thực hiện (Test Steps)** | Kiểm tra remaining_days tăng đúng số ngày đã trừ |
| **Dữ liệu đầu vào (Inputs)** | `{ "status": "Rejected" }` lên đơn đã Approved |
| **Kết quả mong đợi (Expected Output)** | **200** — LeaveBalance được hoàn lại số ngày đã trừ trước đó |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (INTEGRATION) | Phụ thuộc: TC-LEAVE-03 |

### TC-LEAVE-06 — Xem số dư nghỉ phép (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-LEAVE-06` |
| **Hạng mục (Test Item)** | `GET /leave/balance` |
| **Điều kiện tiên quyết (Preconditions)** | Nhân viên có ít nhất 1 LeaveBalance |
| **Các bước thực hiện (Test Steps)** | Tự động lấy employee_id từ JWT |
| **Dữ liệu đầu vào (Inputs)** | JWT của nhân viên |
| **Kết quả mong đợi (Expected Output)** | **200** `[{ balance_id, leave_type_name, remaining_days }]` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-LEAVE-07 — Xem danh sách đơn nghỉ phép của mình (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-LEAVE-07` |
| **Hạng mục (Test Item)** | `GET /leave/my-requests` |
| **Điều kiện tiên quyết (Preconditions)** | Nhân viên đã nộp ít nhất 1 đơn |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | JWT của nhân viên |
| **Kết quả mong đợi (Expected Output)** | **200** — Mảng leave requests kèm leave_type_name, manager_approver email, admin_note |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-LEAVE-01 |

### TC-LEAVE-08 — Admin xem danh sách đơn chờ duyệt (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-LEAVE-08` |
| **Hạng mục (Test Item)** | `GET /leave/pending-requests` |
| **Điều kiện tiên quyết (Preconditions)** | Có ít nhất 1 leave request |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | JWT của Admin có quyền `manage:leave` |
| **Kết quả mong đợi (Expected Output)** | **200** `{ data: [...], stats: { total, pending, approved, rejected } }` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-LEAVE-01 |

### TC-LEAVE-09 — Duyệt đơn với trạng thái Approved_By_Manager (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-LEAVE-09` |
| **Hạng mục (Test Item)** | `PATCH /leave/request/:id/approve` |
| **Điều kiện tiên quyết (Preconditions)** | LeaveRequest Pending |
| **Các bước thực hiện (Test Steps)** | Khấu trừ ngày phép tương tự Approved |
| **Dữ liệu đầu vào (Inputs)** | `{ "status": "Approved_By_Manager" }` |
| **Kết quả mong đợi (Expected Output)** | **200** — Trạng thái cập nhật thành Approved_By_Manager |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-LEAVE-01 |

---

## 4. Module: Timekeeping (Chấm công)

### TC-TK-01 — Tạo mã QR động (P0 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-TK-01` |
| **Hạng mục (Test Item)** | `GET /timekeeping/dynamic-qr` |
| **Điều kiện tiên quyết (Preconditions)** | Không |
| **Các bước thực hiện (Test Steps)** | Token có TTL 35 giây, lưu trong Map bộ nhớ |
| **Dữ liệu đầu vào (Inputs)** | JWT hợp lệ |
| **Kết quả mong đợi (Expected Output)** | **200** `{ token: "uuid-v4-string" }` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P0** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-TK-02 — Check-in bằng QR (P0 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-TK-02` |
| **Hạng mục (Test Item)** | `POST /timekeeping/check-in/qr` |
| **Điều kiện tiên quyết (Preconditions)** | Token QR chưa hết hạn (35s), chưa có bản ghi check-in hôm nay |
| **Các bước thực hiện (Test Steps)** | Token bị xóa khỏi Map sau khi dùng |
| **Dữ liệu đầu vào (Inputs)** | `{ "token": "<uuid-từ-TC-TK-01>" }` |
| **Kết quả mong đợi (Expected Output)** | **201** `{ status: "CHECK_IN", time: "...", message: "Check-in thành công lúc HH:mm", timekeeping_id: N }` — Trạng thái "Late" nếu sau 08:30, "Present" nếu trước |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P0** (BLACK-BOX) | Phụ thuộc: TC-TK-01 |

### TC-TK-03 — Check-in QR với token hết hạn (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-TK-03` |
| **Hạng mục (Test Item)** | `POST /timekeeping/check-in/qr` |
| **Điều kiện tiên quyết (Preconditions)** | Token không tồn tại trong Map |
| **Các bước thực hiện (Test Steps)** | Đợi 36 giây sau khi tạo token |
| **Dữ liệu đầu vào (Inputs)** | `{ "token": "expired-or-invalid-uuid" }` |
| **Kết quả mong đợi (Expected Output)** | **400** `{ message: "Mã QR không hợp lệ hoặc đã hết hạn" }` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-TK-01 |

### TC-TK-04 — Check-out bằng QR (P0 — INTEGRATION)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-TK-04` |
| **Hạng mục (Test Item)** | `POST /timekeeping/check-in/qr` |
| **Điều kiện tiên quyết (Preconditions)** | Đã có bản ghi check-in hôm nay, chưa check-out |
| **Các bước thực hiện (Test Steps)** | Kiểm tra hours_worked. Nếu < 8 → tự động tạo Violation "Incomplete Shift" |
| **Dữ liệu đầu vào (Inputs)** | `{ "token": "<uuid>" }` — khi đã check-in trước đó |
| **Kết quả mong đợi (Expected Output)** | **201** `{ status: "CHECK_OUT", time: "...", duration: N, message: "Check-out thành công. Thời gian làm việc: N giờ", timekeeping_id: N }` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P0** (INTEGRATION) | Phụ thuộc: TC-TK-02 |

### TC-TK-05 — Check-out với hours_worked < 8 (tự động tạo vi phạm) (P0 — INTEGRATION)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-TK-05` |
| **Hạng mục (Test Item)** | `POST /timekeeping/check-in/qr` (check-out) |
| **Điều kiện tiên quyết (Preconditions)** | Đã check-in, check-out với hours_worked < 8 |
| **Các bước thực hiện (Test Steps)** | Kiểm tra bảng violation và notification |
| **Dữ liệu đầu vào (Inputs)** | Token QR, check-out sau 4 giờ làm |
| **Kết quả mong đợi (Expected Output)** | **201** — Ngoài kết quả check-out, DB có thêm 1 Violation (Incomplete Shift, PENDING) và 1 Notification cảnh báo |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P0** (INTEGRATION) | Phụ thuộc: TC-TK-02 |

### TC-TK-06 — Debounce 60 giây (P2 — WHITE-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-TK-06` |
| **Hạng mục (Test Item)** | `POST /timekeeping/check-in/qr` |
| **Điều kiện tiên quyết (Preconditions)** | Đã check-in lần 1 |
| **Các bước thực hiện (Test Steps)** | Gửi request thứ 2 trong vòng 60 giây |
| **Dữ liệu đầu vào (Inputs)** | Gửi 2 request check-in liên tiếp trong vòng 60 giây |
| **Kết quả mong đợi (Expected Output)** | Request thứ 2 bị từ chối — `{ message: "Vui lòng đợi trước khi thực hiện thao tác tiếp theo" }` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (WHITE-BOX) | Phụ thuộc: TC-TK-02 |

### TC-TK-07 — Check-in bằng IP (whitelist) (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-TK-07` |
| **Hạng mục (Test Item)** | `POST /timekeeping/check-in/ip` |
| **Điều kiện tiên quyết (Preconditions)** | `COMPANY_IP_WHITELIST` setting chứa IP client |
| **Các bước thực hiện (Test Steps)** | IPWhitelistGuard kiểm tra trước khi vào service |
| **Dữ liệu đầu vào (Inputs)** | JWT + IP client nằm trong whitelist |
| **Kết quả mong đợi (Expected Output)** | **201** `{ status: "CHECK_IN", ... }` — SHIFT_START là 18:30 (ca tối) |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-TK-08 — Check-in IP bị từ chối (IP không trong whitelist) (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-TK-08` |
| **Hạng mục (Test Item)** | `POST /timekeeping/check-in/ip` |
| **Điều kiện tiên quyết (Preconditions)** | IP client không có trong `COMPANY_IP_WHITELIST` |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | JWT + IP không trong whitelist |
| **Kết quả mong đợi (Expected Output)** | **403** ForbiddenException |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-TK-09 — Admin xem báo cáo chấm công (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-TK-09` |
| **Hạng mục (Test Item)** | `GET /attendance/admin/all?page=1&limit=50&startDate=2026-05-01&endDate=2026-05-18` |
| **Điều kiện tiên quyết (Preconditions)** | Có dữ liệu chấm công trong tháng 5/2026 |
| **Các bước thực hiện (Test Steps)** | Mặc định 30 ngày nếu không có startDate/endDate |
| **Dữ liệu đầu vào (Inputs)** | JWT Admin có quyền `manage:system` |
| **Kết quả mong đợi (Expected Output)** | **200** `{ data: TimeKeeping[], stats: { totalEmployees, present, late, absent }, total, page, limit, totalPages }` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-TK-02 |

---

## 5. Module: Payroll (Bảng lương)

### TC-PAYROLL-01 — Tạo bảng lương hàng loạt (P0 — INTEGRATION)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-PAYROLL-01` |
| **Hạng mục (Test Item)** | `POST /payroll/generate` |
| **Điều kiện tiên quyết (Preconditions)** | Có employee + SalaryConfig + TimeKeeping tháng 5; PayrollPeriod chưa tồn tại |
| **Các bước thực hiện (Test Steps)** | Pipeline: timekeeping → leave → adjustments → KPI → OT → insurance (10.5%) → PIT (7 bậc) → net |
| **Dữ liệu đầu vào (Inputs)** | `{ "month": 5, "year": 2026 }` — Admin JWT (`manage:payroll`) |
| **Kết quả mong đợi (Expected Output)** | **201** `{ period_id, month, year, generated, total_gross, total_deductions, total_net, total_bonus }` — Mỗi employee có 1 payslip |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P0** (INTEGRATION) | Phụ thuộc: TC-EMPLOYEE-01, TC-TK-02 |

### TC-PAYROLL-02 — Tạo lại bảng lương tháng đã có (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-PAYROLL-02` |
| **Hạng mục (Test Item)** | `POST /payroll/generate` |
| **Điều kiện tiên quyết (Preconditions)** | PayrollPeriod tháng 5/2026 đã tồn tại |
| **Các bước thực hiện (Test Steps)** | Kiểm tra payslip được cập nhật, không bị duplicate |
| **Dữ liệu đầu vào (Inputs)** | `{ "month": 5, "year": 2026 }` — khi PayrollPeriod đã tồn tại |
| **Kết quả mong đợi (Expected Output)** | UPSERT payslip (không tạo period mới) |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-PAYROLL-01 |

### TC-PAYROLL-03 — Tạo bảng lương đơn lẻ (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-PAYROLL-03` |
| **Hạng mục (Test Item)** | `POST /payroll/generate-single` |
| **Điều kiện tiên quyết (Preconditions)** | Employee 1 có SalaryConfig |
| **Các bước thực hiện (Test Steps)** | Kiểm tra net_pay_in_words đúng định dạng tiếng Việt |
| **Dữ liệu đầu vào (Inputs)** | `{ "employee_id": 1, "month": 5, "year": 2026 }` |
| **Kết quả mong đợi (Expected Output)** | **201** — Payslip detail đầy đủ: earnings breakdown, deductions (insurance + PIT), net_pay_in_words |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-EMPLOYEE-01 |

### TC-PAYROLL-04 — Nhân viên không có SalaryConfig (P1 — WHITE-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-PAYROLL-04` |
| **Hạng mục (Test Item)** | `POST /payroll/generate` |
| **Điều kiện tiên quyết (Preconditions)** | Ít nhất 1 employee không có SalaryConfig |
| **Các bước thực hiện (Test Steps)** | Kiểm tra log server |
| **Dữ liệu đầu vào (Inputs)** | `{ "month": 5, "year": 2026 }` — có employee thiếu SalaryConfig |
| **Kết quả mong đợi (Expected Output)** | Employee đó bị bỏ qua (log cảnh báo), các employee khác vẫn được tạo payslip |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (WHITE-BOX) | Phụ thuộc: TC-EMPLOYEE-01 |

### TC-PAYROLL-05 — Tính KPI bonus (chỉ khi baseSalary >= 10M) (P1 — WHITE-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-PAYROLL-05` |
| **Hạng mục (Test Item)** | `POST /payroll/generate` |
| **Điều kiện tiên quyết (Preconditions)** | KPI period, assignments đã có |
| **Các bước thực hiện (Test Steps)** | Kiểm tra công thức tính trong payslip |
| **Dữ liệu đầu vào (Inputs)** | Employee A: base_salary = 12M, KPI score = 90, kpi_bonus_percentage = 30%; Employee B: base_salary = 8M, KPI score = 90 |
| **Kết quả mong đợi (Expected Output)** | Employee A: bonus = (90/100) * (12M * 30%) = 3.24M; Employee B: bonus = 0 |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (WHITE-BOX) | Phụ thuộc: TC-KPI-01, TC-KPI-06 |

### TC-PAYROLL-06 — Tính PIT 7 bậc lũy tiến (P1 — WHITE-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-PAYROLL-06` |
| **Hạng mục (Test Item)** | `POST /payroll/generate` — verify PIT calculation |
| **Điều kiện tiên quyết (Preconditions)** | SalaryConfig có dependents_count = 1 |
| **Các bước thực hiện (Test Steps)** | Tính tay để đối chiếu |
| **Dữ liệu đầu vào (Inputs)** | Thu nhập tính thuế = 20M, giảm trừ bản thân = 11M, 1 người phụ thuộc = 4.4M |
| **Kết quả mong đợi (Expected Output)** | Thu nhập chịu thuế = 20M - 11M - 4.4M = 4.6M → bậc 1 (5%) = 230,000 VND |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (WHITE-BOX) | Phụ thuộc: TC-PAYROLL-01 |

### TC-PAYROLL-07 — Xem danh sách payslip (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-PAYROLL-07` |
| **Hạng mục (Test Item)** | `GET /payroll/list?month=5&year=2026` |
| **Điều kiện tiên quyết (Preconditions)** | Đã generate payslip tháng 5/2026 |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | Admin JWT (`manage:payroll`) |
| **Kết quả mong đợi (Expected Output)** | **200** — Mảng Payslip[] kèm employee, department, payroll_period |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-PAYROLL-01 |

### TC-PAYROLL-08 — Nhân viên xem payslip của mình (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-PAYROLL-08` |
| **Hạng mục (Test Item)** | `GET /payroll/my-payslips` |
| **Điều kiện tiên quyết (Preconditions)** | Nhân viên đã có payslip |
| **Các bước thực hiện (Test Steps)** | Tự động lấy employee_id từ JWT |
| **Dữ liệu đầu vào (Inputs)** | JWT của nhân viên |
| **Kết quả mong đợi (Expected Output)** | **200** — Payslip[] của nhân viên đó, sắp xếp mới nhất trước |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-PAYROLL-01 |

### TC-PAYROLL-09 — Duyệt payslip (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-PAYROLL-09` |
| **Hạng mục (Test Item)** | `PATCH /payroll/:id/approve` |
| **Điều kiện tiên quyết (Preconditions)** | Payslip ở trạng thái PENDING |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | Admin JWT |
| **Kết quả mong đợi (Expected Output)** | **200** — Payslip status → APPROVED, notification gửi cho nhân viên |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-PAYROLL-01 |

### TC-PAYROLL-10 — Đánh dấu đã thanh toán (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-PAYROLL-10` |
| **Hạng mục (Test Item)** | `PATCH /payroll/:id/mark-paid` |
| **Điều kiện tiên quyết (Preconditions)** | Payslip đã APPROVED |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | Admin JWT |
| **Kết quả mong đợi (Expected Output)** | **200** — Payslip status → PAID, notification gửi kèm số tiền net đã format |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-PAYROLL-09 |

### TC-PAYROLL-11 — Duyệt hàng loạt payslip (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-PAYROLL-11` |
| **Hạng mục (Test Item)** | `POST /payroll/approve-all` |
| **Điều kiện tiên quyết (Preconditions)** | Có ít nhất 2 payslip PENDING |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "month": 5, "year": 2026 }` |
| **Kết quả mong đợi (Expected Output)** | **201** — Tất cả payslip PENDING → APPROVED, mỗi nhân viên nhận 1 notification |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-PAYROLL-01 |

### TC-PAYROLL-12 — Cấu hình lương (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-PAYROLL-12` |
| **Hạng mục (Test Item)** | `PATCH /payroll/config/:employeeId` |
| **Điều kiện tiên quyết (Preconditions)** | Employee tồn tại |
| **Các bước thực hiện (Test Steps)** | Nếu chưa có config → INSERT; nếu có → UPDATE |
| **Dữ liệu đầu vào (Inputs)** | `{ "base_salary": "15000000", "transport_allowance": "500000", "lunch_allowance": "700000", "responsibility_allowance": "2000000", "kpi_bonus_percentage": 30 }` |
| **Kết quả mong đợi (Expected Output)** | **200** — SalaryConfig created/updated |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-EMPLOYEE-01 |

### TC-PAYROLL-13 — Tạo điều chỉnh lương (Bonus/Penalty) (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-PAYROLL-13` |
| **Hạng mục (Test Item)** | `POST /payroll/adjustments` |
| **Điều kiện tiên quyết (Preconditions)** | Employee tồn tại |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "employee_id": 1, "type": "Bonus", "amount": "2000000", "applied_month": "05/2026", "reason": "Thưởng dự án" }` |
| **Kết quả mong đợi (Expected Output)** | **201** — SalaryAdjustment (status: Pending), notification cho nhân viên |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-EMPLOYEE-01 |

---

## 6. Module: KPI (Đánh giá Hiệu suất)

### TC-KPI-01 — Tạo thư viện KPI (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-KPI-01` |
| **Hạng mục (Test Item)** | `POST /kpi/library` |
| **Điều kiện tiên quyết (Preconditions)** | Không |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "name": "Doanh số bán hàng", "unit": "VND", "calculation_formula": "actual/target*100" }` — Admin (`manage:system`) |
| **Kết quả mong đợi (Expected Output)** | **201** — KpiLibrary object |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-KPI-02 — Tạo kỳ đánh giá KPI (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-KPI-02` |
| **Hạng mục (Test Item)** | `POST /kpi/period` |
| **Điều kiện tiên quyết (Preconditions)** | Không |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "name": "KPI Quý 2/2026", "start_date": "2026-04-01", "end_date": "2026-06-30" }` |
| **Kết quả mong đợi (Expected Output)** | **201** — KpiPeriod object |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-KPI-03 — Gán KPI cho nhân viên (P0 — INTEGRATION)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-KPI-03` |
| **Hạng mục (Test Item)** | `POST /kpi/assign` |
| **Điều kiện tiên quyết (Preconditions)** | Employee, Period, KpiLibrary tồn tại; tổng weight = 100 |
| **Các bước thực hiện (Test Steps)** | Xóa assignment cũ của employee trong period đó trước khi insert mới |
| **Dữ liệu đầu vào (Inputs)** | `{ "employee_id": 1, "period_id": 1, "assignments": [{ "kpi_library_id": 1, "target_value": 100000000, "weight": 100 }] }` |
| **Kết quả mong đợi (Expected Output)** | **201** — Mảng KpiAssignment[], notification gửi cho nhân viên |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P0** (INTEGRATION) | Phụ thuộc: TC-EMPLOYEE-01, TC-KPI-01, TC-KPI-02 |

### TC-KPI-04 — Gán KPI với tổng weight khác 100% (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-KPI-04` |
| **Hạng mục (Test Item)** | `POST /kpi/assign` |
| **Điều kiện tiên quyết (Preconditions)** | Không |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ ..., "assignments": [{ weight: 60 }, { weight: 30 }] }` (tổng = 90%) |
| **Kết quả mong đợi (Expected Output)** | **400** `{ message: "Tổng trọng số phải bằng 100%" }` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-KPI-01, TC-KPI-02 |

### TC-KPI-05 — Nhân viên cập nhật actual_value (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-KPI-05` |
| **Hạng mục (Test Item)** | `PATCH /kpi/assignment/:id/actual` |
| **Điều kiện tiên quyết (Preconditions)** | Assignment tồn tại, thuộc về nhân viên |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "actual_value": 85000000 }` — JWT của nhân viên được gán |
| **Kết quả mong đợi (Expected Output)** | **200** — Assignment updated, status → SUBMITTED |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-KPI-03 |

### TC-KPI-06 — Quản lý chấm điểm KPI (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-KPI-06` |
| **Hạng mục (Test Item)** | `PATCH /kpi/assignment/:id/grade` |
| **Điều kiện tiên quyết (Preconditions)** | Assignment đã SUBMITTED |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "manager_score": 90 }` — Admin/Manager JWT |
| **Kết quả mong đợi (Expected Output)** | **200** — Assignment updated, status → APPROVED |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-KPI-05 |

### TC-KPI-07 — Tính điểm KPI cuối cùng (P1 — WHITE-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-KPI-07` |
| **Hạng mục (Test Item)** | `GET /kpi/calculate-score?employee_id=1&period_id=1` |
| **Điều kiện tiên quyết (Preconditions)** | Có assignment cho employee trong period |
| **Các bước thực hiện (Test Steps)** | Cap achievement ở 120% |
| **Dữ liệu đầu vào (Inputs)** | Query params: employee_id, period_id |
| **Kết quả mong đợi (Expected Output)** | **200** — Số thực: `sum(achievement * weight/100)` với achievement = min(120, actual/target*100), dùng manager_score nếu có |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (WHITE-BOX) | Phụ thuộc: TC-KPI-06 |

### TC-KPI-08 — Xem KPI của tôi (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-KPI-08` |
| **Hạng mục (Test Item)** | `GET /kpi/my-performance?period_id=1` |
| **Điều kiện tiên quyết (Preconditions)** | Đã được gán KPI |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | JWT nhân viên |
| **Kết quả mong đợi (Expected Output)** | **200** — Mảng assignment của nhân viên trong period |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-KPI-03 |

---

## 7. Module: Violations (Vi phạm)

### TC-VIOLATION-01 — Tạo vi phạm thủ công (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-VIOLATION-01` |
| **Hạng mục (Test Item)** | `POST /violations` |
| **Điều kiện tiên quyết (Preconditions)** | Admin có quyền `manage:employees` |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "employee_id": 1, "violation_date": "2026-05-18", "violation_type": "Đi muộn", "description": "Đi muộn 30 phút", "deduction_amount": "100000", "severity": "MINOR", "status": "PENDING" }` |
| **Kết quả mong đợi (Expected Output)** | **201** — Violation object, notification gửi cho nhân viên |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-EMPLOYEE-01 |

### TC-VIOLATION-02 — Đồng bộ chấm công thủ công (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-VIOLATION-02` |
| **Hạng mục (Test Item)** | `POST /violations/sync-attendance` |
| **Điều kiện tiên quyết (Preconditions)** | Có timekeeping hôm nay với hours_worked < 8 |
| **Các bước thực hiện (Test Steps)** | Không tạo trùng nếu đã có violation cho nhân viên hôm nay |
| **Dữ liệu đầu vào (Inputs)** | Admin JWT |
| **Kết quả mong đợi (Expected Output)** | **201** — Tạo violation "Incomplete Shift" cho tất cả timekeeping hôm nay có hours_worked < 8 |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-TK-05 |

### TC-VIOLATION-03 — Cron tự động đồng bộ nửa đêm (P0 — WHITE-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-VIOLATION-03` |
| **Hạng mục (Test Item)** | `@Cron EVERY_DAY_AT_MIDNIGHT` — `handleDailyAttendanceSync()` |
| **Điều kiện tiên quyết (Preconditions)** | Cron job được bật, có timekeeping thiếu giờ hôm qua |
| **Các bước thực hiện (Test Steps)** | Cần mock thời gian hoặc đợi cron thực |
| **Dữ liệu đầu vào (Inputs)** | Tự động kích hoạt lúc 00:00 |
| **Kết quả mong đợi (Expected Output)** | Tất cả timekeeping hôm qua có hours_worked < 8 → tạo violation; nếu có vi phạm mới → thông báo HR/Admin |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P0** (WHITE-BOX) | Phụ thuộc: TC-TK-05 |

### TC-VIOLATION-04 — Xem danh sách vi phạm (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-VIOLATION-04` |
| **Hạng mục (Test Item)** | `GET /violations?employeeId=1` |
| **Điều kiện tiên quyết (Preconditions)** | Có violation cho employee 1 |
| **Các bước thực hiện (Test Steps)** | Admin không truyền employeeId → xem tất cả |
| **Dữ liệu đầu vào (Inputs)** | JWT hợp lệ |
| **Kết quả mong đợi (Expected Output)** | **200** `{ records: Violation[], stats: { total, resolved } }` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-VIOLATION-01 |

### TC-VIOLATION-05 — Cập nhật vi phạm (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-VIOLATION-05` |
| **Hạng mục (Test Item)** | `PATCH /violations/:id` |
| **Điều kiện tiên quyết (Preconditions)** | Violation tồn tại |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "status": "RESOLVED", "deduction_amount": "50000" }` |
| **Kết quả mong đợi (Expected Output)** | **200** — Violation đã cập nhật |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-VIOLATION-01 |

---

## 8. Module: Resignations (Từ chức)

### TC-RESIGN-01 — Nộp đơn từ chức (P0 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-RESIGN-01` |
| **Hạng mục (Test Item)** | `POST /resignations` |
| **Điều kiện tiên quyết (Preconditions)** | Nhân viên Active, chưa có đơn PENDING nào |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "requested_last_day": "2026-06-18", "reason_text": "Chuyển công tác" }` |
| **Kết quả mong đợi (Expected Output)** | **201** — ResignationRequest (status: PENDING), notification gửi Admin/HR |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P0** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-RESIGN-02 — Nộp đơn khi đã có đơn Pending (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-RESIGN-02` |
| **Hạng mục (Test Item)** | `POST /resignations` |
| **Điều kiện tiên quyết (Preconditions)** | Nhân viên đã có ResignationRequest PENDING |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | Như trên |
| **Kết quả mong đợi (Expected Output)** | **400** `{ message: "Bạn đã có đơn từ chức đang chờ xử lý" }` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-RESIGN-01 |

### TC-RESIGN-03 — Duyệt đơn từ chức (Approved) (P0 — INTEGRATION)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-RESIGN-03` |
| **Hạng mục (Test Item)** | `PATCH /resignations/:id` |
| **Điều kiện tiên quyết (Preconditions)** | ResignationRequest PENDING, employee có contract Active |
| **Các bước thực hiện (Test Steps)** | Kiểm tra employee status và contract status sau khi approve |
| **Dữ liệu đầu vào (Inputs)** | `{ "status": "APPROVED", "resignation_category": "Personal" }` |
| **Kết quả mong đợi (Expected Output)** | **200** — Employee: employment_status → TERMINATED, resignation_reason, resignation_date; Contract Active → Terminated; Notification gửi nhân viên |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P0** (INTEGRATION) | Phụ thuộc: TC-RESIGN-01, TC-CONTRACT-01 |

### TC-RESIGN-04 — Từ chối đơn từ chức (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-RESIGN-04` |
| **Hạng mục (Test Item)** | `PATCH /resignations/:id` |
| **Điều kiện tiên quyết (Preconditions)** | ResignationRequest PENDING |
| **Các bước thực hiện (Test Steps)** | Kiểm tra employee vẫn Active |
| **Dữ liệu đầu vào (Inputs)** | `{ "status": "REJECTED" }` |
| **Kết quả mong đợi (Expected Output)** | **200** — ResignationRequest REJECTED, employee không bị thay đổi, notification gửi nhân viên |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-RESIGN-01 |

---

## 9. Module: Notifications (Thông báo)

### TC-NOTIF-01 — Xem danh sách thông báo (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-NOTIF-01` |
| **Hạng mục (Test Item)** | `GET /notifications` |
| **Điều kiện tiên quyết (Preconditions)** | Có ít nhất 1 notification |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | JWT nhân viên |
| **Kết quả mong đợi (Expected Output)** | **200** — Tối đa 50 notification mới nhất, sắp xếp giảm dần |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-NOTIF-02 — Đánh dấu đã đọc (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-NOTIF-02` |
| **Hạng mục (Test Item)** | `PATCH /notifications/:id/read` |
| **Điều kiện tiên quyết (Preconditions)** | Notification thuộc về user |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | JWT của chủ notification |
| **Kết quả mong đợi (Expected Output)** | **200** — Notification.isRead → true |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-NOTIF-01 |

### TC-NOTIF-03 — Xóa thông báo (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-NOTIF-03` |
| **Hạng mục (Test Item)** | `DELETE /notifications/:id` |
| **Điều kiện tiên quyết (Preconditions)** | Notification tồn tại, thuộc về user |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | JWT của chủ notification |
| **Kết quả mong đợi (Expected Output)** | **200** — Notification bị xóa khỏi DB |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-NOTIF-01 |

### TC-NOTIF-04 — Gửi thông báo toàn công ty (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-NOTIF-04` |
| **Hạng mục (Test Item)** | `POST /notifications/announce` |
| **Điều kiện tiên quyết (Preconditions)** | Người gửi có role admin/hr/hr manager/director |
| **Các bước thực hiện (Test Steps)** | Kiểm tra từng employee có bật preference `announcements` không |
| **Dữ liệu đầu vào (Inputs)** | `{ "title": "Thông báo công ty", "message": "Họp toàn thể lúc 14h" }` — Admin/HR JWT |
| **Kết quả mong đợi (Expected Output)** | **201** `{ success: true, count: N }` — Mỗi employee có bật `announcements` nhận 1 notification |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-EMPLOYEE-01 |

### TC-NOTIF-05 — Gửi thông báo không đủ quyền (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-NOTIF-05` |
| **Hạng mục (Test Item)** | `POST /notifications/announce` |
| **Điều kiện tiên quyết (Preconditions)** | Không |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | JWT của nhân viên thường |
| **Kết quả mong đợi (Expected Output)** | **403** ForbiddenException |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-NOTIF-06 — WebSocket: nhận thông báo real-time (P0 — WS)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-NOTIF-06` |
| **Hạng mục (Test Item)** | WebSocket `newNotification` event |
| **Điều kiện tiên quyết (Preconditions)** | Client kết nối WebSocket thành công, user có bật preference tương ứng |
| **Các bước thực hiện (Test Steps)** | Cần WebSocket client (vd: Postman WebSocket, script) |
| **Dữ liệu đầu vào (Inputs)** | Kết nối Socket.io với cookie JWT, sau đó trigger tạo notification từ 1 service khác |
| **Kết quả mong đợi (Expected Output)** | Client nhận event `newNotification` với payload `{ id, title, message, type, link, isRead, createdAt }` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P0** (WS) | Phụ thuộc: TC-AUTH-01 |

### TC-NOTIF-07 — WebSocket: tắt preference thì không nhận (P1 — WS)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-NOTIF-07` |
| **Hạng mục (Test Item)** | WebSocket — kiểm tra preference filter |
| **Điều kiện tiên quyết (Preconditions)** | Employee có `push_notifications = false` |
| **Các bước thực hiện (Test Steps)** | Kiểm tra DB không có notification mới |
| **Dữ liệu đầu vào (Inputs)** | Employee tắt `push_notifications`, trigger notification loại WARNING |
| **Kết quả mong đợi (Expected Output)** | Không emit event, notification không được lưu (trả về null) |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (WS) | Phụ thuộc: TC-AUTH-08 |

---

## 10. Module: Announcements (Thông báo công ty)

### TC-ANNC-01 — Tạo announcement (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-ANNC-01` |
| **Hạng mục (Test Item)** | `POST /announcements` |
| **Điều kiện tiên quyết (Preconditions)** | Admin quyền `manage:system` |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "title": "Lịch nghỉ lễ", "content": "...", "type": "general", "target_audience": "all", "priority": "normal", "status": "Active", "delivery_methods": ["in_app"] }` |
| **Kết quả mong đợi (Expected Output)** | **201** — Announcement, notification gửi cho toàn bộ employee (nếu có in_app) |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-ANNC-02 — Announcement theo phòng ban (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-ANNC-02` |
| **Hạng mục (Test Item)** | `POST /announcements` |
| **Điều kiện tiên quyết (Preconditions)** | Department 1 có ít nhất 2 employee |
| **Các bước thực hiện (Test Steps)** | Kiểm tra employee department 2 không nhận notification |
| **Dữ liệu đầu vào (Inputs)** | `{ ..., "target_audience": "dept_1" }` |
| **Kết quả mong đợi (Expected Output)** | **201** — Chỉ employee thuộc department 1 nhận notification |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-EMPLOYEE-01 |

### TC-ANNC-03 — Announcement không có in_app (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-ANNC-03` |
| **Hạng mục (Test Item)** | `POST /announcements` |
| **Điều kiện tiên quyết (Preconditions)** | Không |
| **Các bước thực hiện (Test Steps)** | Kiểm tra bảng notification không có bản ghi mới |
| **Dữ liệu đầu vào (Inputs)** | `{ ..., "delivery_methods": ["email"] }` (không có 'in_app') |
| **Kết quả mong đợi (Expected Output)** | **201** — Announcement được lưu nhưng không gửi notification (email chưa implemented) |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-ANNC-04 — Xem feed thông báo (đã lọc theo dept) (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-ANNC-04` |
| **Hạng mục (Test Item)** | `GET /announcements/feed` |
| **Điều kiện tiên quyết (Preconditions)** | Có announcement cho all và announcement cho dept_1, dept_2 |
| **Các bước thực hiện (Test Steps)** | Không thấy announcement của dept_2 |
| **Dữ liệu đầu vào (Inputs)** | JWT nhân viên department 1 |
| **Kết quả mong đợi (Expected Output)** | **200** — Announcements có target_audience = 'all' hoặc 'dept_1', status = Active |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-ANNC-01, TC-ANNC-02 |

---

## 11. Module: Messages (Nhắn tin 1:1)

### TC-MSG-01 — Gửi tin nhắn (P1 — BLACK-BOX + WS)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-MSG-01` |
| **Hạng mục (Test Item)** | `POST /messages` |
| **Điều kiện tiên quyết (Preconditions)** | Employee 1 và 2 tồn tại |
| **Các bước thực hiện (Test Steps)** | Kiểm tra WebSocket event trên client của user 2 |
| **Dữ liệu đầu vào (Inputs)** | `{ "receiverId": 2, "content": "Chào bạn" }` — JWT của user 1 |
| **Kết quả mong đợi (Expected Output)** | **201** — Message object. User 2 nhận notification + WebSocket `newMessage` nếu online |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX + WS) | Phụ thuộc: TC-EMPLOYEE-01 |

### TC-MSG-02 — Xem hội thoại (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-MSG-02` |
| **Hạng mục (Test Item)** | `GET /messages/:otherUserId` |
| **Điều kiện tiên quyết (Preconditions)** | Đã có tin nhắn giữa 2 user |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | JWT user 1, param = 2 |
| **Kết quả mong đợi (Expected Output)** | **200** — Mảng Message[] giữa user 1 và 2 |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-MSG-01 |

### TC-MSG-03 — Đánh dấu đã đọc (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-MSG-03` |
| **Hạng mục (Test Item)** | `PATCH /messages/:otherUserId/read` |
| **Điều kiện tiên quyết (Preconditions)** | Có tin nhắn chưa đọc từ user 1 |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | JWT user 2, param = 1 |
| **Kết quả mong đợi (Expected Output)** | **200** — Tất cả message từ user 1 gửi user 2: is_read → true |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-MSG-01 |

### TC-MSG-04 — Xóa tin nhắn (soft delete) (P1 — BLACK-BOX + WS)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-MSG-04` |
| **Hạng mục (Test Item)** | `DELETE /messages/:id` |
| **Điều kiện tiên quyết (Preconditions)** | Message thuộc về người gửi |
| **Các bước thực hiện (Test Steps)** | Kiểm tra content đã bị thay thế, không xóa cứng |
| **Dữ liệu đầu vào (Inputs)** | JWT của người gửi |
| **Kết quả mong đợi (Expected Output)** | **200** — Message: is_deleted = true, content → "..."; WebSocket `messageDeleted` emit cho cả sender và receiver |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX + WS) | Phụ thuộc: TC-MSG-01 |

### TC-MSG-05 — Người nhận không thể xóa tin nhắn (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-MSG-05` |
| **Hạng mục (Test Item)** | `DELETE /messages/:id` |
| **Điều kiện tiên quyết (Preconditions)** | Message có sender khác với người gọi API |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | JWT của người nhận (không phải sender) |
| **Kết quả mong đợi (Expected Output)** | **403** ForbiddenException |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-MSG-01 |

---

## 12. Module: Comments (Bình luận)

### TC-COMMENT-01 — Thêm bình luận (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-COMMENT-01` |
| **Hạng mục (Test Item)** | `POST /comments` |
| **Điều kiện tiên quyết (Preconditions)** | LeaveRequest ID 1 tồn tại |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "entityType": "LEAVE_REQUEST", "entityId": "1", "content": "Cần xem xét thêm" }` |
| **Kết quả mong đợi (Expected Output)** | **201** — Comment object (UUID id), notification gửi cho chủ entity |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-LEAVE-01 |

### TC-COMMENT-02 — Xem bình luận theo entity (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-COMMENT-02` |
| **Hạng mục (Test Item)** | `GET /comments/:entityType/:entityId` |
| **Điều kiện tiên quyết (Preconditions)** | Có comment cho entity |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | Params: LEAVE_REQUEST, 1 |
| **Kết quả mong đợi (Expected Output)** | **200** — Mảng Comment[] cho entity |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-COMMENT-01 |

---

## 13. Module: Contracts (Hợp đồng)

### TC-CONTRACT-01 — Tạo hợp đồng (P0 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-CONTRACT-01` |
| **Hạng mục (Test Item)** | `POST /contracts` |
| **Điều kiện tiên quyết (Preconditions)** | Employee 1 có SalaryConfig, contract_number chưa tồn tại |
| **Các bước thực hiện (Test Steps)** | Kiểm tra bảng salary_history có bản ghi mới |
| **Dữ liệu đầu vào (Inputs)** | `{ "employee_id": 1, "contract_number": "HD-2026-001", "contract_type": "Full-time", "start_date": "2026-05-01", "salary_rate": "15000000", "status": "Active" }` |
| **Kết quả mong đợi (Expected Output)** | **201** — Contract object, SalaryHistory được tạo từ SalaryConfig |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P0** (BLACK-BOX) | Phụ thuộc: TC-EMPLOYEE-01, TC-PAYROLL-12 |

### TC-CONTRACT-02 — Tạo hợp đồng trùng mã (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-CONTRACT-02` |
| **Hạng mục (Test Item)** | `POST /contracts` |
| **Điều kiện tiên quyết (Preconditions)** | Đã có contract với mã HD-2026-001 |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "contract_number": "HD-2026-001", ... }` (mã đã tồn tại) |
| **Kết quả mong đợi (Expected Output)** | **409** Conflict — `{ message: "Số hợp đồng đã tồn tại" }` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-CONTRACT-01 |

### TC-CONTRACT-03 — Tạo hợp đồng Active → tự động deactivate hợp đồng cũ (P1 — INTEGRATION)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-CONTRACT-03` |
| **Hạng mục (Test Item)** | `POST /contracts` |
| **Điều kiện tiên quyết (Preconditions)** | Employee có 1 contract Active |
| **Các bước thực hiện (Test Steps)** | Kiểm tra contract cũ: status = 'Expired' |
| **Dữ liệu đầu vào (Inputs)** | Tạo contract Active mới cho employee đã có contract Active |
| **Kết quả mong đợi (Expected Output)** | **201** — Contract mới Active; contract cũ → Expired |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (INTEGRATION) | Phụ thuộc: TC-CONTRACT-01 |

### TC-CONTRACT-04 — Cập nhật hợp đồng (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-CONTRACT-04` |
| **Hạng mục (Test Item)** | `PATCH /contracts/:id` |
| **Điều kiện tiên quyết (Preconditions)** | Contract tồn tại, salary_rate thay đổi |
| **Các bước thực hiện (Test Steps)** | Kiểm tra salary_history có bản ghi mới |
| **Dữ liệu đầu vào (Inputs)** | `{ "salary_rate": "20000000" }` |
| **Kết quả mong đợi (Expected Output)** | **200** — Contract updated, SalaryHistory ghi nhận old → new salary |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-CONTRACT-01 |

### TC-CONTRACT-05 — Xóa hợp đồng (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-CONTRACT-05` |
| **Hạng mục (Test Item)** | `DELETE /contracts/:id` |
| **Điều kiện tiên quyết (Preconditions)** | Contract tồn tại |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | Admin JWT |
| **Kết quả mong đợi (Expected Output)** | **200** — Contract bị xóa cứng khỏi DB |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-CONTRACT-01 |

### TC-CONTRACT-06 — Xem hợp đồng theo nhân viên (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-CONTRACT-06` |
| **Hạng mục (Test Item)** | `GET /contracts/employee/:employeeId` |
| **Điều kiện tiên quyết (Preconditions)** | Employee có ít nhất 1 contract |
| **Các bước thực hiện (Test Steps)** | Nhân viên thường chỉ xem được contract của mình |
| **Dữ liệu đầu vào (Inputs)** | JWT của chính nhân viên hoặc Admin |
| **Kết quả mong đợi (Expected Output)** | **200** — Contract[] sắp xếp: status ASC (Active trước), start_date DESC |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-CONTRACT-01 |

---

## 14. Module: Departments (Phòng ban)

### TC-DEPT-01 — Tạo phòng ban (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-DEPT-01` |
| **Hạng mục (Test Item)** | `POST /departments` |
| **Điều kiện tiên quyết (Preconditions)** | Không |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "department_name": "Phòng Kỹ thuật" }` |
| **Kết quả mong đợi (Expected Output)** | **201** — Department object |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-DEPT-02 — Cập nhật phòng ban (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-DEPT-02` |
| **Hạng mục (Test Item)** | `PATCH /departments/:id` |
| **Điều kiện tiên quyết (Preconditions)** | Department tồn tại |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "department_name": "Phòng Công nghệ" }` |
| **Kết quả mong đợi (Expected Output)** | **200** — Department đã cập nhật |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-DEPT-01 |

### TC-DEPT-03 — Xóa phòng ban (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-DEPT-03` |
| **Hạng mục (Test Item)** | `DELETE /departments/:id` |
| **Điều kiện tiên quyết (Preconditions)** | Department không có employee |
| **Các bước thực hiện (Test Steps)** | Nếu có employee → lỗi FK constraint |
| **Dữ liệu đầu vào (Inputs)** | Admin JWT (`manage:system`) |
| **Kết quả mong đợi (Expected Output)** | **200** — Department bị xóa |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-DEPT-01 |

---

## 15. Module: Positions (Chức vụ)

### TC-POS-01 — Tạo chức vụ (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-POS-01` |
| **Hạng mục (Test Item)** | `POST /positions` |
| **Điều kiện tiên quyết (Preconditions)** | position_name chưa tồn tại |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "position_name": "Nhân viên kinh doanh" }` |
| **Kết quả mong đợi (Expected Output)** | **201** — Position object |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-POS-02 — Tạo chức vụ trùng tên (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-POS-02` |
| **Hạng mục (Test Item)** | `POST /positions` |
| **Điều kiện tiên quyết (Preconditions)** | Position name đã tồn tại |
| **Các bước thực hiện (Test Steps)** | UK constraint trên position_name |
| **Dữ liệu đầu vào (Inputs)** | `{ "position_name": "Nhân viên kinh doanh" }` (đã tồn tại) |
| **Kết quả mong đợi (Expected Output)** | **409** Conflict |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-POS-01 |

---

## 16. Module: Permissions — RBAC (Phân quyền)

### TC-RBAC-01 — Xem ma trận phân quyền (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-RBAC-01` |
| **Hạng mục (Test Item)** | `GET /admin/permissions/matrix` |
| **Điều kiện tiên quyết (Preconditions)** | Có position và permission trong DB |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | Admin JWT |
| **Kết quả mong đợi (Expected Output)** | **200** `[{ position_id, position_name, permissions: [{ permission_id, permission_name }] }]` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-POS-01 |

### TC-RBAC-02 — Gán quyền cho chức vụ (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-RBAC-02` |
| **Hạng mục (Test Item)** | `POST /admin/permissions/assign` |
| **Điều kiện tiên quyết (Preconditions)** | Position và Permission tồn tại, assignment chưa có |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "position_id": 1, "permission_id": 5 }` |
| **Kết quả mong đợi (Expected Output)** | **201** — PositionPermission created |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-POS-01 |

### TC-RBAC-03 — Gán trùng quyền (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-RBAC-03` |
| **Hạng mục (Test Item)** | `POST /admin/permissions/assign` |
| **Điều kiện tiên quyết (Preconditions)** | Assignment đã tồn tại |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "position_id": 1, "permission_id": 5 }` (đã được gán) |
| **Kết quả mong đợi (Expected Output)** | **400** `{ message: "Quyền này đã được gán cho chức vụ" }` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-RBAC-02 |

### TC-RBAC-04 — Thu hồi quyền (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-RBAC-04` |
| **Hạng mục (Test Item)** | `POST /admin/permissions/revoke` |
| **Điều kiện tiên quyết (Preconditions)** | Assignment tồn tại |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "position_id": 1, "permission_id": 5 }` |
| **Kết quả mong đợi (Expected Output)** | **201** — PositionPermission bị xóa |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-RBAC-02 |

### TC-RBAC-05 — Cập nhật hàng loạt quyền cho chức vụ (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-RBAC-05` |
| **Hạng mục (Test Item)** | `PUT /admin/roles/:id/permissions` |
| **Điều kiện tiên quyết (Preconditions)** | Position tồn tại, đã có 1 số assignment cũ |
| **Các bước thực hiện (Test Steps)** |  |
| **Dữ liệu đầu vào (Inputs)** | `{ "permission_ids": [1, 2, 3, 4] }` |
| **Kết quả mong đợi (Expected Output)** | **200** — Xóa toàn bộ assignment cũ, insert batch mới |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-RBAC-02 |

### TC-RBAC-06 — Guard kiểm tra quyền (P0 — WHITE-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-RBAC-06` |
| **Hạng mục (Test Item)** | `RolesGuard` / `PermissionsGuard` |
| **Điều kiện tiên quyết (Preconditions)** | User có position không được gán quyền `manage:payroll` |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | Gọi endpoint có `@Permissions("manage:payroll")` với user không có quyền |
| **Kết quả mong đợi (Expected Output)** | **403** ForbiddenException |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P0** (WHITE-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-RBAC-07 — Admin bypass tất cả quyền (P1 — WHITE-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-RBAC-07` |
| **Hạng mục (Test Item)** | `RolesGuard` — Admin bypass |
| **Điều kiện tiên quyết (Preconditions)** | Position name chứa 'admin' hoặc 'system admin' hoặc 'director' hoặc 'hr manager' hoặc 'hr' |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | User có position chứa 'admin' gọi endpoint `@Permissions("manage:payroll")` dù không có quyền cụ thể |
| **Kết quả mong đợi (Expected Output)** | **200** — Cho phép truy cập (bypass) |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (WHITE-BOX) | Phụ thuộc: TC-AUTH-01 |

---

## 17. Module: Company Profile (Hồ sơ công ty)

### TC-CPROFILE-01 — Xem hồ sơ công ty (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-CPROFILE-01` |
| **Hạng mục (Test Item)** | `GET /company-profile` |
| **Điều kiện tiên quyết (Preconditions)** | CompanyProfile đã được tạo |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | JWT hợp lệ |
| **Kết quả mong đợi (Expected Output)** | **200** — CompanyProfile object |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-CPROFILE-02 — Cập nhật hồ sơ công ty (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-CPROFILE-02` |
| **Hạng mục (Test Item)** | `PATCH /company-profile` |
| **Điều kiện tiên quyết (Preconditions)** | CompanyProfile tồn tại |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "company_name": "Công ty TNHH ABC", "base_currency": "VND", "address": "Hà Nội" }` — Admin (`manage:system`) |
| **Kết quả mong đợi (Expected Output)** | **200** — CompanyProfile updated |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-CPROFILE-01 |

### TC-CPROFILE-03 — Upload logo công ty (P3 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-CPROFILE-03` |
| **Hạng mục (Test Item)** | `PATCH /company-profile/logo` |
| **Điều kiện tiên quyết (Preconditions)** | Thư mục `./uploads/company/` tồn tại |
| **Các bước thực hiện (Test Steps)** | Chấp nhận SVG |
| **Dữ liệu đầu vào (Inputs)** | Multipart: `file` = ảnh PNG/SVG |
| **Kết quả mong đợi (Expected Output)** | **200** — logo_url cập nhật, file lưu trong `./uploads/company/` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P3** (BLACK-BOX) | Phụ thuộc: TC-CPROFILE-01 |

---

## 18. Module: Company Settings (Cài đặt hệ thống)

### TC-CSETTINGS-01 — Xem tất cả settings (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-CSETTINGS-01` |
| **Hạng mục (Test Item)** | `GET /admin/settings` |
| **Điều kiện tiên quyết (Preconditions)** | Có ít nhất `COMPANY_IP_WHITELIST` setting |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | Admin JWT |
| **Kết quả mong đợi (Expected Output)** | **200** — Mảng CompanySettings[] |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-CSETTINGS-02 — Cập nhật setting (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-CSETTINGS-02` |
| **Hạng mục (Test Item)** | `PATCH /admin/settings` |
| **Điều kiện tiên quyết (Preconditions)** | Key tồn tại |
| **Các bước thực hiện (Test Steps)** | Kiểm tra IP check-in hoạt động với whitelist mới |
| **Dữ liệu đầu vào (Inputs)** | `{ "key": "COMPANY_IP_WHITELIST", "value": "[\"192.168.1.0/24\"]" }` |
| **Kết quả mong đợi (Expected Output)** | **200** — Setting updated, IPWhitelistGuard dùng giá trị mới |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-CSETTINGS-01 |

---

## 19. Module: Dashboard (Bảng điều khiển)

### TC-DASH-01 — Dashboard nhân viên (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-DASH-01` |
| **Hạng mục (Test Item)** | `GET /dashboard/employee` |
| **Điều kiện tiên quyết (Preconditions)** | Employee có LeaveBalance, có announcement Active |
| **Các bước thực hiện (Test Steps)** | daysWorkedThisMonth hardcode = 18 |
| **Dữ liệu đầu vào (Inputs)** | JWT nhân viên |
| **Kết quả mong đợi (Expected Output)** | **200** `{ stats: { ptoBalance, daysWorkedThisMonth: 18 }, nextHoliday, recentAnnouncements: [...] }` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-DASH-02 — Dashboard admin (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-DASH-02` |
| **Hạng mục (Test Item)** | `GET /dashboard/admin` |
| **Điều kiện tiên quyết (Preconditions)** | Có leave requests PENDING và resignation requests PENDING |
| **Các bước thực hiện (Test Steps)** | attendance stats hardcode |
| **Dữ liệu đầu vào (Inputs)** | Admin JWT (`manage:system`) |
| **Kết quả mong đợi (Expected Output)** | **200** `{ attendance: { total: 150, present: 142, absent: 5, late: 3 }, pendingApprovals: { leaveRequests: N, resignations: M } }` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-LEAVE-01, TC-RESIGN-01 |

---

## 20. Module: Reports (Báo cáo)

### TC-REPORT-01 — Báo cáo tổng lương theo phòng ban (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-REPORT-01` |
| **Hạng mục (Test Item)** | `GET /reports/payroll-summary?month=5&year=2026` |
| **Điều kiện tiên quyết (Preconditions)** | Đã generate payslip tháng 5/2026 |
| **Các bước thực hiện (Test Steps)** | Gom nhóm theo department, tính avg_salary |
| **Dữ liệu đầu vào (Inputs)** | Admin JWT |
| **Kết quả mong đợi (Expected Output)** | **200** `{ month, year, total_payroll, total_base_salary, total_bonus, total_deductions, employees_processed, avg_salary, payroll_by_department: [...] }` |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-PAYROLL-01 |

### TC-REPORT-02 — Báo cáo dashboard (12 tháng) (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-REPORT-02` |
| **Hạng mục (Test Item)** | `GET /reports/dashboard` |
| **Điều kiện tiên quyết (Preconditions)** | Có dữ liệu payroll và contract 12 tháng gần nhất |
| **Các bước thực hiện (Test Steps)** | Turnover tính từ new_hires và resigned mỗi tháng |
| **Dữ liệu đầu vào (Inputs)** | Admin JWT (`manage:system` hoặc `manage:payroll`) |
| **Kết quả mong đợi (Expected Output)** | **200** `{ salary_trend: [...], headcount_trend: [...], turnover: [...], personnel_by_department: [...] }` — mỗi mảng 12 phần tử |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-PAYROLL-01, TC-CONTRACT-01 |

---

## 21. Module: Holiday (Ngày lễ)

### TC-HOLIDAY-01 — Xem danh sách ngày lễ (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-HOLIDAY-01` |
| **Hạng mục (Test Item)** | `GET /admin/holidays?year=2026` |
| **Điều kiện tiên quyết (Preconditions)** | Có ngày lễ trong DB |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | Admin JWT |
| **Kết quả mong đợi (Expected Output)** | **200** — Mảng PublicHoliday[] năm 2026 |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-HOLIDAY-02 — Tạo ngày lễ (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-HOLIDAY-02` |
| **Hạng mục (Test Item)** | `POST /admin/holidays` |
| **Điều kiện tiên quyết (Preconditions)** | Không |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | `{ "name": "Tết Dương lịch", "date": "2026-01-01", "type": "public", "is_recurring": true, "year": 2026 }` |
| **Kết quả mong đợi (Expected Output)** | **201** — PublicHoliday object |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-AUTH-01 |

### TC-HOLIDAY-03 — Seed ngày lễ Việt Nam (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-HOLIDAY-03` |
| **Hạng mục (Test Item)** | `POST /admin/holidays/seed/vietnam/2026` |
| **Điều kiện tiên quyết (Preconditions)** | Chưa có dữ liệu ngày lễ 2026 |
| **Các bước thực hiện (Test Steps)** | Kiểm tra đủ 12 ngày lễ |
| **Dữ liệu đầu vào (Inputs)** | Admin JWT |
| **Kết quả mong đợi (Expected Output)** | **201** — 12 ngày lễ Việt Nam được tạo (Tết Dương lịch, Tết Nguyên đán, Giỗ Tổ Hùng Vương, 30/4, 1/5, Quốc khánh 2/9) |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: Không |

### TC-HOLIDAY-04 — Xóa ngày lễ (P3 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-HOLIDAY-04` |
| **Hạng mục (Test Item)** | `DELETE /admin/holidays/:id` |
| **Điều kiện tiên quyết (Preconditions)** | Holiday tồn tại |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | Admin JWT |
| **Kết quả mong đợi (Expected Output)** | **200** — PublicHoliday bị xóa |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P3** (BLACK-BOX) | Phụ thuộc: TC-HOLIDAY-02 |

---

## 22. Module: Admin — Quản lý tổ chức

### TC-ADMIN-01 — Thống kê tổ chức (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-ADMIN-01` |
| **Hạng mục (Test Item)** | `GET /admin/organization/stats` |
| **Điều kiện tiên quyết (Preconditions)** | Có dữ liệu tổ chức |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | Admin JWT |
| **Kết quả mong đợi (Expected Output)** | **200** — Số liệu: departments, employees, budget |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-DEPT-01, TC-EMPLOYEE-01 |

### TC-ADMIN-02 — Chuyển phòng ban nhân viên (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-ADMIN-02` |
| **Hạng mục (Test Item)** | `PUT /admin/employees/:id/transfer` |
| **Điều kiện tiên quyết (Preconditions)** | Employee là manager department 1 |
| **Các bước thực hiện (Test Steps)** | Kiểm tra department 1: manager_id → NULL |
| **Dữ liệu đầu vào (Inputs)** | `{ "department_id": 2, "position_id": 3 }` |
| **Kết quả mong đợi (Expected Output)** | **200** — Employee cập nhật dept/pos; nếu đang là manager dept cũ → gỡ quyền manager |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-EMPLOYEE-01 |

### TC-ADMIN-03 — Xóa mềm nhân viên (Admin) (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-ADMIN-03` |
| **Hạng mục (Test Item)** | `DELETE /admin/employees/:id` |
| **Điều kiện tiên quyết (Preconditions)** | Employee tồn tại, có thể là manager |
| **Các bước thực hiện (Test Steps)** | Soft delete — employee vẫn trong DB |
| **Dữ liệu đầu vào (Inputs)** | Admin JWT |
| **Kết quả mong đợi (Expected Output)** | **200** — Employee: deleted_at được set, employment_status → TERMINATED, gỡ manager nếu có |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: TC-EMPLOYEE-01 |

---

## 23. Kiểm thử Tích hợp Liên module (End-to-End)

### TC-E2E-01 — Luồng đầy đủ: Tuyển dụng → Chấm công → Nghỉ phép → Lương → Nghỉ việc (P0 — INTEGRATION)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-E2E-01` |
| **Hạng mục (Test Item)** | Toàn bộ vòng đời nhân viên |
| **Điều kiện tiên quyết (Preconditions)** | Database sạch hoặc có dữ liệu test |
| **Các bước thực hiện (Test Steps)** |  |
| **Dữ liệu đầu vào (Inputs)** | Chuỗi thao tác tuần tự |
| **Kết quả mong đợi (Expected Output)** | Tất cả bước thành công, dữ liệu nhất quán |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P0** (INTEGRATION) | Phụ thuộc:  |

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
| **Mã ca kiểm thử (TC-ID)** | `TC-E2E-02` |
| **Hạng mục (Test Item)** | Kiểm tra WebSocket nhận notification từ nhiều nguồn |
| **Điều kiện tiên quyết (Preconditions)** | WebSocket client kết nối với JWT cookie |
| **Các bước thực hiện (Test Steps)** |  |
| **Dữ liệu đầu vào (Inputs)** | Kết nối WebSocket, thực hiện các hành động tạo notification |
| **Kết quả mong đợi (Expected Output)** | Nhận các event: `newNotification` cho leave, payroll, violation, announcement, message |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (WS) | Phụ thuộc:  |

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
| **Mã ca kiểm thử (TC-ID)** | `TC-SEC-01` |
| **Hạng mục (Test Item)** | Tất cả endpoint nhận tham số string |
| **Điều kiện tiên quyết (Preconditions)** | TypeORM + parameterized queries |
| **Các bước thực hiện (Test Steps)** | Test trên tất cả GET endpoint có query params |
| **Dữ liệu đầu vào (Inputs)** | `' OR '1'='1`, `'; DROP TABLE employee; --` trong query params và body |
| **Kết quả mong đợi (Expected Output)** | **400** validation error hoặc kết quả rỗng — không có SQL execution |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P0** (BLACK-BOX) | Phụ thuộc: Không |

### TC-SEC-02 — XSS (P0 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-SEC-02` |
| **Hạng mục (Test Item)** | Tất cả endpoint nhận text input |
| **Điều kiện tiên quyết (Preconditions)** | Không |
| **Các bước thực hiện (Test Steps)** | Kiểm tra response chứa nguyên script tag |
| **Dữ liệu đầu vào (Inputs)** | `<script>alert('xss')</script>` trong first_name, reason, description, content |
| **Kết quả mong đợi (Expected Output)** | Dữ liệu lưu nguyên bản (backend không escape), frontend phải escape khi render |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P0** (BLACK-BOX) | Phụ thuộc: Không |

### TC-SEC-03 — JWT hết hạn / giả mạo (P0 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-SEC-03` |
| **Hạng mục (Test Item)** | Tất cả endpoint yêu cầu JwtAuthGuard |
| **Điều kiện tiên quyết (Preconditions)** | Không |
| **Các bước thực hiện (Test Steps)** | Không |
| **Dữ liệu đầu vào (Inputs)** | Token hết hạn, token tự tạo với secret sai, không có token |
| **Kết quả mong đợi (Expected Output)** | **401** UnauthorizedException |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P0** (BLACK-BOX) | Phụ thuộc: Không |

### TC-SEC-04 — CSRF qua cookie (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-SEC-04` |
| **Hạng mục (Test Item)** | Endpoint POST/PATCH/DELETE |
| **Điều kiện tiên quyết (Preconditions)** | CORS được cấu hình |
| **Các bước thực hiện (Test Steps)** | Gửi request với Origin header khác |
| **Dữ liệu đầu vào (Inputs)** | Request từ origin khác, không có cookie JWT |
| **Kết quả mong đợi (Expected Output)** | **401** UnauthorizedException |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: Không |

### TC-SEC-05 — IDOR (Insecure Direct Object Reference) (P1 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-SEC-05` |
| **Hạng mục (Test Item)** | Endpoint lấy dữ liệu theo ID |
| **Điều kiện tiên quyết (Preconditions)** | User A và B khác department |
| **Các bước thực hiện (Test Steps)** | Test trên: payslip, contract, leave request |
| **Dữ liệu đầu vào (Inputs)** | User A cố gắng truy cập payslip của user B (`GET /payroll/999`) |
| **Kết quả mong đợi (Expected Output)** | **403** hoặc **404** — không cho phép truy cập dữ liệu của người khác |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P1** (BLACK-BOX) | Phụ thuộc: TC-EMPLOYEE-01 |

### TC-SEC-06 — Rate Limiting Brute Force (P2 — BLACK-BOX)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử (TC-ID)** | `TC-SEC-06` |
| **Hạng mục (Test Item)** | `POST /auth/login` |
| **Điều kiện tiên quyết (Preconditions)** | Rate limiting được cấu hình |
| **Các bước thực hiện (Test Steps)** | Gửi nhanh 10 request |
| **Dữ liệu đầu vào (Inputs)** | 10 request liên tiếp với sai mật khẩu |
| **Kết quả mong đợi (Expected Output)** | **429** Too Many Requests (nếu có rate limiting) |
| **Sự phụ thuộc & Mức độ ưu tiên** | Độ ưu tiên: **P2** (BLACK-BOX) | Phụ thuộc: Không |

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
