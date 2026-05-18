# Sơ đồ Activity — Hệ thống HRM

> Luồng quy trình nghiệp vụ được mô tả bằng sơ đồ activity UML.

---

## 1. Quy trình Duyệt Nghỉ phép

```mermaid
stateDiagram-v2
    state "Nhân viên nộp đơn nghỉ phép" as submit
    state "Xác thực loại phép & nhân viên tồn tại" as validate
    state "Lưu đơn (status: Đang chờ)" as save
    state "Thông báo HR/Admin qua WebSocket" as notify_admins
    state "Đang chờ xem xét" as pending
    state "HR/Quản lý xem xét đơn" as review
    state "Quyết định" as decision
    state "Đã duyệt" as approved
    state "Đã từ chối" as rejected
    state "Tính số ngày làm việc (T2-T6)" as calc_days
    state "Trừ vào LeaveBalance" as deduct
    state "Tự động tạo số dư nếu chưa có" as auto_balance
    state "Trước đó đã được duyệt?" as was_approved
    state "Hoàn lại ngày phép vào số dư" as restore
    state "Thông báo nhân viên về quyết định" as notify_emp
    state "Hoàn tất" as done

    [*] --> submit
    submit --> validate
    validate --> save : Hợp lệ
    validate --> [*] : Không hợp lệ (400)
    save --> notify_admins
    notify_admins --> pending
    pending --> review
    review --> decision
    decision --> approved : status = "Approved"
    decision --> rejected : status = "Rejected"

    approved --> calc_days
    calc_days --> deduct
    deduct --> auto_balance : Chưa có bản ghi số dư
    auto_balance --> notify_emp
    deduct --> notify_emp : Đã có số dư

    rejected --> was_approved
    was_approved --> restore : Có (hoàn lại số dư)
    was_approved --> notify_emp : Không (không cần hoàn)
    restore --> notify_emp

    notify_emp --> done
    done --> [*]
```

---

## 2. Quy trình Tạo Bảng lương

```mermaid
stateDiagram-v2
    state "HR/Tài chính kích hoạt bảng lương tháng/năm" as trigger
    state "Lấy hoặc tạo PayrollPeriod" as period
    state "Lấy tất cả nhân viên" as fetch_emp
    state "Lấy dữ liệu chấm công trong tháng" as fetch_tk
    state "Lấy đơn nghỉ phép đã duyệt" as fetch_leave
    state "Lấy điều chỉnh lương (thưởng/phạt)" as fetch_adj
    state "Lấy cài đặt công ty (tỷ lệ bảo hiểm)" as fetch_settings
    state "Xây dựng tập ngày nghỉ cho từng nhân viên" as build_leave_set
    state "Xử lý từng nhân viên" as loop_emp
    state "Có SalaryConfig?" as has_config
    state "Bỏ qua nhân viên (cảnh báo)" as skip
    state "Tính ngày công (loại trừ ngày nghỉ phép)" as work_days
    state "Tách nghỉ phép có lương vs không lương" as leave_type
    state "Tính giờ OT & lương OT" as calc_ot
    state "Lấy điểm KPI nếu có" as kpi
    state "Tính tổng thu nhập" as gross
    state "Tính khấu trừ (bảo hiểm + thuế + phạt)" as deductions
    state "Tính thuế TNCN (7 bậc lũy tiến)" as pit
    state "Tính lương thực lãnh" as net
    state "UPSERT phiếu lương" as save_payslip
    state "Còn nhân viên?" as more
    state "Trả về tóm tắt" as summary

    [*] --> trigger
    trigger --> period
    period --> fetch_emp
    fetch_emp --> fetch_tk
    fetch_tk --> fetch_leave
    fetch_leave --> fetch_adj
    fetch_adj --> fetch_settings
    fetch_settings --> build_leave_set
    build_leave_set --> loop_emp

    loop_emp --> has_config
    has_config --> skip : Không
    has_config --> work_days : Có

    work_days --> leave_type
    leave_type --> calc_ot
    calc_ot --> kpi
    kpi --> gross

    gross --> deductions
    deductions --> pit
    pit --> net
    net --> save_payslip
    save_payslip --> more
    skip --> more

    more --> loop_emp : Còn
    more --> summary : Hết
    summary --> [*]

    note right of gross
        grossIncome =
          salaryPerDay × actualWorkDays
          + allowances (đi lại, ăn trưa, trách nhiệm)
          + bonusAdjustments
          + kpiBonus
          + overtimePay
    end note

    note right of deductions
        taxable = grossIncome
          - socialInsurance
          - lunchAllowance
          - 11M (giảm trừ cá nhân)
          - 4.4M × dependents_count
        pitDeduction = calculatePIT(taxable)
        totalDeductions =
          insurance + PIT + penaltyAdj
          + unpaidAbsentDeduction
    end note
```

