# Sơ đồ Activity — Hệ thống HRM

> Luồng quy trình nghiệp vụ được mô tả bằng sơ đồ activity UML (flowchart TD + swimlane).

---

## 1. Quy trình Duyệt Nghỉ phép

```mermaid
flowchart TD
    Start((Bắt đầu))
    End((Kết thúc))

    subgraph Emp["Nhân viên"]
        E1["Nộp đơn nghỉ phép"]
        E2["Nhận thông báo kết quả"]
    end

    subgraph LS["LeaveService"]
        S1["Xác thực LeaveType & Employee"]
        S2["Lưu đơn (status: Pending)"]
        S3["Tìm HR/Admin để thông báo"]
        S4["Gửi notification cho từng Admin"]
        S5{"Trạng thái mới là Approved?"}
        S6["Tính số ngày làm việc (T2-T6)"]
        S7{"Có bản ghi LeaveBalance?"}
        S8["Trừ remaining_days"]
        S9["Tạo LeaveBalance mới (default - days)"]
        S10{"Từ chối & trước đó Approved?"}
        S11["Hoàn lại ngày phép vào số dư"]
        S12["Gửi notification cho nhân viên"]
    end

    subgraph HR["HR/Quản lý"]
        H1["Xem xét đơn nghỉ phép"]
        H2["Quyết định: Approved / Rejected"]
    end

    subgraph DB[(Cơ sở dữ liệu)]
        D1["INSERT leave_request"]
        D2["UPDATE leave_request"]
        D3["UPDATE/INSERT leave_balance"]
        D4["INSERT notification"]
    end

    Start --> E1
    E1 --> S1
    S1 -- "Không hợp lệ" --> End
    S1 -- "Hợp lệ" --> S2
    S2 --> D1
    D1 --> S3
    S3 --> S4
    S4 --> D4
    D4 --> H1
    H1 --> H2
    H2 --> D2
    D2 --> S5
    S5 -- "Có" --> S6
    S6 --> S7
    S7 -- "Chưa có" --> S9
    S7 -- "Đã có" --> S8
    S8 --> S12
    S9 --> S12
    S5 -- "Không" --> S10
    S10 -- "Có" --> S11
    S11 --> D3
    D3 --> S12
    S10 -- "Không" --> S12
    S12 --> D4
    D4 --> E2
    E2 --> End

    classDef startEnd fill:#111827,stroke:#ffffff,stroke-width:2px,color:#ffffff
    classDef action fill:#1f2937,stroke:#9ca3af,color:#ffffff
    classDef decision fill:#312e81,stroke:#facc15,stroke-width:2px,color:#ffffff
    classDef database fill:#064e3b,stroke:#34d399,color:#ffffff
    classDef notification fill:#4c1d95,stroke:#c084fc,color:#ffffff

    class Start,End startEnd
    class E1,E2,S1,S2,S3,S6,S8,S9,S11,S12,H1,H2 action
    class S5,S7,S10 decision
    class D1,D2,D3,D4 database
    class S4 notification
```

---

## 2. Quy trình Tạo Bảng lương

```mermaid
flowchart TD
    Start((Bắt đầu))
    End((Kết thúc))

    subgraph User["HR/Tài chính"]
        U1["Kích hoạt tạo bảng lương (month, year)"]
        U2["Nhận kết quả tóm tắt"]
    end

    subgraph PS["PayrollService"]
        S1{"PayrollPeriod đã tồn tại?"}
        S2["Tạo PayrollPeriod (Draft, 26 ngày)"]
        S3["Lấy tất cả Employees"]
        S4["Lấy TimeKeeping trong tháng"]
        S5["Lấy LeaveRequest đã Approved"]
        S6["Xây dựng leaveDateSet mỗi NV"]
        S7["Lấy SalaryAdjustments (Bonus/Penalty)"]
        S8["Lấy insurance_rate từ CompanySettings"]
        S9["Với mỗi Employee: gọi calculateAndSavePayslip()"]
        S10{"Có SalaryConfig?"}
        S11["Bỏ qua, log cảnh báo"]
        S12["Tính actualDays (loại trừ leave)"]
        S13["Tính overtimePay (OT > 160h)"]
        S14["Gọi KpiService tính kpiBonus"]
        S15["Tính grossIncome"]
        S16["Tính insurance + PIT (7 bậc)"]
        S17["Tính netSalary"]
        S18["UPSERT payslip vào DB"]
        S19{"Còn nhân viên?"}
        S20["Trả về tổng gross/deductions/net"]
    end

    subgraph KS["KpiService"]
        K1["Lấy KpiPeriod theo tháng/năm"]
        K2{"baseSalary >= 10M?"}
        K3["Tính finalKpiScore"]
        K4["kpiBonus = 0"]
    end

    subgraph DB[(Cơ sở dữ liệu)]
        D1["SELECT/UPSERT payroll_period"]
        D2["SELECT employees, timekeepings, leaves"]
        D3["SELECT adjustments, settings"]
        D4["UPSERT payslip"]
    end

    Start --> U1
    U1 --> S1
    S1 -- "Chưa có" --> S2
    S1 -- "Có" --> S3
    S2 --> D1
    D1 --> S3
    S3 --> D2
    D2 --> S4
    S4 --> S5
    S5 --> S6
    S6 --> S7
    S7 --> D3
    D3 --> S8
    S8 --> S9
    S9 --> S10
    S10 -- "Không" --> S11
    S11 --> S19
    S10 -- "Có" --> S12
    S12 --> S13
    S13 --> S14
    S14 --> K1
    K1 --> K2
    K2 -- "Không" --> K4
    K2 -- "Có" --> K3
    K3 --> S15
    K4 --> S15
    S15 --> S16
    S16 --> S17
    S17 --> S18
    S18 --> D4
    D4 --> S19
    S19 -- "Còn" --> S9
    S19 -- "Hết" --> S20
    S20 --> U2
    U2 --> End

    classDef startEnd fill:#111827,stroke:#ffffff,stroke-width:2px,color:#ffffff
    classDef action fill:#1f2937,stroke:#9ca3af,color:#ffffff
    classDef decision fill:#312e81,stroke:#facc15,stroke-width:2px,color:#ffffff
    classDef database fill:#064e3b,stroke:#34d399,color:#ffffff
    classDef external fill:#1e3a5f,stroke:#60a5fa,color:#ffffff

    class Start,End startEnd
    class U1,U2,S2,S3,S4,S5,S6,S7,S8,S9,S11,S12,S13,S14,S15,S16,S17,S18,S20,K1,K3,K4 action
    class S1,S10,S19,K2 decision
    class D1,D2,D3,D4 database
    class KS,K1,K2,K3,K4 external
```

