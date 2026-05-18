# Sơ đồ Sequence — Hệ thống HRM

> Các luồng vận hành chính được mô tả bằng sơ đồ sequence.

---

## 1. Luồng Đăng nhập & Xác thực

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant FE as Next.js Frontend
    participant BE as NestJS Backend
    participant DB as PostgreSQL

    U->>FE: Nhập email & mật khẩu
    FE->>BE: POST /api/auth/login { email, password }
    BE->>DB: SELECT Employee WHERE email = ?
    DB-->>BE: Bản ghi Employee (kèm password hash)
    BE->>BE: bcrypt.compare(password, hash)
    alt Thông tin không hợp lệ
        BE-->>FE: 401 Unauthorized
        FE-->>U: Hiển thị thông báo lỗi
    else Thông tin hợp lệ
        BE->>BE: jwtService.sign({ sub: id, email, role })
        BE-->>FE: 200 { success, user, access_token }
        BE-->>FE: Set-Cookie: access_token (HTTPOnly)
        FE->>FE: window.location = /dashboard
        FE->>BE: GET /api/auth/profile (kèm cookie)
        BE->>BE: JwtStrategy.validate(token từ cookie)
        BE->>DB: SELECT Employee + relations
        DB-->>BE: Hồ sơ nhân viên đầy đủ
        BE-->>FE: 200 { user với permissions, position }
        FE->>FE: AuthContext.setUser(user)
        FE-->>U: Hiển thị dashboard
    end
```

---

## 2. Luồng Nộp đơn Nghỉ phép → Duyệt → Cập nhật số dư

```mermaid
sequenceDiagram
    actor E as Nhân viên
    actor M as Quản lý/HR
    participant LC as LeaveController
    participant LS as LeaveService
    participant DB as PostgreSQL
    participant NS as NotificationsService
    participant GW as WebSocket Gateway

    %% ── Nộp đơn ──
    E->>LC: POST /api/leave/submit { leaveTypeId, startDate, endDate, reason }
    LC->>LS: submitRequest(employeeId, ...)
    LS->>DB: SELECT LeaveType WHERE leave_type_id = ?
    DB-->>LS: LeaveType
    LS->>DB: SELECT Employee WHERE employee_id = ?
    DB-->>LS: Employee
    LS->>DB: INSERT INTO leave_request (status='Pending')
    DB-->>LS: LeaveRequest đã tạo

    LS->>DB: SELECT employees WHERE position IN (admin, hr, director)
    DB-->>LS: Danh sách Admin/HR
    loop với mỗi admin/HR
        LS->>NS: createNotification(adminId, "Đơn nghỉ phép mới", ...)
        NS->>DB: INSERT INTO notification
        NS->>GW: sendNotificationToUser(adminId, notification)
        GW-->>M: WebSocket "newNotification" event
    end
    LS-->>LC: { request_id, status: "Pending" }
    LC-->>E: 201 Created

    %% ── Duyệt ──
    M->>LC: PATCH /api/leave/approve/:id { status: "Approved", adminNote }
    LC->>LS: approveLeaveRequest(requestId, "Approved", managerId, adminNote)
    LS->>DB: SELECT LeaveRequest WHERE request_id = ? (kèm employee, leave_type)
    DB-->>LS: LeaveRequest
    LS->>LS: previousStatus = leaveRequest.status
    LS->>DB: SELECT Employee WHERE employee_id = managerId
    DB-->>LS: Manager
    LS->>DB: UPDATE leave_request SET status='Approved', manager_approver=?, admin_note=?
    DB-->>LS: Đã cập nhật

    alt status == "Approved"
        LS->>LS: Tính số ngày làm việc (T2-T6) giữa start_date và end_date
        LS->>DB: SELECT LeaveBalance WHERE employee_id AND leave_type_id
        alt có bản ghi số dư
            LS->>DB: UPDATE leave_balance SET remaining_days = remaining_days - daysRequested
        else chưa có số dư
            LS->>DB: INSERT INTO leave_balance (employee, leave_type, remaining_days = default - daysRequested)
        end
    end

    LS->>NS: createNotification(employeeId, "Cập nhật đơn nghỉ phép", ...)
    NS->>GW: sendNotificationToUser(employeeId, notification)
    GW-->>E: WebSocket "newNotification" event
    LS-->>LC: { success }
    LC-->>M: 200 OK