---

## 3. Quy trình Chấm công QR (Check-in/Check-out)

```mermaid
stateDiagram-v2
    state "Phát QR động (TTL 35s)" as gen_qr
    state "Nhân viên quét mã QR" as scan
    state "Xác thực token (tồn tại & chưa hết hạn)" as validate_token
    state "Xóa token đã dùng" as delete_token
    state "Tìm bản ghi mới nhất hôm nay" as find_latest
    state "Check-in: Không có bản ghi HOẶC ca trước đã hoàn thành" as case_checkin
    state "Check-out: Có bản ghi, chưa có check_out_time" as case_checkout
    state "Kiểm tra debounce (60s)" as debounce
    state "Xác định trạng thái Đi muộn/Có mặt" as late_check
    state "Thêm bản ghi chấm công" as insert_tk
    state "Cập nhật check_out_time & giờ làm" as update_checkout
    state "Giờ làm < 8?" as short_shift
    state "Tự động tạo vi phạm (Ca làm không đủ)" as auto_violation
    state "Gửi thông báo cảnh báo" as warn
    state "Trả về kết quả" as result

    [*] --> gen_qr
    gen_qr --> scan
    scan --> validate_token
    validate_token --> delete_token : Hợp lệ
    validate_token --> [*] : Không hợp lệ/Hết hạn
    delete_token --> find_latest

    find_latest --> case_checkin : Không bản ghi HOẶC đã checkout
    find_latest --> case_checkout : Có bản ghi, chưa checkout

    case_checkin --> debounce
    debounce --> late_check
    late_check --> insert_tk
    insert_tk --> result

    case_checkout --> debounce
    debounce --> update_checkout
    update_checkout --> short_shift
    short_shift --> auto_violation : Có
    short_shift --> result : Không
    auto_violation --> warn
    warn --> result
    result --> [*]
```

---

## 4. Quy trình Check-in bằng IP (Whitelist)

```mermaid
stateDiagram-v2
    state "Nhân viên gửi yêu cầu check-in IP" as request
    state "IPWhitelistGuard kiểm tra IP" as guard
    state "Lấy cài đặt COMPANY_IP_WHITELIST" as fetch_whitelist
    state "IP có trong whitelist?" as check_ip
    state "Từ chối: 403 Forbidden" as reject
    state "Tìm bản ghi mới nhất hôm nay" as find_latest
    state "Check-in: Không bản ghi" as do_checkin
    state "Check-out: Có bản ghi" as do_checkout
    state "Thêm bản ghi (kèm IP)" as insert_tk
    state "Cập nhật checkout & giờ làm" as update_tk
    state "Trả về kết quả" as result

    [*] --> request
    request --> guard
    guard --> fetch_whitelist
    fetch_whitelist --> check_ip
    check_ip --> reject : Không trong whitelist
    check_ip --> find_latest : Trong whitelist
    reject --> [*]

    find_latest --> do_checkin : Không bản ghi HOẶC đã checkout
    find_latest --> do_checkout : Có bản ghi, chưa checkout

    do_checkin --> insert_tk
    insert_tk --> result

    do_checkout --> update_tk
    update_tk --> result
    result --> [*]
```

---

## 5. Quy trình Từ chức