---

## 3. Quy trình Chấm công QR (Check-in/Check-out)

```mermaid
flowchart TD
    Start((Bắt đầu))
    End((Kết thúc))

    subgraph Frontend["Frontend"]
        U1["Hiển thị mã QR động"]
        U2["Nhân viên quét mã QR"]
        U3["Hiển thị kết quả check-in/out"]
    end

    subgraph TS["TimeKeepingService"]
        S1["generateDynamicQr()"]
        S2["Lưu token vào Map (TTL 35s)"]
        S3["Xác thực token"]
        S4["Xóa token khỏi Map"]
        S5["Tìm bản ghi mới nhất hôm nay"]
        S6{"Có bản ghi & chưa checkout?"}
        S7{"Kiểm tra debounce 60s"}
        S8["Xác định trạng thái (Late/Present)"]
        S9["INSERT time_keeping (check-in)"]
        S10["UPDATE check_out_time, hours_worked"]
        S11{"hours_worked < 8?"}
        S12["Tự động tạo Violation"]
        S13["Gửi notification cảnh báo"]
        S14["Trả về kết quả"]
    end

    subgraph DB[(Cơ sở dữ liệu)]
        D1["SELECT/INSERT time_keeping"]
        D2["UPDATE time_keeping"]
        D3["INSERT violation"]
        D4["INSERT notification"]
    end

    Start --> U1
    U1 --> S1
    S1 --> S2
    S2 --> U1
    U1 --> U2
    U2 --> S3
    S3 -- "Không hợp lệ" --> End
    S3 -- "Hợp lệ" --> S4
    S4 --> S5
    S5 --> D1
    D1 --> S6
    S6 -- "Không (Check-in)" --> S7
    S7 -- "Vi phạm debounce" --> End
    S7 -- "OK" --> S8
    S8 --> S9
    S9 --> D1
    D1 --> S14
    S6 -- "Có (Check-out)" --> S7
    S7 -- "OK" --> S10
    S10 --> D2
    D2 --> S11
    S11 -- "Có" --> S12
    S12 --> D3
    D3 --> S13
    S13 --> D4
    D4 --> S14
    S11 -- "Không" --> S14
    S14 --> U3
    U3 --> End

    classDef startEnd fill:#111827,stroke:#ffffff,stroke-width:2px,color:#ffffff
    classDef action fill:#1f2937,stroke:#9ca3af,color:#ffffff
    classDef decision fill:#312e81,stroke:#facc15,stroke-width:2px,color:#ffffff
    classDef database fill:#064e3b,stroke:#34d399,color:#ffffff
    classDef notification fill:#4c1d95,stroke:#c084fc,color:#ffffff

    class Start,End startEnd
    class U1,U2,U3,S1,S2,S3,S4,S5,S8,S9,S10,S12,S13,S14 action
    class S6,S7,S11 decision
    class D1,D2,D3,D4 database
```

---

## 4. Quy trình Check-in bằng IP (Whitelist)

```mermaid
flowchart TD
    Start((Bắt đầu))
    End((Kết thúc))

    subgraph Emp["Nhân viên"]
        U1["Gửi yêu cầu check-in IP"]
        U2["Nhận kết quả"]
    end

    subgraph Guard["IPWhitelistGuard"]
        G1["Lấy COMPANY_IP_WHITELIST từ DB"]
        G2{"IP client có trong whitelist?"}
        G3["Từ chối: 403 Forbidden"]
    end

    subgraph TS["TimeKeepingService"]
        S1["Tìm bản ghi mới nhất hôm nay"]
        S2{"Có bản ghi & chưa checkout?"}
        S3["Kiểm tra debounce 60s"]
        S4["Xác định trạng thái (SHIFT_START 18:30)"]
        S5["INSERT time_keeping (check-in + IP)"]
        S6["UPDATE check_out_time, hours_worked"]
        S7["Trả về kết quả"]
    end

    subgraph DB[(Cơ sở dữ liệu)]
        D1["SELECT company_settings"]
        D2["SELECT/INSERT/UPDATE time_keeping"]
    end

    Start --> U1
    U1 --> G1
    G1 --> D1
    D1 --> G2
    G2 -- "Không" --> G3
    G3 --> U2
    U2 --> End
    G2 -- "Có" --> S1
    S1 --> D2
    D2 --> S2
    S2 -- "Không (Check-in)" --> S3
    S3 -- "Vi phạm debounce" --> End
    S3 -- "OK" --> S4
    S4 --> S5
    S5 --> D2
    D2 --> S7
    S2 -- "Có (Check-out)" --> S3
    S3 -- "OK" --> S6
    S6 --> D2
    D2 --> S7
    S7 --> U2
    U2 --> End

    classDef startEnd fill:#111827,stroke:#ffffff,stroke-width:2px,color:#ffffff
    classDef action fill:#1f2937,stroke:#9ca3af,color:#ffffff
    classDef decision fill:#312e81,stroke:#facc15,stroke-width:2px,color:#ffffff
    classDef database fill:#064e3b,stroke:#34d399,color:#ffffff
    classDef guard fill:#7c2d12,stroke:#f97316,color:#ffffff

    class Start,End startEnd
    class U1,U2,G1,G3,S1,S3,S4,S5,S6,S7 action
    class G2,S2 decision
    class D1,D2 database
```

