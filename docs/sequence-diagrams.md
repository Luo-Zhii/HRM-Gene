# Sequence Diagrams — HRM System

> Key operational flows visualized as sequence diagrams.

---

## 1. Login & Authentication Flow

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Next.js Frontend
    participant BE as NestJS Backend
    participant DB as PostgreSQL

    U->>FE: Enter email & password
    FE->>BE: POST /api/auth/login { email, password }
    BE->>DB: SELECT Employee WHERE email = ?
    DB-->>BE: Employee record (with password hash)
    BE->>BE: bcrypt.compare(password, hash)
    alt Invalid credentials
        BE-->>FE: 401 Unauthorized
        FE-->>U: Show error message
    else Valid credentials
        BE->>BE: jwtService.sign({ sub: id, email, role })
        BE-->>FE: 200 { success, user, access_token }
        BE-->>FE: Set-Cookie: access_token (HTTPOnly)
        FE->>FE: window.location = /dashboard
        FE->>BE: GET /api/auth/profile (with cookie)
        BE->>BE: JwtStrategy.validate(token from cookie)
        BE->>DB: SELECT Employee + relations
        DB-->>BE: Full employee profile
        BE-->>FE: 200 { user with permissions, position }
        FE->>FE: AuthContext.setUser(user)
        FE-->>U: Render dashboard
    end
```

---

## 2. Leave Request → Approval → Balance Update

```mermaid
sequenceDiagram
    actor E as Employee
    actor M as Manager/HR
    participant LC as LeaveController
    participant LS as LeaveService
    participant DB as PostgreSQL
    participant NS as NotificationsService
    participant GW as WebSocket Gateway

    %% ── Submit ──
    E->>LC: POST /api/leave/submit { leaveTypeId, startDate, endDate, reason }
    LC->>LS: submitRequest(employeeId, ...)
    LS->>DB: SELECT LeaveType WHERE leave_type_id = ?
    DB-->>LS: LeaveType
    LS->>DB: SELECT Employee WHERE employee_id = ?
    DB-->>LS: Employee
    LS->>DB: INSERT INTO leave_request (status='Pending')
    DB-->>LS: LeaveRequest created

    LS->>DB: SELECT employees WHERE position IN (admin, hr, director)
    DB-->>LS: Admin/HR employees list
    loop for each admin/HR
        LS->>NS: createNotification(adminId, "New Leave Request", ...)
        NS->>DB: INSERT INTO notification
        NS->>GW: sendNotificationToUser(adminId, notification)
        GW-->>M: WebSocket "newNotification" event
    end
    LS-->>LC: { request_id, status: "Pending" }
    LC-->>E: 201 Created

    %% ── Approve ──
    M->>LC: PATCH /api/leave/approve/:id { status: "Approved", adminNote }
    LC->>LS: approveLeaveRequest(requestId, "Approved", managerId, adminNote)
    LS->>DB: SELECT LeaveRequest WHERE request_id = ? (with employee, leave_type)
    DB-->>LS: LeaveRequest
    LS->>LS: previousStatus = leaveRequest.status
    LS->>DB: SELECT Employee WHERE employee_id = managerId
    DB-->>LS: Manager
    LS->>DB: UPDATE leave_request SET status='Approved', manager_approver=?, admin_note=?
    DB-->>LS: Updated

    alt status == "Approved"
        LS->>LS: Calculate working days (Mon-Fri) between start_date and end_date
        LS->>DB: SELECT LeaveBalance WHERE employee_id AND leave_type_id
        alt balance exists
            LS->>DB: UPDATE leave_balance SET remaining_days = remaining_days - daysRequested
        else no balance
            LS->>DB: INSERT INTO leave_balance (employee, leave_type, remaining_days = default - daysRequested)
        end
    end

    LS->>NS: createNotification(employeeId, "Leave Request Update", ...)
    NS->>GW: sendNotificationToUser(employeeId, notification)
    GW-->>E: WebSocket "newNotification" event
    LS-->>LC: { success }
    LC-->>M: 200 OK