```mermaid
stateDiagram-v2
    state "Nhân viên nộp đơn từ chức" as submit
    state "Kiểm tra đơn đang active" as check_existing
    state "Từ chối: Đã có đơn đang xử lý" as reject_dup
    state "Lưu đơn (status: Đang chờ)" as save_req
    state "Thông báo HR/Admin" as notify_hr
    state "HR xem xét đơn" as hr_review
    state "Quyết định" as decision
    state "Duyệt" as approve
    state "Từ chối" as reject_req
    state "Đặt trạng thái nhân viên → Đã chấm dứt" as terminate
    state "Đặt lý do & ngày từ chức" as set_reason
    state "Chấm dứt hợp đồng active" as terminate_contract
    state "Cập nhật trạng thái đơn" as update_status
    state "Thông báo nhân viên về quyết định" as notify_emp
    state "Hoàn tất" as done

    [*] --> submit
    submit --> check_existing
    check_existing --> reject_dup : Có
    check_existing --> save_req : Không
    reject_dup --> [*]
    save_req --> notify_hr
    notify_hr --> hr_review
    hr_review --> decision

    decision --> approve : Duyệt
    decision --> reject_req : Từ chối

    approve --> terminate
    terminate --> set_reason
    set_reason --> terminate_contract
    terminate_contract --> update_status

    reject_req --> update_status

    update_status --> notify_emp
    notify_emp --> done
    done --> [*]
```

---

## 6. Quy trình Phân phối Thông báo (WebSocket Real-time)

```mermaid
stateDiagram-v2
    state "Frontend kết nối Socket.io" as connect
    state "Gateway phân tích access_token từ cookie" as parse_cookie
    state "JWT xác thực token" as verify_jwt
    state "Đăng ký socket vào userSockets map" as register
    state "Sự kiện nghiệp vụ xảy ra (nghỉ phép/lương/v.v.)" as event
    state "Service gọi NotificationsService.createNotification()" as create_notif
    state "Kiểm tra tùy chọn nhân viên" as check_prefs
    state "Bỏ qua (tùy chọn tắt)" as skip
    state "INSERT vào bảng notification" as insert_db
    state "Gateway: tìm socket(s) theo userId" as find_socket
    state "Emit 'newNotification' event tới socket" as emit
    state "Frontend: socket.on('newNotification')" as receive
    state "Cập nhật NotificationContext state" as update_state
    state "Hiển thị toast + cập nhật badge chuông" as show_toast
    state "Người dùng nhấn thông báo → markAsRead" as mark_read

    [*] --> connect
    connect --> parse_cookie
    parse_cookie --> verify_jwt
    verify_jwt --> register : Hợp lệ
    verify_jwt --> [*] : Không hợp lệ
    register --> event

    event --> create_notif
    create_notif --> check_prefs
    check_prefs --> skip : Tắt
    check_prefs --> insert_db : Bật
    skip --> [*]
    insert_db --> find_socket
    find_socket --> emit : Tìm thấy socket
    find_socket --> [*] : Không có socket (offline - đã lưu DB)
    emit --> receive
    receive --> update_state
    update_state --> show_toast
    show_toast --> mark_read
    mark_read --> [*]
```

---

## 7. Quy trình Cron Đồng bộ Chấm công Hàng ngày (Nửa đêm)

```mermaid
stateDiagram-v2
    state "Cron kích hoạt lúc nửa đêm" as cron
    state "Truy vấn chấm công hôm nay (giờ < 8)" as query_tk
    state "Xử lý từng bản ghi không đủ giờ" as loop
    state "Đã có vi phạm cho hôm nay?" as has_violation
    state "Bỏ qua (đã tồn tại)" as skip_v
    state "Tạo vi phạm (Ca làm không đủ)" as create_v
    state "Thông báo nhân viên" as notify_emp
    state "Còn bản ghi?" as more
    state "Số lượng tạo > 0?" as any_created
    state "Thông báo HR/Admin với tóm tắt" as notify_hr
    state "Hoàn tất" as done

    [*] --> cron
    cron --> query_tk
    query_tk --> loop

    loop --> has_violation
    has_violation --> skip_v : Có
    has_violation --> create_v : Không
    create_v --> notify_emp
    notify_emp --> more
    skip_v --> more

    more --> loop : Còn
    more --> any_created : Hết

    any_created --> notify_hr : Có
    any_created --> done : Không
    notify_hr --> done
    done --> [*]
```