---

## 5. Quy trình Từ chức

```mermaid
flowchart TD
    Start((Bắt đầu))
    End((Kết thúc))

    subgraph Emp["Nhân viên"]
        E1["Nộp đơn từ chức (requested_last_day, reason_text)"]
        E2["Nhận thông báo kết quả"]
    end

    subgraph RS["ResignationsService"]
        S1{"Đã có đơn Pending?"}
        S2["Từ chối: 400 BadRequest"]
        S3["Lưu đơn (status: Pending)"]
        S4["Thông báo HR/Admin"]
        S5{"Duyệt hay Từ chối?"}
        S6["Cập nhật employee: Terminated"]
        S7["Chấm dứt hợp đồng Active"]
        S8["Cập nhật trạng thái đơn"]
        S9["Gửi notification cho nhân viên"]
    end

    subgraph HR["HR/Admin"]
        H1["Xem xét đơn từ chức"]
        H2["Quyết định (kèm resignation_category)"]
    end

    subgraph DB[(Cơ sở dữ liệu)]
        D1["INSERT resignation_request"]
        D2["UPDATE employee"]
        D3["UPDATE contract"]
        D4["INSERT notification"]
    end

    Start --> E1
    E1 --> S1
    S1 -- "Có" --> S2
    S2 --> End
    S1 -- "Không" --> S3
    S3 --> D1
    D1 --> S4
    S4 --> D4
    D4 --> H1
    H1 --> H2
    H2 --> S5
    S5 -- "Approved" --> S6
    S6 --> D2
    D2 --> S7
    S7 --> D3
    D3 --> S8
    S5 -- "Rejected" --> S8
    S8 --> S9
    S9 --> D4
    D4 --> E2
    E2 --> End

    classDef startEnd fill:#111827,stroke:#ffffff,stroke-width:2px,color:#ffffff
    classDef action fill:#1f2937,stroke:#9ca3af,color:#ffffff
    classDef decision fill:#312e81,stroke:#facc15,stroke-width:2px,color:#ffffff
    classDef database fill:#064e3b,stroke:#34d399,color:#ffffff
    classDef notification fill:#4c1d95,stroke:#c084fc,color:#ffffff

    class Start,End startEnd
    class E1,E2,S2,S3,S4,S6,S7,S8,S9,H1,H2 action
    class S1,S5 decision
    class D1,D2,D3,D4 database
```

---

## 6. Quy trình Phân phối Thông báo (WebSocket Real-time)

```mermaid
flowchart TD
    Start((Bắt đầu))
    End((Kết thúc))

    subgraph FE["Frontend (Next.js)"]
        F1["Kết nối Socket.io (withCredentials)"]
        F2["socket.on('newNotification')"]
        F3["Cập nhật NotificationContext"]
        F4["Hiển thị toast + badge"]
        F5["Người dùng markAsRead"]
    end

    subgraph GW["NotificationsGateway"]
        G1["Phân tích access_token từ cookie"]
        G2{"JWT hợp lệ?"}
        G3["Đăng ký socket vào userSockets Map"]
        G4["Ngắt kết nối"]
        G5["Tìm socket theo userId"]
        G6["Emit 'newNotification' tới socket"]
    end

    subgraph NS["NotificationsService"]
        N1["Nhận yêu cầu createNotification từ service khác"]
        N2{"Kiểm tra tùy chọn nhận thông báo"}
        N3["Bỏ qua (trả về null)"]
        N4["INSERT vào bảng notification"]
        N5["Gọi gateway sendNotificationToUser"]
    end

    subgraph DB[(Cơ sở dữ liệu)]
        D1["SELECT employee preferences"]
        D2["INSERT notification"]
        D3["UPDATE isRead = true"]
    end

    Start --> F1
    F1 --> G1
    G1 --> G2
    G2 -- "Không" --> G4
    G4 --> End
    G2 -- "Có" --> G3
    G3 --> N1
    N1 --> N2
    N2 --> D1
    D1 --> N2
    N2 -- "Tắt" --> N3
    N3 --> End
    N2 -- "Bật" --> N4
    N4 --> D2
    D2 --> N5
    N5 --> G5
    G5 -- "Có socket" --> G6
    G5 -- "Không socket (offline)" --> End
    G6 --> F2
    F2 --> F3
    F3 --> F4
    F4 --> F5
    F5 --> D3
    D3 --> End

    classDef startEnd fill:#111827,stroke:#ffffff,stroke-width:2px,color:#ffffff
    classDef action fill:#1f2937,stroke:#9ca3af,color:#ffffff
    classDef decision fill:#312e81,stroke:#facc15,stroke-width:2px,color:#ffffff
    classDef database fill:#064e3b,stroke:#34d399,color:#ffffff
    classDef notification fill:#4c1d95,stroke:#c084fc,color:#ffffff

    class Start,End startEnd
    class F1,F2,F3,F4,F5,G1,G3,G4,G5,G6,N1,N3,N4,N5 action
    class G2,N2 decision
    class D1,D2,D3 database
    class F2,F3,F4,N4,N5 notification
```