```

---

## 3. Luồng Check-in / Check-out (Quét mã QR)

```mermaid
sequenceDiagram
    actor E as Nhân viên
    participant FE as Frontend (Scanner)
    participant TC as TimekeepingController
    participant TS as TimekeepingService
    participant DB as PostgreSQL
    participant NS as NotificationsService
    participant GW as WebSocket Gateway

    %% ── Phát QR ──
    FE->>TC: GET /api/timekeeping/qr/generate
    TC->>TS: generateDynamicQr()
    TS->>TS: token = uuidv4(), lưu vào Map với TTL 35s
    TS-->>TC: { token }
    TC-->>FE: { token } → hiển thị mã QR

    %% ── Quét QR (Check-in) ──
    E->>FE: Quét mã QR
    FE->>TC: POST /api/timekeeping/checkin-qr { token }
    TC->>TS: recordCheckInByDynamicQr(employeeId, token)
    TS->>TS: Xác thực token (tồn tại & chưa hết hạn)
    TS->>TS: Xóa token khỏi Map
    TS->>DB: BEGIN TRANSACTION
    TS->>DB: SELECT TimeKeeping WHERE check_in_time BETWEEN today (mới nhất)
    DB-->>TS: latestRecord (hoặc null)

    alt không có bản ghi HOẶC đã có check_out_time
        TS->>TS: Kiểm tra debounce (60s)
        TS->>TS: Xác định trạng thái (Đi muộn nếu > 08:30, nếu không là Có mặt)
        TS->>DB: INSERT INTO time_keeping (check_in_time, status)
        DB-->>TS: Bản ghi mới
        TS->>DB: COMMIT
        TS-->>TC: { status: "CHECK_IN", message: "Chào buổi sáng!" }
    else có bản ghi VÀ check_out_time IS NULL
        TS->>TS: Kiểm tra debounce (60s)
        TS->>TS: Cập nhật check_out_time, tính hours_worked
        TS->>TS: Cập nhật trạng thái (Có mặt/Nửa ngày)
        TS->>DB: UPDATE time_keeping SET check_out_time, hours_worked, status
        DB-->>TS: Đã cập nhật

        alt hours_worked < 8
            TS->>DB: INSERT INTO violation (Ca làm không đủ)
            TS->>NS: createNotification(employeeId, "Cảnh báo: Ca làm không đủ", ...)
            NS->>GW: sendNotificationToUser(employeeId)
            GW-->>E: WebSocket toast notification
        end

        TS->>DB: COMMIT
        TS-->>TC: { status: "CHECK_OUT", duration, message: "Hẹn gặp lại ngày mai!" }
    end

    TC-->>FE: Phản hồi
    FE-->>E: Hiển thị dialog thành công
```

---

## 4. Luồng Check-in bằng IP (Whitelist IP văn phòng)

```mermaid
sequenceDiagram
    actor E as Nhân viên
    participant FE as Frontend
    participant TC as TimekeepingController
    participant IPG as IPWhitelistGuard
    participant TS as TimekeepingService
    participant DB as PostgreSQL

    E->>FE: Nhấn nút "Check-in bằng IP"
    FE->>TC: POST /api/timekeeping/checkin-ip
    TC->>IPG: Kiểm tra IP (canActivate)
    IPG->>DB: SELECT CompanySettings WHERE key = 'COMPANY_IP_WHITELIST'
    DB-->>IPG: Danh sách IP được phép
    IPG->>IPG: So sánh IP client với whitelist
    alt IP không được phép
        IPG-->>TC: 403 Forbidden
        TC-->>FE: "IP không được phép check-in"
        FE-->>E: Hiển thị thông báo lỗi
    else IP hợp lệ
        IPG-->>TC: Cho phép
        TC->>TS: recordCheckInByIP(employeeId, ip)
        TS->>DB: BEGIN TRANSACTION
        TS->>DB: SELECT TimeKeeping mới nhất hôm nay
        DB-->>TS: latestRecord
        alt Không có bản ghi HOẶC đã checkout
            TS->>TS: Xác định trạng thái (Đi muộn/Có mặt)
            TS->>DB: INSERT INTO time_keeping (check_in_time, status, ip_address)
            TS->>DB: COMMIT
            TS-->>TC: { status: "CHECK_IN", message: "Check-in thành công!" }
        else Đã check-in nhưng chưa checkout
            TS->>TS: Cập nhật check_out_time, tính giờ làm
            TS->>DB: UPDATE time_keeping SET check_out_time, hours_worked, status
            TS->>DB: COMMIT
            TS-->>TC: { status: "CHECK_OUT", duration, message: "Check-out thành công!" }
        end
        TC-->>FE: Phản hồi
        FE-->>E: Hiển thị kết quả
    end