---

## 8. Quy trình Quản lý KPI (Thư viện → Kỳ → Gán → Chấm điểm)

```mermaid
stateDiagram-v2
    state "Admin tạo thư viện KPI" as create_lib
    state "Admin tạo kỳ đánh giá KPI" as create_period
    state "Quản lý gán KPI cho nhân viên" as assign_kpi
    state "Nhân viên nhận KPI (status: Assigned)" as emp_receive
    state "Nhân viên cập nhật giá trị thực tế" as update_actual
    state "Nộp KPI (status: Submitted)" as submit_kpi
    state "Quản lý xem xét & chấm điểm" as manager_review
    state "Duyệt KPI (status: Approved)" as approve_kpi
    state "Tính điểm tổng hợp" as calc_score
    state "Điểm = sum(thực_tế/mục_tiêu × 100 × trọng_số/100)" as formula
    state "Điểm dùng cho bảng lương" as payroll_use
    state "Hoàn tất" as done

    [*] --> create_lib
    create_lib --> create_period
    create_period --> assign_kpi
    assign_kpi --> emp_receive
    emp_receive --> update_actual
    update_actual --> submit_kpi
    submit_kpi --> manager_review
    manager_review --> approve_kpi
    approve_kpi --> calc_score
    calc_score --> formula
    formula --> payroll_use
    payroll_use --> done
    done --> [*]

    note right of formula
        finalScore = Σ(
          actual_value/target_value
          × 100 × weight/100
        )
        KpiBonus = (score/100)
          × baseSalary
          × kpi_bonus_percentage/100
    end note
```

---

## 9. Quy trình Vòng đời Hợp đồng Lao động

```mermaid
stateDiagram-v2
    state "Tạo hợp đồng mới" as create
    state "Xác thực nhân viên tồn tại" as validate_emp
    state "Kiểm tra mã hợp đồng không trùng" as gen_number
    state "Lưu hợp đồng (status: Active)" as save_contract
    state "Lưu lịch sử lương (old=0 → new=salary_rate)" as save_history
    state "Hợp đồng đang hiệu lực" as active
    state "Cập nhật hợp đồng (lương, ngày)" as update
    state "Lưu lịch sử thay đổi lương" as update_history
    state "Gia hạn hợp đồng" as extend
    state "Hợp đồng hết hạn?" as check_expiry
    state "Đánh dấu Expired" as mark_expired
    state "Chấm dứt hợp đồng" as terminate
    state "Đánh dấu Terminated" as mark_terminated
    state "Xóa hợp đồng" as delete_contract
    state "Hoàn tất" as done

    [*] --> create
    create --> validate_emp
    validate_emp --> gen_number
    gen_number --> save_contract
    save_contract --> save_history
    save_history --> active

    active --> update : Cập nhật
    active --> extend : Gia hạn
    active --> check_expiry : Kiểm tra định kỳ
    active --> terminate : Chấm dứt

    update --> update_history
    update_history --> active

    extend --> active

    check_expiry --> mark_expired : Hết hạn
    check_expiry --> active : Còn hạn

    terminate --> mark_terminated
    mark_terminated --> done
    mark_expired --> done

    active --> delete_contract : Xóa
    delete_contract --> done
    done --> [*]
```

---

## 10. Quy trình Vòng đời Nhân viên (Onboard → Active → Offboard)