---

## 7. Quy trình Cron Đồng bộ Chấm công Hàng ngày (Nửa đêm)

```mermaid
flowchart TD
    Start((Start))
    End((End))

    subgraph Cron["@Cron EVERY_DAY_AT_MIDNIGHT"]
        C1["Kích hoạt handleDailyAttendanceSync()"]
        C2["Lấy today = new Date()"]
    end

    subgraph VS["ViolationsService"]
        S1["SELECT TimeKeeping WHERE hours_worked < 8 AND work_date = today"]
        S2{"Còn bản ghi?"}
        S3{"Đã có violation cho nhân viên hôm nay?"}
        S4["Bỏ qua"]
        S5["Tạo violation (Incomplete Shift, NORMAL, PENDING)"]
        S6["Gửi notification cho nhân viên"]
        S7{"createdCount > 0?"}
        S8["Thông báo HR/Admin với tóm tắt"]
    end

    subgraph DB[(Cơ sở dữ liệu)]
        D1["SELECT time_keeping"]
        D2["SELECT violation (kiểm tra trùng)"]
        D3["INSERT violation"]
        D4["INSERT notification"]
    end

    Start --> C1
    C1 --> C2
    C2 --> S1
    S1 --> D1
    D1 --> S2
    S2 -- "Hết" --> S7
    S2 -- "Còn" --> S3
    S3 --> D2
    D2 --> S3
    S3 -- "Có" --> S4
    S4 --> S2
    S3 -- "Không" --> S5
    S5 --> D3
    D3 --> S6
    S6 --> D4
    D4 --> S2
    S7 -- "Có" --> S8
    S8 --> D4
    D4 --> End
    S7 -- "Không" --> End

    classDef startEnd fill:#111827,stroke:#ffffff,stroke-width:2px,color:#ffffff
    classDef action fill:#1f2937,stroke:#9ca3af,color:#ffffff
    classDef decision fill:#312e81,stroke:#facc15,stroke-width:2px,color:#ffffff
    classDef database fill:#064e3b,stroke:#34d399,color:#ffffff
    classDef notification fill:#4c1d95,stroke:#c084fc,color:#ffffff
    classDef cron fill:#1a1a2e,stroke:#a78bfa,color:#ffffff

    class Start,End startEnd
    class C1,C2,S1,S4,S5,S6,S8 action
    class S2,S3,S7 decision
    class D1,D2,D3,D4 database
    class C1,C2 cron
```

---

## 8. Quy trình Quản lý KPI (Thư viện → Kỳ → Gán → Chấm điểm)

```mermaid
flowchart TD
    Start((Bắt đầu))
    End((Kết thúc))

    subgraph Admin["Admin/Quản lý"]
        A1["Tạo thư viện KPI (name, unit, formula)"]
        A2["Tạo kỳ đánh giá (name, start_date, end_date)"]
        A3["Gán KPI cho nhân viên"]
        A4["Chấm điểm (manager_score)"]
    end

    subgraph Emp["Nhân viên"]
        E1["Nhận KPI (status: Assigned)"]
        E2["Cập nhật actual_value"]
        E3["Nộp KPI (status: Submitted)"]
    end

    subgraph KS["KpiService"]
        S1["createLibrary(dto, creatorId)"]
        S2["createPeriod(dto)"]
        S3{"Tổng weight = 100%?"}
        S4["Báo lỗi"]
        S5["Xóa assignment cũ + INSERT mới"]
        S6["Gửi notification KPI mới"]
        S7["updateActual(id, actualValue)"]
        S8["gradeAssignment(id, managerScore)"]
        S9["calculateFinalKpiScore(empId, periodId)"]
        S10["Dùng manager_score ?? actual_value"]
        S11["Tính achievement = min(120, actual/target*100)"]
        S12["score = sum(achievement * weight/100)"]
    end

    subgraph DB[(Cơ sở dữ liệu)]
        D1["INSERT kpi_library"]
        D2["INSERT kpi_period"]
        D3["DELETE + INSERT kpi_assignment"]
        D4["UPDATE kpi_assignment"]
    end

    Start --> A1
    A1 --> S1
    S1 --> D1
    D1 --> A2
    A2 --> S2
    S2 --> D2
    D2 --> A3
    A3 --> S3
    S3 -- "Sai" --> S4
    S4 --> End
    S3 -- "Đúng" --> S5
    S5 --> D3
    D3 --> S6
    S6 --> E1
    E1 --> E2
    E2 --> S7
    S7 --> D4
    D4 --> E3
    E3 --> A4
    A4 --> S8
    S8 --> D4
    D4 --> S9
    S9 --> S10
    S10 --> S11
    S11 --> S12
    S12 --> End

    classDef startEnd fill:#111827,stroke:#ffffff,stroke-width:2px,color:#ffffff
    classDef action fill:#1f2937,stroke:#9ca3af,color:#ffffff
    classDef decision fill:#312e81,stroke:#facc15,stroke-width:2px,color:#ffffff
    classDef database fill:#064e3b,stroke:#34d399,color:#ffffff

    class Start,End startEnd
    class A1,A2,A3,A4,E1,E2,E3,S1,S2,S4,S5,S6,S7,S8,S9,S10,S11,S12 action
    class S3 decision
    class D1,D2,D3,D4 database
```