```

---

## 5. Luồng Tạo Bảng lương (Pipeline đầy đủ)

```mermaid
sequenceDiagram
    actor HR as HR/Tài chính
    participant PC as PayrollController
    participant PS as PayrollService
    participant DB as PostgreSQL
    participant KS as KpiService
    participant NS as NotificationsService

    HR->>PC: POST /api/payroll/generate { month, year }
    PC->>PS: generatePayslips(month, year, createdByUserId)

    %% Giai đoạn 1: Lấy tất cả dữ liệu đầu vào
    PS->>DB: SELECT/FIND PayrollPeriod WHERE month, year
    alt chưa tồn tại
        PS->>DB: INSERT PayrollPeriod (Draft, 26 ngày chuẩn)
    end
    PS->>DB: SELECT tất cả Employees (kèm position, department)
    DB-->>PS: Employees[]
    PS->>DB: SELECT TimeKeeping WHERE work_date BETWEEN tháng
    DB-->>PS: TimeKeepings[]
    PS->>DB: SELECT LeaveRequest WHERE status='Approved' AND start_date BETWEEN tháng
    DB-->>PS: LeaveRequests[] (kèm leave_type)

    %% Giai đoạn 2: Xây dựng map công/vắng
    PS->>PS: Xây dựng leaveDateSet cho mỗi nhân viên (tất cả ngày nghỉ)
    PS->>PS: Với mỗi timekeeping: bỏ qua nếu ngày nằm trong leaveDateSet, nếu không thì đếm Có mặt/Nửa ngày/Vắng
    PS->>PS: Với mỗi leave: nếu is_paid → workDaysMap += days, nếu không → absentDaysMap += days

    PS->>DB: SELECT SalaryAdjustments WHERE applied_month = "MM/YYYY" AND status='Approved'
    DB-->>PS: Adjustments[] (bonusMap, penaltyMap)
    PS->>DB: SELECT CompanySettings WHERE key = 'social_insurance_rate'
    DB-->>PS: insuranceRate

    %% Giai đoạn 3: Vòng lặp tính cho từng nhân viên
    loop với mỗi Employee
        PS->>PS: calculateAndSavePayslip(employee, period, ctx)

        PS->>DB: SELECT SalaryConfig WHERE employee_id
        alt không có SalaryConfig
            PS->>PS: Bỏ qua (cảnh báo)
        else có SalaryConfig
            PS->>PS: salaryPerDay = baseSalary / standardDays
            PS->>PS: actualDays = min(workDaysMap[id], standardDays)
            PS->>PS: unpaidAbsentDeduction = salaryPerDay * absentDaysMap[id]

            %% Tính OT
            PS->>PS: totalHours = sum(timekeeping.hours_worked)
            PS->>PS: overtimeHours = max(0, totalHours - 160)
            PS->>PS: overtimePay = salaryPerHour * overtimeHours * 0.5

            %% Thưởng KPI
            PS->>KS: getPeriodByMonthAndYear(month, year)
            KS-->>PS: KpiPeriod (hoặc null)
            alt kpiPeriod tồn tại AND baseSalary >= 10M
                PS->>KS: calculateFinalKpiScore(empId, periodId)
                KS->>DB: SELECT KpiAssignment WHERE employee_id AND period_id
                DB-->>KS: Assignments[]
                KS->>KS: score = sum(thực_tế/mục_tiêu * 100 * trọng_số/100)
                KS-->>PS: finalScore (0-120)
                PS->>PS: targetBonus = baseSalary * kpi_bonus_percentage / 100
                PS->>PS: kpiBonus = (score / 100) * targetBonus
            end

            %% Tổng thu nhập
            PS->>PS: grossIncome = salaryPerDay*actualDays + allowances + bonusAdj + kpiBonus + overtimePay

            %% Khấu trừ
            PS->>PS: insurance = baseSalary * insuranceRate
            PS->>PS: taxableIncome = grossIncome - insurance - lunchAllowance - 11M - 4.4M*dependents
            PS->>PS: pitDeduction = calculatePIT(taxableIncome) [7 bậc thuế lũy tiến]
            PS->>PS: deductions = insurance + PIT + penaltyAdj + unpaidAbsentDeduction

            %% Thực lãnh & Lưu
            PS->>PS: netSalary = max(0, grossIncome - deductions)
            PS->>DB: UPSERT Payslip (employee, period, tất cả các trường đã tính)
        end
    end

    PS-->>PC: { period_id, generated, total_gross, total_deductions, total_net }
    PC-->>HR: 200 OK với tóm tắt