```mermaid
stateDiagram-v2
    state "HR/Admin tạo nhân viên mới" as create_emp
    state "Kiểm tra email trùng lặp" as check_email
    state "Báo lỗi: Email đã tồn tại" as email_exists
    state "Mã hóa mật khẩu (bcrypt)" as hash_pwd
    state "Lưu Employee" as save_emp
    state "Gửi thông báo chào mừng" as welcome_notif
    state "Nhân viên đang làm việc (Active)" as active
    state "Cập nhật hồ sơ" as update_profile
    state "Tải ảnh đại diện" as upload_avatar
    state "Chuyển phòng ban/chức vụ" as transfer
    state "Offboard nhân viên" as offboard
    state "Cập nhật trạng thái → Terminated" as set_terminated
    state "Chấm dứt hợp đồng active" as end_contracts
    state "Hoàn tất" as done

    [*] --> create_emp
    create_emp --> check_email
    check_email --> email_exists : Trùng
    check_email --> hash_pwd : Mới
    email_exists --> [*]
    hash_pwd --> save_emp
    save_emp --> welcome_notif
    welcome_notif --> active

    active --> update_profile : Cập nhật
    active --> upload_avatar : Upload ảnh
    active --> transfer : Chuyển
    active --> offboard : Offboard

    update_profile --> active
    upload_avatar --> active
    transfer --> active

    offboard --> set_terminated
    set_terminated --> end_contracts
    end_contracts --> done
    done --> [*]
```

---

## 11. Quy trình Quản lý & Đồng bộ Vi phạm

```mermaid
stateDiagram-v2
    state "HR tạo vi phạm thủ công" as manual_create
    state "Nhập loại, mức độ, tiền phạt, mô tả" as input_violation
    state "Lưu vi phạm (status: Pending)" as save_violation
    state "Thông báo nhân viên" as notify_emp
    state "Vi phạm đang xử lý" as pending_v
    state "HR cập nhật vi phạm" as update_v
    state "Đánh dấu Resolved" as resolve_v
    state "Xóa vi phạm" as delete_v

    state "Cron/HR kích hoạt đồng bộ chấm công" as sync_trigger
    state "Quét TimeKeeping hôm nay (giờ < 8)" as scan_tk
    state "Xử lý từng ca không đủ" as loop_tk
    state "Đã có vi phạm hôm nay?" as check_existing
    state "Bỏ qua" as skip
    state "Tự động tạo vi phạm (Ca làm không đủ)" as auto_create
    state "Thông báo nhân viên qua WebSocket" as auto_notify
    state "Còn ca?" as more_tk
    state "Thông báo HR với tóm tắt" as notify_hr

    [*] --> manual_create
    manual_create --> input_violation
    input_violation --> save_violation
    save_violation --> notify_emp
    notify_emp --> pending_v

    pending_v --> update_v : Cập nhật
    pending_v --> resolve_v : Giải quyết
    pending_v --> delete_v : Xóa

    update_v --> pending_v
    resolve_v --> [*]
    delete_v --> [*]

    [*] --> sync_trigger
    sync_trigger --> scan_tk
    scan_tk --> loop_tk
    loop_tk --> check_existing
    check_existing --> skip : Có
    check_existing --> auto_create : Không
    auto_create --> auto_notify
    auto_notify --> more_tk
    skip --> more_tk
    more_tk --> loop_tk : Còn
    more_tk --> notify_hr : Hết
    notify_hr --> [*]
```

---

## 12. Quy trình Đăng & Phân phối Thông báo Công ty

```mermaid
stateDiagram-v2
    state "HR/Admin tạo thông báo" as create
    state "Nhập tiêu đề, nội dung, loại, đối tượng, ưu tiên" as input_fields
    state "Chọn kênh phân phối (in_app, email)" as select_channels
    state "Lưu thông báo" as save
    state "Kênh in_app được chọn?" as check_inapp
    state "Lọc nhân viên theo target_audience" as filter_emp
    state "Tạo notification cho từng nhân viên" as create_notifs
    state "Gửi WebSocket cho nhân viên online" as push_ws
    state "Hoàn tất" as done

    [*] --> create
    create --> input_fields
    input_fields --> select_channels
    select_channels --> save
    save --> check_inapp

    check_inapp --> filter_emp : Có
    check_inapp --> done : Không

    filter_emp --> create_notifs
    create_notifs --> push_ws
    push_ws --> done
    done --> [*]

    note right of filter_emp
        target_audience:
        - "all": toàn bộ nhân viên
        - "dept_X": phòng ban cụ thể
    end note
```

---

## 13. Quy trình Nhắn tin Trực tiếp (1:1 Chat)