---

## 9. Quy trình Vòng đời Hợp đồng Lao động

```mermaid
flowchart TD
    Start((Bắt đầu))
    End((Kết thúc))

    subgraph HR["HR/Admin"]
        H1["Tạo hợp đồng (contract_number, type, dates, salary_rate)"]
        H2["Cập nhật hợp đồng"]
        H3["Xóa hợp đồng"]
    end

    subgraph CS["ContractsService"]
        S1["Xác thực Employee tồn tại"]
        S2{"contract_number đã tồn tại?"}
        S3["Báo lỗi trùng mã"]
        S4{"status = Active?"}
        S5["Deactivate các hợp đồng Active khác"]
        S6["Lưu hợp đồng mới"]
        S7{"Lương thay đổi?"}
        S8["Lưu SalaryHistory"]
        S9["Hợp đồng đang hiệu lực"]
        S10{"Cập nhật lương?"}
        S11["Lưu SalaryHistory (old → new)"]
        S12["Update hợp đồng"]
        S13["remove() xóa cứng"]
    end

    subgraph DB[(Cơ sở dữ liệu)]
        D1["SELECT employee"]
        D2["INSERT/UPDATE contract"]
        D3["INSERT salary_history"]
        D4["DELETE contract"]
    end

    Start --> H1
    H1 --> S1
    S1 --> D1
    D1 --> S2
    S2 -- "Có" --> S3
    S3 --> End
    S2 -- "Không" --> S4
    S4 -- "Có" --> S5
    S5 --> D2
    D2 --> S6
    S4 -- "Không" --> S6
    S6 --> D2
    D2 --> S7
    S7 -- "Có" --> S8
    S8 --> D3
    D3 --> S9
    S7 -- "Không" --> S9
    S9 --> H2
    S9 --> H3
    H2 --> S10
    S10 -- "Có" --> S11
    S11 --> D3
    D3 --> S12
    S10 -- "Không" --> S12
    S12 --> D2
    D2 --> S9
    H3 --> S13
    S13 --> D4
    D4 --> End

    classDef startEnd fill:#111827,stroke:#ffffff,stroke-width:2px,color:#ffffff
    classDef action fill:#1f2937,stroke:#9ca3af,color:#ffffff
    classDef decision fill:#312e81,stroke:#facc15,stroke-width:2px,color:#ffffff
    classDef database fill:#064e3b,stroke:#34d399,color:#ffffff

    class Start,End startEnd
    class H1,H2,H3,S1,S3,S5,S6,S8,S9,S11,S12,S13 action
    class S2,S4,S7,S10 decision
    class D1,D2,D3,D4 database
```

---

## 10. Quy trình Vòng đời Nhân viên (Onboard → Active → Offboard)

```mermaid
flowchart TD
    Start((Bắt đầu))
    End((Kết thúc))

    subgraph HR["HR/Admin"]
        H1["Tạo nhân viên (email, password, name, dept, position)"]
        H2["Cập nhật hồ sơ / Tải avatar"]
        H3["Chuyển phòng ban / chức vụ"]
        H4["Offboard (PATCH :id/offboard)"]
    end

    subgraph ES["EmployeesService"]
        S1{"Email đã tồn tại?"}
        S2["Báo lỗi 409 Conflict"]
        S3["bcrypt.hash(password, 10)"]
        S4["Lưu Employee (kèm department, position)"]
        S5["Gửi notification chào mừng"]
        S6["Nhân viên Active"]
        S7["update(id, dto)"]
        S8{"employment_status = Terminated?"}
        S9["UPDATE contract SET status='Terminated'"]
        S10{"Chuyển phòng ban & đang là manager?"}
        S11["Gỡ quyền manager khỏi phòng ban cũ"]
    end

    subgraph DB[(Cơ sở dữ liệu)]
        D1["SELECT employee (check email)"]
        D2["INSERT employee"]
        D3["UPDATE employee"]
        D4["UPDATE contract"]
    end

    Start --> H1
    H1 --> S1
    S1 --> D1
    D1 --> S1
    S1 -- "Trùng" --> S2
    S2 --> End
    S1 -- "Mới" --> S3
    S3 --> S4
    S4 --> D2
    D2 --> S5
    S5 --> S6
    S6 --> H2
    S6 --> H3
    S6 --> H4
    H2 --> S7
    H3 --> S7
    S7 --> D3
    D3 --> S10
    S10 -- "Có" --> S11
    S11 --> D3
    S10 -- "Không" --> S6
    S11 --> S6
    H4 --> S7
    S7 --> S8
    S8 -- "Có" --> S9
    S9 --> D4
    D4 --> End
    S8 -- "Không" --> End

    classDef startEnd fill:#111827,stroke:#ffffff,stroke-width:2px,color:#ffffff
    classDef action fill:#1f2937,stroke:#9ca3af,color:#ffffff
    classDef decision fill:#312e81,stroke:#facc15,stroke-width:2px,color:#ffffff
    classDef database fill:#064e3b,stroke:#34d399,color:#ffffff
    classDef notification fill:#4c1d95,stroke:#c084fc,color:#ffffff

    class Start,End startEnd
    class H1,H2,H3,H4,S2,S3,S4,S6,S7,S9,S11 action
    class S1,S8,S10 decision
    class D1,D2,D3,D4 database
    class S5 notification
```

---

## 11. Quy trình Quản lý & Đồng bộ Vi phạm