```

---

## 6. Luồng Phân phối Thông báo (WebSocket Real-time)

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant FE as Frontend (NotificationContext)
    participant WS as Socket.io Client
    participant GW as NotificationsGateway
    participant NS as NotificationsService
    participant BS as Business Service (Leave/Payroll/etc)
    participant DB as PostgreSQL

    %% ── Kết nối ──
    FE->>WS: io(url, { withCredentials: true })
    WS->>GW: WebSocket handshake (Cookie: access_token=...)
    GW->>GW: extractTokenFromCookie(cookie)
    GW->>GW: jwtService.verify(token)
    GW->>GW: userSockets.set(userId, socketId)
    GW-->>WS: Connected

    %% ── Sự kiện nghiệp vụ kích hoạt thông báo ──
    BS->>NS: createNotification(userId, title, message, type)
    NS->>NS: Kiểm tra tùy chọn nhân viên (push_notifications, ...)
    alt tùy chọn cho phép
        NS->>DB: INSERT INTO notification
        DB-->>NS: Đã lưu Notification
        NS->>GW: sendNotificationToUser(userId, saved)
        GW->>GW: Tìm socket(s) cho userId
        GW-->>WS: emit("newNotification", notification)
        WS-->>FE: socket.on("newNotification") kích hoạt
        FE->>FE: setNotifications(prev => [notification, ...prev])
        FE->>FE: toast({ title, description })
        FE-->>U: Cập nhật badge chuông + toast popup
    end

    %% ── Ngắt kết nối ──
    U->>FE: Đóng trình duyệt / đăng xuất
    FE->>WS: socket.disconnect()
    GW->>GW: handleDisconnect → xóa socket khỏi userSockets
```

---

## 7. Luồng Từ chức

```mermaid
sequenceDiagram
    actor E as Nhân viên
    actor H as HR/Admin
    participant RC as ResignationsController
    participant RS as ResignationsService
    participant DB as PostgreSQL
    participant NS as NotificationsService

    E->>RC: POST /api/resignations/submit { requested_last_day, reason_text }
    RC->>RS: submit(employeeId, dto)
    RS->>DB: Kiểm tra đơn đang active
    alt đã có đơn pending/approved
        RS-->>RC: 400 BadRequest
        RC-->>E: "Bạn đã có đơn từ chức đang xử lý"
    else chưa có đơn active
        RS->>DB: INSERT INTO resignation_request (status='Pending')
        DB-->>RS: Đã tạo
        RS->>NS: Thông báo cho HR/Admin
        RS-->>RC: { success }
        RC-->>E: 201 Created
    end

    H->>RC: PATCH /api/resignations/:id/approve { status: "Approved", admin_note }
    RC->>RS: updateStatus(id, "Approved", adminNote)
    RS->>DB: SELECT ResignationRequest WHERE id = ?
    RS->>DB: UPDATE resignation_request SET status='Approved'
    RS->>DB: UPDATE employee SET employment_status='Terminated', resignation_date=NOW()
    RS->>NS: Thông báo nhân viên về quyết định
    RS-->>RC: { success }
    RC-->>H: 200 OK
```

---

## 8. Luồng Quản lý Hợp đồng Lao động

```mermaid
sequenceDiagram
    actor HR as HR/Admin
    participant CC as ContractsController
    participant CS as ContractsService
    participant DB as PostgreSQL
    participant SH as SalaryHistory

    HR->>CC: POST /api/contracts { employee_id, contract_type, start_date, salary_rate, ... }
    CC->>CS: create(dto)
    CS->>DB: SELECT Employee WHERE employee_id = ?
    DB-->>CS: Employee tồn tại
    CS->>DB: INSERT INTO contract (contract_number, type, start_date, salary_rate, status='Active')
    DB-->>CS: Contract đã tạo
    CS->>SH: INSERT INTO salary_history (old_salary, new_salary, change_date, reason)
    SH->>DB: Lưu lịch sử lương
    CS-->>CC: Contract
    CC-->>HR: 201 Created

    HR->>CC: PATCH /api/contracts/:id { salary_rate: mới, end_date }
    CC->>CS: update(id, dto)
    CS->>DB: SELECT Contract WHERE contract_id = ?
    DB-->>CS: Contract hiện tại
    CS->>SH: INSERT salary_history (old_salary → new_salary)
    CS->>DB: UPDATE contract SET salary_rate, end_date, status
    DB-->>CS: Đã cập nhật
    CS-->>CC: Contract đã cập nhật
    CC-->>HR: 200 OK

    HR->>CC: DELETE /api/contracts/:id
    CC->>CS: remove(id)
    CS->>DB: DELETE FROM contract WHERE contract_id = ?
    DB-->>CS: Đã xóa
    CS-->>CC: { success }
    CC-->>HR: 200 OK
```

---

## 9. Luồng Onboarding & Offboarding Nhân viên