```

---

## 3. Check-in / Check-out Flow (QR-based)

```mermaid
sequenceDiagram
    actor E as Employee
    participant FE as Frontend (Scanner)
    participant TC as TimekeepingController
    participant TS as TimekeepingService
    participant DB as PostgreSQL
    participant NS as NotificationsService
    participant GW as WebSocket Gateway

    %% ── Generate QR ──
    FE->>TC: GET /api/timekeeping/qr/generate
    TC->>TS: generateDynamicQr()
    TS->>TS: token = uuidv4(), store in Map with 35s TTL
    TS-->>TC: { token }
    TC-->>FE: { token } → render QR code

    %% ── Scan QR (Check-in) ──
    E->>FE: Scan QR code
    FE->>TC: POST /api/timekeeping/checkin-qr { token }
    TC->>TS: recordCheckInByDynamicQr(employeeId, token)
    TS->>TS: Validate token (exists & not expired)
    TS->>TS: Delete token from Map
    TS->>DB: BEGIN TRANSACTION
    TS->>DB: SELECT TimeKeeping WHERE check_in_time BETWEEN today (latest)
    DB-->>TS: latestRecord (or null)

    alt no record OR check_out_time exists
        TS->>TS: debounce check (60s)
        TS->>TS: Determine status (Late if > 08:30, else Present)
        TS->>DB: INSERT INTO time_keeping (check_in_time, status)
        DB-->>TS: New record
        TS->>DB: COMMIT
        TS-->>TC: { status: "CHECK_IN", message: "Good morning!" }
    else record exists AND check_out_time IS NULL
        TS->>TS: debounce check (60s)
        TS->>TS: update check_out_time, calculate hours_worked
        TS->>TS: Update status (Present/Half-day)
        TS->>DB: UPDATE time_keeping SET check_out_time, hours_worked, status
        DB-->>TS: Updated

        alt hours_worked < 8
            TS->>DB: INSERT INTO violation (Incomplete Shift)
            TS->>NS: createNotification(employeeId, "Warning: Incomplete Shift", ...)
            NS->>GW: sendNotificationToUser(employeeId)
            GW-->>E: WebSocket toast notification
        end

        TS->>DB: COMMIT
        TS-->>TC: { status: "CHECK_OUT", duration, message: "See you tomorrow!" }
    end

    TC-->>FE: Response
    FE-->>E: Show success dialog
```

---

## 4. Payroll Generation Flow (Complete Pipeline)

```mermaid
sequenceDiagram
    actor HR as HR Admin
    participant PC as PayrollController
    participant PS as PayrollService
    participant DB as PostgreSQL
    participant KS as KpiService
    participant NS as NotificationsService

    HR->>PC: POST /api/payroll/generate { month, year }
    PC->>PS: generatePayslips(month, year, createdByUserId)

    %% Phase 1: Fetch all inputs
    PS->>DB: SELECT/FIND PayrollPeriod WHERE month, year
    alt not exists
        PS->>DB: INSERT PayrollPeriod (Draft, 26 standard days)
    end
    PS->>DB: SELECT all Employees (with position, department)
    DB-->>PS: Employees[]
    PS->>DB: SELECT TimeKeeping WHERE work_date BETWEEN month range
    DB-->>PS: TimeKeepings[]
    PS->>DB: SELECT LeaveRequest WHERE status='Approved' AND start_date BETWEEN month range
    DB-->>PS: LeaveRequests[] (with leave_type)

    %% Phase 2: Build work/absence maps
    PS->>PS: Build leaveDateSet per employee (all leave dates)
    PS->>PS: For each timekeeping: skip if date in leaveDateSet, else count Present/Half-day/Absent
    PS->>PS: For each leave: if is_paid → workDaysMap += days, else → absentDaysMap += days

    PS->>DB: SELECT SalaryAdjustments WHERE applied_month = "MM/YYYY" AND status='Approved'
    DB-->>PS: Adjustments[] (bonusMap, penaltyMap)
    PS->>DB: SELECT CompanySettings WHERE key = 'social_insurance_rate'
    DB-->>PS: insuranceRate

    %% Phase 3: Per-employee calculation loop
    loop for each Employee
        PS->>PS: calculateAndSavePayslip(employee, period, ctx)

        PS->>DB: SELECT SalaryConfig WHERE employee_id
        alt no SalaryConfig
            PS->>PS: Skip (warn)
        else has SalaryConfig
            PS->>PS: salaryPerDay = baseSalary / standardDays
            PS->>PS: actualDays = min(workDaysMap[id], standardDays)
            PS->>PS: unpaidAbsentDeduction = salaryPerDay * absentDaysMap[id]

            %% OT Calculation
            PS->>PS: totalHours = sum(timekeeping.hours_worked)
            PS->>PS: overtimeHours = max(0, totalHours - 160)
            PS->>PS: overtimePay = salaryPerHour * overtimeHours * 0.5

            %% KPI Bonus
            PS->>KS: getPeriodByMonthAndYear(month, year)
            KS-->>PS: KpiPeriod (or null)
            alt kpiPeriod exists AND baseSalary >= 10M
                PS->>KS: calculateFinalKpiScore(empId, periodId)
                KS->>DB: SELECT KpiAssignment WHERE employee_id AND period_id
                DB-->>KS: Assignments[]
                KS->>KS: score = sum(actual/target * 100 * weight/100)
                KS-->>PS: finalScore (0-120)
                PS->>PS: targetBonus = baseSalary * kpi_bonus_percentage / 100
                PS->>PS: kpiBonus = (score / 100) * targetBonus
            end

            %% Gross Income
            PS->>PS: grossIncome = salaryPerDay*actualDays + allowances + bonusAdj + kpiBonus + overtimePay

            %% Deductions
            PS->>PS: insurance = baseSalary * insuranceRate
            PS->>PS: taxableIncome = grossIncome - insurance - lunchAllowance - 11M - 4.4M*dependents
            PS->>PS: pitDeduction = calculatePIT(taxableIncome)  [7-bracket progressive]
            PS->>PS: deductions = insurance + PIT + penaltyAdj + unpaidAbsentDeduction

            %% Net & Save
            PS->>PS: netSalary = max(0, grossIncome - deductions)
            PS->>DB: UPSERT Payslip (employee, period, all computed fields)
        end
    end

    PS-->>PC: { period_id, generated, total_gross, total_deductions, total_net }
    PC-->>HR: 200 OK with summary