```mermaid
flowchart TD
    Start1((Bắt đầu))
    End1((Kết thúc))
    Start2((Cron nửa đêm))
    End2((Kết thúc))

    subgraph Manual["Tạo thủ công (HR/Admin)"]
        M1["Nhập loại, mức độ, tiền phạt, mô tả"]
        M2["Lưu violation (status: Pending)"]
        M3["Gửi notification cho nhân viên"]
        M4["Vi phạm đang xử lý"]
        M5["Cập nhật / Đánh dấu Resolved / Xóa"]
    end

    subgraph Auto["Đồng bộ tự động (@Cron)"]
        A1["Quét TimeKeeping hôm nay (hours_worked < 8)"]
        A2{"Còn bản ghi?"}
        A3{"Đã có violation hôm nay?"}
        A4["Bỏ qua"]
        A5["Tạo violation (Incomplete Shift, PENDING)"]
        A6["Gửi notification cho nhân viên"]
        A7{"createdCount > 0?"}
        A8["Thông báo HR/Admin với tóm tắt"]
    end

    subgraph DB[(Cơ sở dữ liệu)]
        D1["INSERT/UPDATE/DELETE violation"]
        D2["SELECT time_keeping"]
        D3["INSERT violation + notification"]
    end

    Start1 --> M1
    M1 --> M2
    M2 --> D1
    D1 --> M3
    M3 --> M4
    M4 --> M5
    M5 --> D1
    D1 --> End1

    Start2 --> A1
    A1 --> D2
    D2 --> A2
    A2 -- "Hết" --> A7
    A2 -- "Còn" --> A3
    A3 -- "Có" --> A4
    A4 --> A2
    A3 -- "Không" --> A5
    A5 --> A6
    A6 --> D3
    D3 --> A2
    A7 -- "Có" --> A8
    A8 --> D3
    D3 --> End2
    A7 -- "Không" --> End2

    classDef startEnd fill:#111827,stroke:#ffffff,stroke-width:2px,color:#ffffff
    classDef action fill:#1f2937,stroke:#9ca3af,color:#ffffff
    classDef decision fill:#312e81,stroke:#facc15,stroke-width:2px,color:#ffffff
    classDef database fill:#064e3b,stroke:#34d399,color:#ffffff
    classDef notification fill:#4c1d95,stroke:#c084fc,color:#ffffff

    class Start1,End1,Start2,End2 startEnd
    class M1,M2,M3,M4,M5,A1,A4,A5,A6,A8 action
    class A2,A3,A7 decision
    class D1,D2,D3 database
```

---

## 12. Quy trình Đăng & Phân phối Thông báo Công ty

```mermaid
flowchart TD
    Start((Bắt đầu))
    End((Kết thúc))

    subgraph HR["HR/Admin"]
        H1["Tạo announcement (title, content, type, target_audience, delivery_methods)"]
    end

    subgraph AS["AnnouncementsService"]
        S1["Lưu announcement vào DB"]
        S2{"delivery_methods có 'in_app'?"}
        S3{"target_audience là gì?"}
        S4["Lấy toàn bộ Employee"]
        S5["Lọc Employee theo dept_X"]
        S6["Với mỗi employee: createNotification()"]
        S7["NotificationsService: INSERT + WebSocket"]
    end

    subgraph Emp["Nhân viên"]
        E1["Nhận thông báo real-time"]
        E2["Xem feed thông báo (đã lọc theo dept)"]
    end

    subgraph DB[(Cơ sở dữ liệu)]
        D1["INSERT announcements"]
        D2["SELECT employees"]
        D3["INSERT notification"]
    end

    Start --> H1
    H1 --> S1
    S1 --> D1
    D1 --> S2
    S2 -- "Không" --> End
    S2 -- "Có" --> S3
    S3 -- "all" --> S4
    S3 -- "dept_X" --> S5
    S4 --> D2
    S5 --> D2
    D2 --> S6
    S6 --> S7
    S7 --> D3
    D3 --> E1
    E1 --> E2
    E2 --> End

    classDef startEnd fill:#111827,stroke:#ffffff,stroke-width:2px,color:#ffffff
    classDef action fill:#1f2937,stroke:#9ca3af,color:#ffffff
    classDef decision fill:#312e81,stroke:#facc15,stroke-width:2px,color:#ffffff
    classDef database fill:#064e3b,stroke:#34d399,color:#ffffff
    classDef notification fill:#4c1d95,stroke:#c084fc,color:#ffffff

    class Start,End startEnd
    class H1,S1,S4,S5,S6,S7,E1,E2 action
    class S2,S3 decision
    class D1,D2,D3 database
    class S7,E1 notification
```

---

## 13. Quy trình Nhắn tin Trực tiếp (1:1 Chat)