```mermaid
sequenceDiagram
    actor HR as HR/Admin
    participant EC as EmployeesController
    participant ES as EmployeesService
    participant DB as PostgreSQL
    participant NS as NotificationsService

    %% ── Onboarding (Tạo nhân viên) ──
    HR->>EC: POST /api/employees { email, password, first_name, last_name, department_id, position_id, ... }
    EC->>ES: create(dto)
    ES->>DB: Kiểm tra email trùng lặp
    alt email đã tồn tại
        ES-->>EC: 409 Conflict
        EC-->>HR: "Email đã được sử dụng"
    else email mới
        ES->>ES: bcrypt.hash(password)
        ES->>DB: INSERT INTO employee
        DB-->>ES: Employee đã tạo
        ES->>DB: INSERT INTO bank_info (employee, bank_name, account_number)
        ES->>DB: INSERT INTO leave_balance (employee, leave_type, remaining_days) × 3 loại
        ES->>NS: createNotification(employeeId, "Chào mừng đến với công ty!", ...)
        ES-->>EC: Employee
        EC-->>HR: 201 Created
    end

    %% ── Offboarding ──
    HR->>EC: PATCH /api/employees/:id/offboard { employment_status: "Terminated", resignation_reason, resignation_date }
    EC->>ES: offboard(id, dto)
    ES->>DB: SELECT Employee WHERE employee_id = ?
    DB-->>ES: Employee
    ES->>DB: UPDATE employee SET employment_status='Terminated', resignation_reason, resignation_date, deleted_at=NOW()
    DB-->>ES: Đã cập nhật
    ES->>DB: UPDATE contract SET status='Terminated' WHERE employee_id = ? AND status='Active'
    ES->>NS: Thông báo cho HR về offboarding
    ES-->>EC: Employee đã offboard
    EC-->>HR: 200 OK
```

---

## 10. Luồng Gán KPI & Chấm điểm

```mermaid
sequenceDiagram
    actor M as Quản lý/HR
    participant KC as KpiController
    participant KS as KpiService
    participant DB as PostgreSQL
    participant NS as NotificationsService

    %% ── Tạo thư viện KPI ──
    M->>KC: POST /api/kpi/library { name, description, unit, calculation_formula }
    KC->>KS: createLibrary(dto, userId)
    KS->>DB: INSERT INTO kpi_library
    DB-->>KS: KpiLibrary đã tạo
    KS-->>KC: KpiLibrary
    KC-->>M: 201 Created

    %% ── Tạo kỳ đánh giá KPI ──
    M->>KC: POST /api/kpi/period { name, start_date, end_date }
    KC->>KS: createPeriod(dto)
    KS->>DB: INSERT INTO kpi_period (status='Active')
    DB-->>KS: KpiPeriod đã tạo
    KS-->>KC: KpiPeriod
    KC-->>M: 201 Created

    %% ── Gán KPI cho nhân viên ──
    M->>KC: POST /api/kpi/assign { employee_ids: [], kpi_library_id, period_id, target_value, weight }
    KC->>KS: assignKpis(dto)
    loop với mỗi employee_id
        KS->>DB: INSERT INTO kpi_assignment (employee, period, kpi_library, target_value, weight, status='Assigned')
        DB-->>KS: KpiAssignment đã tạo
    end
    KS-->>KC: Assignments[]
    KC-->>M: 201 Created

    %% ── Nhân viên cập nhật giá trị thực tế ──
    M->>KC: PATCH /api/kpi/assignment/:id/actual { actual_value }
    KC->>KS: updateActual(id, actual_value)
    KS->>DB: UPDATE kpi_assignment SET actual_value, status='Submitted'
    DB-->>KS: Đã cập nhật
    KS-->>KC: Assignment
    KC-->>M: 200 OK

    %% ── Quản lý chấm điểm ──
    M->>KC: PATCH /api/kpi/assignment/:id/grade { manager_score }
    KC->>KS: gradeAssignment(id, manager_score)
    KS->>DB: UPDATE kpi_assignment SET manager_score, status='Approved'
    DB-->>KS: Đã chấm điểm
    KS-->>KC: Assignment
    KC-->>M: 200 OK

    %% ── Tính điểm tổng hợp ──
    M->>KC: GET /api/kpi/calculate-score?employee_id=X&period_id=Y
    KC->>KS: calculateFinalKpiScore(employeeId, periodId)
    KS->>DB: SELECT KpiAssignment WHERE employee_id AND period_id
    DB-->>KS: Assignments[]
    KS->>KS: score = sum(actual_value/target_value * 100 * weight/100)
    KS-->>KC: { finalScore }
    KC-->>M: 200 OK
```

---

## 11. Luồng Phát hiện & Đồng bộ Vi phạm Chấm công