```mermaid
stateDiagram-v2
    state "Nhân viên A soạn tin nhắn" as compose
    state "Chọn người nhận B" as select_receiver
    state "Gửi tin nhắn" as send
    state "Lưu message (sender=A, receiver=B, is_read=false)" as save_msg
    state "Tạo notification cho B" as create_notif
    state "B online?" as check_online
    state "Gửi WebSocket real-time cho B" as push_ws
    state "Tin nhắn đợi B đọc (DB đã lưu)" as wait_read
    state "B mở hội thoại với A" as open_chat
    state "B đọc tin nhắn" as read_msg
    state "Đánh dấu is_read=true" as mark_read
    state "A hoặc B xóa tin nhắn" as delete_msg
    state "Hoàn tất" as done

    [*] --> compose
    compose --> select_receiver
    select_receiver --> send
    send --> save_msg
    save_msg --> create_notif
    create_notif --> check_online
    check_online --> push_ws : Online
    check_online --> wait_read : Offline
    push_ws --> wait_read
    wait_read --> open_chat
    open_chat --> read_msg
    read_msg --> mark_read
    mark_read --> done

    send --> delete_msg : Xóa
    delete_msg --> done
    done --> [*]
```

---

## 14. Quy trình Tạo Báo cáo & Phân tích

```mermaid
stateDiagram-v2
    state "Người dùng chọn loại báo cáo" as select_type
    state "Báo cáo tổng lương" as payroll_report
    state "Báo cáo dashboard" as dashboard_report
    state "Nhập tháng/năm" as input_params
    state "Truy vấn PayrollPeriod" as query_period
    state "Truy vấn Payslip + Employee + Department" as query_data
    state "Tính tổng lương, thưởng, khấu trừ" as calc_totals
    state "Tính lương theo phòng ban" as calc_by_dept
    state "Truy vấn đa module (Employee, Leave, Attendance, Payroll)" as query_multi
    state "Tổng hợp dữ liệu dashboard" as aggregate
    state "Trả về kết quả" as return_result
    state "Hiển thị biểu đồ" as show_charts
    state "Hoàn tất" as done

    [*] --> select_type
    select_type --> payroll_report : Tổng lương
    select_type --> dashboard_report : Dashboard

    payroll_report --> input_params
    input_params --> query_period
    query_period --> query_data
    query_data --> calc_totals
    calc_totals --> calc_by_dept
    calc_by_dept --> return_result

    dashboard_report --> query_multi
    query_multi --> aggregate
    aggregate --> return_result

    return_result --> show_charts
    show_charts --> done
    done --> [*]

    note right of show_charts
        Biểu đồ:
        - Bar chart: lương theo phòng ban
        - Pie chart: cơ cấu lương
        - Thống kê: tổng NV, tỷ lệ CC, tỷ lệ phép
    end note
```

---

## 15. Quy trình Quản lý Phân quyền RBAC

```mermaid
stateDiagram-v2
    state "Admin mở giao diện phân quyền" as open_rbac
    state "Xem ma trận phân quyền (Position × Permission)" as view_matrix
    state "Xem quyền theo nhóm module" as view_grouped
    state "Chọn chức vụ cần cấu hình" as select_pos
    state "Thêm quyền cho chức vụ" as add_perm
    state "Chọn quyền từ danh sách" as select_perm
    state "INSERT position_permission" as insert_pp
    state "Thu hồi quyền khỏi chức vụ" as revoke_perm
    state "DELETE position_permission" as delete_pp
    state "Cập nhật toàn bộ quyền (batch)" as batch_update
    state "DELETE ALL + INSERT lại danh sách mới" as replace_all
    state "Hệ thống áp dụng ngay lập tức" as apply_immediate
    state "Hoàn tất" as done

    [*] --> open_rbac
    open_rbac --> view_matrix
    open_rbac --> view_grouped

    view_matrix --> select_pos
    view_grouped --> select_pos

    select_pos --> add_perm : Thêm
    select_pos --> revoke_perm : Thu hồi
    select_pos --> batch_update : Cập nhật hàng loạt

    add_perm --> select_perm
    select_perm --> insert_pp
    insert_pp --> apply_immediate

    revoke_perm --> delete_pp
    delete_pp --> apply_immediate

    batch_update --> replace_all
    replace_all --> apply_immediate

    apply_immediate --> done
    done --> [*]

    note right of apply_immediate
        Các guard kiểm tra real-time:
        - JwtAuthGuard (xác thực)
        - RolesGuard (chức vụ)
        - PermissionsGuard (quyền)
        - EndpointPermissionsGuard (tự động map)
    end note
```