```mermaid
flowchart TD
    Start((Bắt đầu))
    End((Kết thúc))

    subgraph Sender["Nhân viên A (Người gửi)"]
        A1["Soạn tin nhắn"]
        A2["Chọn người nhận B"]
        A3["Gửi tin nhắn"]
        A4["Xóa tin nhắn (soft delete)"]
    end

    subgraph MS["MessagesService"]
        S1["Lưu message (sender, receiver, content)"]
        S2["Tạo notification cho B"]
        S3{"B online?"}
        S4["Emit 'newMessage' qua WebSocket"]
        S5["Tin nhắn trong DB (B đọc sau)"]
        S6["markAsRead: UPDATE is_read = true"]
        S7["deleteMessage: SET is_deleted=true, content='...'"]
        S8["Emit 'messageDeleted' cho sender + receiver"]
    end

    subgraph Receiver["Nhân viên B (Người nhận)"]
        B1["Nhận WebSocket 'newMessage'"]
        B2["Mở hội thoại với A"]
        B3["Đọc tin nhắn"]
    end

    subgraph DB[(Cơ sở dữ liệu)]
        D1["INSERT message"]
        D2["UPDATE message (is_read / is_deleted)"]
    end

    Start --> A1
    A1 --> A2
    A2 --> A3
    A3 --> S1
    S1 --> D1
    D1 --> S2
    S2 --> S3
    S3 -- "Online" --> S4
    S4 --> B1
    S3 -- "Offline" --> S5
    B1 --> S5
    S5 --> B2
    B2 --> B3
    B3 --> S6
    S6 --> D2
    D2 --> End
    A3 --> A4
    A4 --> S7
    S7 --> D2
    D2 --> S8
    S8 --> End

    classDef startEnd fill:#111827,stroke:#ffffff,stroke-width:2px,color:#ffffff
    classDef action fill:#1f2937,stroke:#9ca3af,color:#ffffff
    classDef decision fill:#312e81,stroke:#facc15,stroke-width:2px,color:#ffffff
    classDef database fill:#064e3b,stroke:#34d399,color:#ffffff
    classDef notification fill:#4c1d95,stroke:#c084fc,color:#ffffff

    class Start,End startEnd
    class A1,A2,A3,A4,B1,B2,B3,S1,S2,S4,S5,S6,S7,S8 action
    class S3 decision
    class D1,D2 database
    class S2,S4,B1 notification
```

---

## 14. Quy trình Tạo Báo cáo & Phân tích

```mermaid
flowchart TD
    Start((Bắt đầu))
    End((Kết thúc))

    subgraph User["HR/Admin/Tài chính"]
        U1["Chọn loại báo cáo"]
        U2{"Loại báo cáo?"}
    end

    subgraph RS["ReportsService"]
        S1["payrollSummary(month, year)"]
        S2["Lấy payslips theo pay_period"]
        S3["Tính tổng: total_payroll, bonus, deductions"]
        S4["Gom nhóm theo department"]
        S5["Tính avg_salary mỗi phòng ban"]
        S6["getDashboardData()"]
        S7["Duyệt 12 tháng: salary_trend"]
        S8["Duyệt 12 tháng: headcount_trend (từ contract)"]
        S9["Duyệt 12 tháng: turnover (new_hires, resigned)"]
        S10["Snapshot: personnel_by_department"]
        S11["Trả về kết quả JSON"]
    end

    subgraph DB[(Cơ sở dữ liệu)]
        D1["SELECT payslip + employee + department"]
        D2["SELECT payroll_period"]
        D3["SELECT contract"]
        D4["SELECT employee + department"]
    end

    Start --> U1
    U1 --> U2
    U2 -- "Tổng lương" --> S1
    S1 --> S2
    S2 --> D1
    D1 --> S3
    S3 --> S4
    S4 --> S5
    S5 --> S11
    U2 -- "Dashboard" --> S6
    S6 --> S7
    S7 --> D2
    D2 --> S8
    S8 --> D3
    D3 --> S9
    S9 --> D3
    D3 --> S10
    S10 --> D4
    D4 --> S11
    S11 --> End

    classDef startEnd fill:#111827,stroke:#ffffff,stroke-width:2px,color:#ffffff
    classDef action fill:#1f2937,stroke:#9ca3af,color:#ffffff
    classDef decision fill:#312e81,stroke:#facc15,stroke-width:2px,color:#ffffff
    classDef database fill:#064e3b,stroke:#34d399,color:#ffffff

    class Start,End startEnd
    class U1,S1,S2,S3,S4,S5,S6,S7,S8,S9,S10,S11 action
    class U2 decision
    class D1,D2,D3,D4 database
```

---

## 15. Quy trình Quản lý Phân quyền RBAC

```mermaid
flowchart TD
    Start((Bắt đầu))
    End((Kết thúc))

    subgraph Admin["Admin"]
        A1["Mở giao diện phân quyền"]
        A2["Xem ma trận (Position × Permission)"]
        A3["Xem quyền theo nhóm module"]
        A4["Chọn chức vụ cần cấu hình"]
        A5{"Thao tác?"}
    end

    subgraph AS["AdminService"]
        S1["getPermissionMatrix()"]
        S2["getGroupedPermissions()"]
        S3["assignPermissionToPosition(posId, permId)"]
        S4{"Đã tồn tại assignment?"}
        S5["Báo lỗi: đã được gán"]
        S6["INSERT position_permission"]
        S7["revokePermissionFromPosition(posId, permId)"]
        S8["DELETE position_permission"]
        S9["updateRolePermissions(posId, permIds[])"]
        S10["DELETE ALL position_permission WHERE posId"]
        S11["INSERT batch assignments mới"]
        S12["Hệ thống áp dụng ngay (Guard check real-time)"]
    end

    subgraph DB[(Cơ sở dữ liệu)]
        D1["SELECT position + permissions"]
        D2["SELECT permission GROUP BY module_group"]
        D3["INSERT/DELETE position_permission"]
    end

    Start --> A1
    A1 --> A2
    A1 --> A3
    A2 --> S1
    S1 --> D1
    D1 --> A4
    A3 --> S2
    S2 --> D2
    D2 --> A4
    A4 --> A5
    A5 -- "Thêm" --> S3
    S3 --> S4
    S4 -- "Có" --> S5
    S5 --> End
    S4 -- "Không" --> S6
    S6 --> D3
    D3 --> S12
    A5 -- "Thu hồi" --> S7
    S7 --> S8
    S8 --> D3
    D3 --> S12
    A5 -- "Cập nhật hàng loạt" --> S9
    S9 --> S10
    S10 --> D3
    D3 --> S11
    S11 --> D3
    D3 --> S12
    S12 --> End

    classDef startEnd fill:#111827,stroke:#ffffff,stroke-width:2px,color:#ffffff
    classDef action fill:#1f2937,stroke:#9ca3af,color:#ffffff
    classDef decision fill:#312e81,stroke:#facc15,stroke-width:2px,color:#ffffff
    classDef database fill:#064e3b,stroke:#34d399,color:#ffffff

    class Start,End startEnd
    class A1,A2,A3,A4,S1,S2,S3,S5,S6,S7,S8,S9,S10,S11,S12 action
    class A5,S4 decision
    class D1,D2,D3 database
```