```

---

## 5. Notification Delivery (WebSocket Real-time)

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend (NotificationContext)
    participant WS as Socket.io Client
    participant GW as NotificationsGateway
    participant NS as NotificationsService
    participant BS as Business Service (Leave/Payroll/etc)
    participant DB as PostgreSQL

    %% ── Connection ──
    FE->>WS: io(url, { withCredentials: true })
    WS->>GW: WebSocket handshake (Cookie: access_token=...)
    GW->>GW: extractTokenFromCookie(cookie)
    GW->>GW: jwtService.verify(token)
    GW->>GW: userSockets.set(userId, socketId)
    GW-->>WS: Connected

    %% ── Business event triggers notification ──
    BS->>NS: createNotification(userId, title, message, type)
    NS->>NS: Check employee preferences (push_notifications, etc)
    alt preferences allow
        NS->>DB: INSERT INTO notification
        DB-->>NS: saved Notification
        NS->>GW: sendNotificationToUser(userId, saved)
        GW->>GW: Find socket(s) for userId
        GW-->>WS: emit("newNotification", notification)
        WS-->>FE: socket.on("newNotification") fires
        FE->>FE: setNotifications(prev => [notification, ...prev])
        FE->>FE: toast({ title, description })
        FE-->>U: Bell badge updates + toast popup
    end

    %% ── Disconnect ──
    U->>FE: Close browser / logout
    FE->>WS: socket.disconnect()
    GW->>GW: handleDisconnect → remove socket from userSockets
```

---

## 6. Resignation Flow

```mermaid
sequenceDiagram
    actor E as Employee
    actor H as HR/Admin
    participant RC as ResignationsController
    participant RS as ResignationsService
    participant DB as PostgreSQL
    participant NS as NotificationsService

    E->>RC: POST /api/resignations/submit { requested_last_day, reason_text }
    RC->>RS: submit(employeeId, dto)
    RS->>DB: Check for existing active request
    alt already has pending/approved
        RS-->>RC: 400 BadRequest
        RC-->>E: "You already have an active request"
    else no active request
        RS->>DB: INSERT INTO resignation_request (status='Pending')
        DB-->>RS: Created
        RS->>NS: Notify HR/Admins
        RS-->>RC: { success }
        RC-->>E: 201 Created
    end

    H->>RC: PATCH /api/resignations/:id/approve { status: "Approved", admin_note }
    RC->>RS: updateStatus(id, "Approved", adminNote)
    RS->>DB: SELECT ResignationRequest WHERE id = ?
    RS->>DB: UPDATE resignation_request SET status='Approved'
    RS->>DB: UPDATE employee SET employment_status='Terminated', resignation_date=NOW()
    RS->>NS: Notify employee of approval
    RS-->>RC: { success }
    RC-->>H: 200 OK
```