---

## 16. Quy trình Quản lý Ngày lễ/Nghỉ lễ

```mermaid
stateDiagram-v2
    state "Admin mở quản lý ngày lễ" as open
    state "Xem danh sách ngày lễ (lọc theo năm)" as view_list
    state "Thêm ngày lễ mới" as create
    state "Nhập tên, ngày, loại, mô tả" as input_holiday
    state "Định kỳ hàng năm?" as check_recurring
    state "Lưu với is_recurring=true" as save_recurring
    state "Lưu với is_recurring=false" as save_one_time
    state "Cập nhật ngày lễ" as update
    state "Xóa ngày lễ" as delete
    state "Seed ngày lễ Việt Nam" as seed_vn
    state "Tự động tạo lịch nghỉ cho năm" as gen_calendar
    state "Hoàn tất" as done

    [*] --> open
    open --> view_list
    view_list --> create : Thêm
    view_list --> update : Sửa
    view_list --> delete : Xóa
    view_list --> seed_vn : Seed VN

    create --> input_holiday
    input_holiday --> check_recurring
    check_recurring --> save_recurring : Có
    check_recurring --> save_one_time : Không
    save_recurring --> gen_calendar
    save_one_time --> gen_calendar

    update --> gen_calendar
    delete --> gen_calendar

    seed_vn --> gen_calendar

    gen_calendar --> done
    done --> [*]
```

---

## Tổng kết các module được bao hàm

| # | Module | Activity Diagram | Mô tả |
|---|--------|-----------------|-------|
| 1 | Leave | Duyệt nghỉ phép | Nộp → xác thực → duyệt/từ chối → trừ/hoàn số dư |
| 2 | Payroll | Tạo bảng lương | Pipeline tính lương với OT, KPI, thuế, bảo hiểm |
| 3 | Timekeeping | Chấm công QR | QR động → quét → check-in/out → phát hiện vi phạm |
| 4 | Timekeeping | Check-in IP | IP whitelist guard → xác thực → check-in/out |
| 5 | Resignation | Từ chức | Nộp đơn → kiểm tra trùng → duyệt → chấm dứt |
| 6 | Notification | Phân phối thông báo WebSocket | Kết nối → sự kiện → kiểm tra tùy chọn → gửi → hiển thị |
| 7 | Timekeeping | Cron đồng bộ chấm công | Quét nửa đêm → phát hiện ca thiếu → tạo vi phạm → thông báo |
| 8 | KPI | Quản lý KPI | Thư viện → kỳ → gán → cập nhật → nộp → chấm → tính điểm |
| 9 | Contract | Vòng đời hợp đồng | Tạo → active → cập nhật/gia hạn → hết hạn/chấm dứt |
| 10 | Employee | Vòng đời nhân viên | Tạo → bank + phép → active → cập nhật → offboard |
| 11 | Violation | Quản lý & đồng bộ vi phạm | Tạo thủ công + tự động sync từ chấm công |
| 12 | Announcement | Đăng & phân phối thông báo | Tạo → lọc đối tượng → gửi in_app/email |
| 13 | Message | Nhắn tin 1:1 | Soạn → gửi → thông báo → đọc → xóa |
| 14 | Reports | Tạo báo cáo & phân tích | Chọn loại → truy vấn → tổng hợp → hiển thị biểu đồ |
| 15 | RBAC | Quản lý phân quyền | Xem ma trận → gán/thu hồi → cập nhật batch → áp dụng |
| 16 | Holiday | Quản lý ngày lễ | CRUD + seed ngày lễ Việt Nam + lịch định kỳ |