---

## 16. Quy trình Quản lý Ngày lễ/Nghỉ lễ

```mermaid
flowchart TD
    Start((Bắt đầu))
    End((Kết thúc))

    subgraph Admin["Admin"]
        A1["Mở quản lý ngày lễ"]
        A2["Xem danh sách (lọc theo năm)"]
        A3{"Thao tác?"}
        A4["Nhập tên, ngày, loại, mô tả"]
        A5["Cập nhật ngày lễ"]
        A6["Xóa ngày lễ"]
        A7["Seed ngày lễ Việt Nam"]
    end

    subgraph HS["HolidayService"]
        S1["findAll()"]
        S2{"Định kỳ hàng năm?"}
        S3["Lưu is_recurring = true"]
        S4["Lưu is_recurring = false"]
        S5["update()"]
        S6["delete()"]
        S7["seedVietnameseHolidays()"]
    end

    subgraph DB[(Cơ sở dữ liệu)]
        D1["SELECT public_holiday"]
        D2["INSERT public_holiday"]
        D3["UPDATE public_holiday"]
        D4["DELETE public_holiday"]
    end

    Start --> A1
    A1 --> S1
    S1 --> D1
    D1 --> A2
    A2 --> A3
    A3 -- "Thêm" --> A4
    A4 --> S2
    S2 -- "Có" --> S3
    S2 -- "Không" --> S4
    S3 --> D2
    S4 --> D2
    D2 --> End
    A3 -- "Sửa" --> A5
    A5 --> S5
    S5 --> D3
    D3 --> End
    A3 -- "Xóa" --> A6
    A6 --> S6
    S6 --> D4
    D4 --> End
    A3 -- "Seed VN" --> A7
    A7 --> S7
    S7 --> D2
    D2 --> End

    classDef startEnd fill:#111827,stroke:#ffffff,stroke-width:2px,color:#ffffff
    classDef action fill:#1f2937,stroke:#9ca3af,color:#ffffff
    classDef decision fill:#312e81,stroke:#facc15,stroke-width:2px,color:#ffffff
    classDef database fill:#064e3b,stroke:#34d399,color:#ffffff

    class Start,End startEnd
    class A1,A2,A4,A5,A6,A7,S1,S3,S4,S5,S6,S7 action
    class A3,S2 decision
    class D1,D2,D3,D4 database
```

---

## Tổng kết các module được bao hàm

| # | Module | Activity Diagram | Mô tả |
|---|--------|-----------------|-------|
| 1 | Leave | Duyệt nghỉ phép | Nộp → xác thực → duyệt/từ chối → trừ/hoàn số dư |
| 2 | Payroll | Tạo bảng lương | Pipeline tính lương với OT, KPI, thuế 7 bậc, bảo hiểm |
| 3 | Timekeeping | Chấm công QR | QR động 35s → quét → check-in/out → tự động tạo vi phạm |
| 4 | Timekeeping | Check-in IP | IP whitelist guard → xác thực → check-in/out (ca tối 18:30) |
| 5 | Resignation | Từ chức | Nộp đơn → kiểm tra trùng → duyệt → chấm dứt NV + hợp đồng |
| 6 | Notification | Phân phối thông báo WebSocket | Kết nối Socket.io → kiểm tra tùy chọn → INSERT + emit real-time |
| 7 | Timekeeping | Cron đồng bộ chấm công | @Cron nửa đêm → quét ca < 8h → tạo vi phạm → thông báo HR |
| 8 | KPI | Quản lý KPI | Thư viện → kỳ → gán (weight=100%) → cập nhật → chấm → tính điểm (cap 120%) |
| 9 | Contract | Vòng đời hợp đồng | Tạo (deactivate cũ) → active → cập nhật → xóa cứng + lịch sử lương |
| 10 | Employee | Vòng đời nhân viên | Tạo (check email) → active → cập nhật/chuyển → offboard → chấm dứt hợp đồng |
| 11 | Violation | Quản lý & đồng bộ vi phạm | Tạo thủ công (CRUD) + tự động sync từ chấm công (Cron + real-time) |
| 12 | Announcement | Đăng & phân phối thông báo | Tạo → lọc audience (all/dept_X) → gửi notification + WebSocket |
| 13 | Message | Nhắn tin 1:1 | Soạn → gửi → notification + WebSocket → đọc → xóa mềm |
| 14 | Reports | Tạo báo cáo & phân tích | Payroll summary (theo dept) + Dashboard (12 tháng: salary, headcount, turnover) |
| 15 | RBAC | Quản lý phân quyền | Xem ma trận → gán/thu hồi → batch update → áp dụng Guard real-time |
| 16 | Holiday | Quản lý ngày lễ | CRUD + recurring + seed 12 ngày lễ Việt Nam |