```mermaid
sequenceDiagram
    actor HR as HR/Admin
    participant VC as ViolationsController
    participant VS as ViolationsService
    participant DB as PostgreSQL
    participant NS as NotificationsService
    participant GW as WebSocket Gateway

    %% ── Tạo vi phạm thủ công ──
    HR->>VC: POST /api/violations { employee_id, violation_type, description, deduction_amount, severity }
    VC->>VS: create(dto)
    VS->>DB: SELECT Employee WHERE employee_id = ?
    DB-->>VS: Employee
    VS->>DB: INSERT INTO violation (violation_date, type, description, deduction_amount, severity, status='Pending')
    DB-->>VS: Violation đã tạo
    VS->>NS: createNotification(employeeId, "Vi phạm mới", ...)
    NS->>GW: sendNotificationToUser(employeeId)
    GW-->>HR: WebSocket notification
    VS-->>VC: Violation
    VC-->>HR: 201 Created

    %% ── Đồng bộ vi phạm tự động từ chấm công ──
    HR->>VC: POST /api/violations/sync-attendance
    VC->>VS: syncAttendance()
    VS->>DB: SELECT TimeKeeping WHERE work_date = TODAY AND hours_worked < 8
    DB-->>VS: Danh sách ca làm không đủ
    loop với mỗi bản ghi không đủ giờ
        VS->>DB: Kiểm tra đã có violation cho employee hôm nay chưa
        alt chưa có vi phạm
            VS->>DB: INSERT INTO violation (Incomplete Shift)
            DB-->>VS: Violation đã tạo
            VS->>NS: createNotification(employeeId, "Cảnh báo ca làm không đủ", ...)
            NS->>GW: sendNotificationToUser(employeeId)
        else đã có vi phạm
            VS->>VS: Bỏ qua (đã tồn tại)
        end
    end
    VS-->>VC: { created: số_lượng, skipped: số_lượng }
    VC-->>HR: 200 OK
```

---

## 12. Luồng Tạo & Phát Thông báo Công ty (Announcement)

```mermaid
sequenceDiagram
    actor HR as HR/Admin
    participant AC as AnnouncementsController
    participant AS as AnnouncementsService
    participant DB as PostgreSQL
    participant NS as NotificationsService
    participant GW as WebSocket Gateway

    HR->>AC: POST /api/announcements { title, content, type, target_audience, priority, delivery_methods }
    AC->>AS: create(dto)
    AS->>DB: INSERT INTO announcements (title, content, type, target_audience, priority, delivery_methods)
    DB-->>AS: Announcement đã tạo

    alt delivery_methods bao gồm "in_app"
        AS->>DB: SELECT employees phù hợp với target_audience
        DB-->>AS: Danh sách nhân viên
        loop với mỗi nhân viên
            AS->>NS: createNotification(empId, title, content, type='ANNOUNCEMENT')
            NS->>DB: INSERT INTO notification
            NS->>GW: sendNotificationToUser(empId, notification)
        end
    end

    AS-->>AC: Announcement
    AC-->>HR: 201 Created

    %% ── Nhân viên xem feed thông báo ──
    AC->>AS: GET /api/announcements/feed
    AS->>DB: SELECT Announcements WHERE target_audience phù hợp với vị trí/phòng ban người dùng
    DB-->>AS: Danh sách thông báo đã lọc
    AS-->>AC: Feed[]
    AC-->>HR: 200 OK
```

---

## 13. Luồng Nhắn tin Trực tiếp (1:1 Chat)

```mermaid
sequenceDiagram
    actor U1 as Nhân viên A
    actor U2 as Nhân viên B
    participant MC as MessagesController
    participant MS as MessagesService
    participant DB as PostgreSQL
    participant NS as NotificationsService
    participant GW as WebSocket Gateway

    %% ── Gửi tin nhắn ──
    U1->>MC: POST /api/messages { receiverId, content }
    MC->>MS: sendMessage(senderId, receiverId, content)
    MS->>DB: INSERT INTO message (sender_id, receiver_id, content, is_read=false)
    DB-->>MS: Message đã lưu
    MS->>NS: createNotification(receiverId, "Tin nhắn mới từ " + senderName, content)
    NS->>GW: sendNotificationToUser(receiverId, notification)
    GW-->>U2: WebSocket "newNotification" event
    MS-->>MC: Message
    MC-->>U1: 201 Created

    %% ── Xem hội thoại ──
    U1->>MC: GET /api/messages/:otherUserId
    MC->>MS: getMessages(userId, otherUserId)
    MS->>DB: SELECT Message WHERE (sender=userId AND receiver=otherUserId) OR (sender=otherUserId AND receiver=userId) ORDER BY created_at
    DB-->>MS: Danh sách tin nhắn
    MS-->>MC: Messages[]
    MC-->>U1: 200 OK

    %% ── Đánh dấu đã đọc ──
    U2->>MC: PATCH /api/messages/:otherUserId/read
    MC->>MS: markAsRead(userId, otherUserId)
    MS->>DB: UPDATE message SET is_read=true WHERE sender=otherUserId AND receiver=userId
    DB-->>MS: Đã cập nhật
    MS-->>MC: { success }
    MC-->>U2: 200 OK

    %% ── Xóa tin nhắn ──
    U1->>MC: DELETE /api/messages/:id
    MC->>MS: deleteMessage(userId, messageId)
    MS->>DB: DELETE FROM message WHERE id = ? AND sender_id = ?
    DB-->>MS: Đã xóa
    MS-->>MC: { success }
    MC-->>U1: 200 OK
```

---

## 14. Luồng Tổng hợp Dữ liệu Dashboard

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant DC as DashboardController
    participant DS as DashboardService
    participant DB as PostgreSQL

    %% ── Dashboard nhân viên ──
    U->>DC: GET /api/dashboard/employee
    DC->>DS: getEmployeeData(user)
    DS->>DB: SELECT Employee WHERE employee_id (kèm department, position, bankInfo)
    DB-->>DS: Employee
    DS->>DB: SELECT TimeKeeping WHERE employee_id AND work_date = TODAY
    DB-->>DS: Chấm công hôm nay
    DS->>DB: SELECT LeaveBalance WHERE employee_id
    DB-->>DS: Số dư nghỉ phép
    DS->>DB: SELECT LeaveRequest WHERE employee_id LIMIT 5
    DB-->>DS: Đơn nghỉ phép gần đây
    DS->>DB: SELECT KpiAssignment WHERE employee_id AND period status='Active'
    DB-->>DS: KPI hiện tại
    DS->>DS: Tổng hợp dữ liệu cá nhân
    DS-->>DC: EmployeeDashboardData
    DC-->>U: 200 OK

    %% ── Dashboard quản trị ──
    U->>DC: GET /api/dashboard/admin
    DC->>DS: getAdminData()
    DS->>DB: SELECT COUNT(*) FROM employee WHERE employment_status='Active'
    DB-->>DS: Tổng nhân viên
    DS->>DB: SELECT COUNT(*) FROM leave_request WHERE status='Pending'
    DB-->>DS: Đơn nghỉ phép đang chờ
    DS->>DB: SELECT COUNT(*) FROM time_keeping WHERE work_date=TODAY AND status='Present'
    DB-->>DS: Nhân viên có mặt hôm nay
    DS->>DB: SELECT thống kê payroll tháng hiện tại
    DB-->>DS: Tổng lương tháng
    DS->>DB: SELECT thống kê theo phòng ban
    DB-->>DS: Phân bổ theo phòng ban
    DS->>DS: Tổng hợp dữ liệu quản trị
    DS-->>DC: AdminDashboardData
    DC-->>U: 200 OK
```

---

## 15. Luồng Quản lý Phân quyền RBAC

```mermaid
sequenceDiagram
    actor A as Admin
    participant AC as AdminController
    participant AS as AdminService
    participant DB as PostgreSQL

    %% ── Xem ma trận phân quyền ──
    A->>AC: GET /api/admin/permissions/matrix
    AC->>AS: getPermissionMatrix()
    AS->>DB: SELECT Position JOIN PositionPermission JOIN Permission
    DB-->>AS: Ma trận phân quyền đầy đủ
    AS-->>AC: Matrix[]
    AC-->>A: 200 OK

    %% ── Xem quyền theo nhóm ──
    A->>AC: GET /api/admin/permissions/grouped
    AC->>AS: getGroupedPermissions()
    AS->>DB: SELECT Permission GROUP BY module_group
    DB-->>AS: Quyền đã nhóm (USERS, ROLES, PAYROLL, LEAVE, ...)
    AS-->>AC: GroupedPermissions
    AC-->>A: 200 OK

    %% ── Gán quyền cho chức vụ ──
    A->>AC: POST /api/admin/permissions/assign { position_id, permission_id }
    AC->>AS: assignPermissionToPosition(position_id, permission_id)
    AS->>DB: INSERT INTO position_permission
    DB-->>AS: Đã gán
    AS-->>AC: { success }
    AC-->>A: 201 Created

    %% ── Thu hồi quyền ──
    A->>AC: POST /api/admin/permissions/revoke { position_id, permission_id }
    AC->>AS: revokePermissionFromPosition(position_id, permission_id)
    AS->>DB: DELETE FROM position_permission WHERE position_id AND permission_id
    DB-->>AS: Đã thu hồi
    AS-->>AC: { success }
    AC-->>A: 200 OK

    %% ── Cập nhật toàn bộ quyền cho chức vụ ──
    A->>AC: PUT /api/admin/roles/:id/permissions { permission_ids: [] }
    AC->>AS: updateRolePermissions(positionId, permissionIds)
    AS->>DB: BEGIN TRANSACTION
    AS->>DB: DELETE FROM position_permission WHERE position_id = ?
    loop với mỗi permission_id
        AS->>DB: INSERT INTO position_permission (position_id, permission_id)
    end
    AS->>DB: COMMIT
    AS-->>AC: { success }
    AC-->>A: 200 OK
```

---

## 16. Luồng Tạo Báo cáo & Phân tích

```mermaid
sequenceDiagram
    actor HR as HR/Admin/Tài chính
    participant RC as ReportsController
    participant RS as ReportsService
    participant DB as PostgreSQL

    %% ── Báo cáo tổng lương ──
    HR->>RC: GET /api/reports/payroll-summary?month=05&year=2026
    RC->>RS: payrollSummary(month, year)
    RS->>DB: SELECT PayrollPeriod WHERE month, year
    DB-->>RS: Period
    RS->>DB: SELECT SUM(gross_salary), SUM(deductions), SUM(net_salary) FROM payslip WHERE payroll_period_id
    DB-->>RS: Tổng lương
    RS->>DB: SELECT d.department_name, COUNT(*), SUM(ps.gross_salary), AVG(ps.gross_salary) FROM payslip JOIN employee JOIN department GROUP BY department
    DB-->>RS: Lương theo phòng ban
    RS->>DS: Tổng hợp PayrollSummary
    RS-->>RC: PayrollSummary { total_payroll, total_bonus, total_deductions, employees_processed, avg_salary, payroll_by_department }
    RC-->>HR: 200 OK

    %% ── Báo cáo dashboard tổng hợp ──
    HR->>RC: GET /api/reports/dashboard
    RC->>RS: getDashboardData()
    RS->>DB: SELECT COUNT(*) FROM employee WHERE employment_status='Active'
    DB-->>RS: Tổng nhân viên
    RS->>DB: SELECT COUNT(*) FROM employee WHERE employment_status='Active' GROUP BY department
    DB-->>RS: Nhân viên theo phòng ban
    RS->>DB: SELECT thống kê chấm công tháng
    DB-->>RS: Tỷ lệ chấm công
    RS->>DB: SELECT thống kê nghỉ phép
    DB-->>RS: Tỷ lệ sử dụng phép
    RS->>DB: SELECT thống kê lương
    DB-->>RS: Tổng lương
    RS->>RS: Tổng hợp toàn bộ dữ liệu báo cáo
    RS-->>RC: DashboardReport
    RC-->>HR: 200 OK
```

---

## Tổng kết các module được bao hàm

| # | Module | Sequence Diagram | Mô tả |
|---|--------|-----------------|-------|
| 1 | Auth | Đăng nhập & Xác thực | JWT login, cookie, profile, navigation |
| 2 | Leave | Nộp đơn → Duyệt → Cập nhật số dư | Quy trình đầy đủ gồm cả hoàn số dư |
| 3 | Timekeeping | Check-in/out QR | QR động 35s TTL, debounce, tự động phát hiện vi phạm |
| 4 | Timekeeping | Check-in/out IP | IP whitelist guard, văn phòng/từ xa |
| 5 | Payroll | Tạo bảng lương đầy đủ | Pipeline tính lương gồm OT, KPI, thuế, bảo hiểm |
| 6 | Notification | Phân phối thông báo WebSocket | Kết nối, gửi, nhận, toast, badge |
| 7 | Resignation | Từ chức | Nộp đơn → duyệt/từ chối → chấm dứt |
| 8 | Contract | Quản lý hợp đồng | Tạo → cập nhật → xóa + lịch sử lương |
| 9 | Employee | Onboarding & Offboarding | Tạo nhân viên + bank + phép; offboard + chấm dứt hợp đồng |
| 10 | KPI | Gán KPI & Chấm điểm | Thư viện → kỳ → gán → cập nhật → chấm → tính điểm |
| 11 | Violation | Phát hiện & Đồng bộ vi phạm | Tạo thủ công + tự động sync từ chấm công |
| 12 | Announcement | Tạo & Phát thông báo công ty | Tạo → lọc đối tượng → gửi notification hàng loạt |
| 13 | Message | Nhắn tin 1:1 | Gửi → nhận → đánh dấu đã đọc → xóa |
| 14 | Dashboard | Tổng hợp dữ liệu dashboard | Nhân viên + quản trị + ngày lễ |
| 15 | RBAC | Quản lý phân quyền | Xem ma trận → gán → thu hồi → cập nhật hàng loạt |
| 16 | Reports | Báo cáo & Phân tích | Tổng lương, dashboard, thống kê đa chiều |
