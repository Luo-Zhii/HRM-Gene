# Activity Diagrams — HRM System

> Business process workflows visualized as UML activity diagrams.

---

## 1. Leave Approval Workflow

```mermaid
stateDiagram-v2
    state "Employee submits leave request" as submit
    state "Validate leave type & employee exist" as validate
    state "Save request (status: Pending)" as save
    state "Notify HR/Admins via WebSocket" as notify_admins
    state "Pending Review" as pending
    state "HR/Manager reviews request" as review
    state "Decision" as decision
    state "Approved" as approved
    state "Rejected" as rejected
    state "Calculate working days (Mon-Fri)" as calc_days
    state "Deduct from LeaveBalance" as deduct
    state "Auto-create balance if none" as auto_balance
    state "Was previously Approved?" as was_approved
    state "Restore days to balance" as restore
    state "Notify employee of decision" as notify_emp
    state "Done" as done

    [*] --> submit
    submit --> validate
    validate --> save : Valid
    validate --> [*] : Invalid (400)
    save --> notify_admins
    notify_admins --> pending
    pending --> review
    review --> decision
    decision --> approved : status = "Approved"
    decision --> rejected : status = "Rejected"
    
    approved --> calc_days
    calc_days --> deduct
    deduct --> auto_balance : No balance record
    auto_balance --> notify_emp
    deduct --> notify_emp : Balance exists
    
    rejected --> was_approved
    was_approved --> restore : Yes (restore balance)
    was_approved --> notify_emp : No (no restore needed)
    restore --> notify_emp
    
    notify_emp --> done
    done --> [*]
```

---

## 2. Payroll Generation Workflow

```mermaid
stateDiagram-v2
    state "HR triggers payroll for month/year" as trigger
    state "Get or create PayrollPeriod" as period
    state "Fetch all employees" as fetch_emp
    state "Fetch timekeeping for month range" as fetch_tk
    state "Fetch approved leave requests" as fetch_leave
    state "Fetch salary adjustments (bonus/penalty)" as fetch_adj
    state "Fetch company settings (insurance rate)" as fetch_settings
    state "Build leave date set per employee" as build_leave_set
    state "Process each employee" as loop_emp
    state "Has SalaryConfig?" as has_config
    state "Skip employee (warn)" as skip
    state "Compute work days (exclude leave dates)" as work_days
    state "Separate paid vs unpaid leave" as leave_type
    state "Calculate OT hours & pay" as calc_ot
    state "Get KPI score if applicable" as kpi
    state "Compute gross income" as gross
    state "Compute deductions (insurance + PIT + penalty)" as deductions
    state "Compute PIT (7-bracket progressive)" as pit
    state "Compute net salary" as net
    state "UPSERT payslip record" as save_payslip
    state "More employees?" as more
    state "Return summary" as summary

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
    has_config --> skip : No
    has_config --> work_days : Yes

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

    more --> loop_emp : Yes
    more --> summary : No
    summary --> [*]

    note right of gross
        grossIncome =
          salaryPerDay × actualWorkDays
          + allowances (transport, lunch, responsibility)
          + bonusAdjustments
          + kpiBonus
          + overtimePay
    end note

    note right of deductions
        taxable = grossIncome
          - socialInsurance
          - lunchAllowance
          - 11M (personal exemption)
          - 4.4M × dependents_count
        pitDeduction = calculatePIT(taxable)
        totalDeductions =
          insurance + PIT + penaltyAdj
          + unpaidAbsentDeduction
    end note
```

---

## 3. Timekeeping Workflow (QR Check-in/Check-out)

```mermaid
stateDiagram-v2
    state "Generate dynamic QR (35s TTL)" as gen_qr
    state "Employee scans QR" as scan
    state "Validate token (exists & not expired)" as validate_token
    state "Delete consumed token" as delete_token
    state "Find today's latest record" as find_latest
    state "Check-in: No record OR previous shift completed" as case_checkin
    state "Check-out: Record exists, no check_out_time" as case_checkout
    state "Debounce check (60s)" as debounce
    state "Determine Late/Present status" as late_check
    state "Insert timekeeping record" as insert_tk
    state "Update check_out_time & hours_worked" as update_checkout
    state "Hours < 8?" as short_shift
    state "Auto-create violation (Incomplete Shift)" as auto_violation
    state "Send warning notification" as warn
    state "Return result" as result

    [*] --> gen_qr
    gen_qr --> scan
    scan --> validate_token
    validate_token --> delete_token : Valid
    validate_token --> [*] : Invalid/Expired
    delete_token --> find_latest
    
    find_latest --> case_checkin : No record OR has check_out
    find_latest --> case_checkout : Has record, no check_out
    
    case_checkin --> debounce
    debounce --> late_check
    late_check --> insert_tk
    insert_tk --> result
    
    case_checkout --> debounce
    debounce --> update_checkout
    update_checkout --> short_shift
    short_shift --> auto_violation : Yes
    short_shift --> result : No
    auto_violation --> warn
    warn --> result
    result --> [*]
```

---

## 4. Resignation Workflow

```mermaid
stateDiagram-v2
    state "Employee submits resignation" as submit
    state "Check for existing active request" as check_existing
    state "Reject: Already has pending/approved" as reject_dup
    state "Save request (status: Pending)" as save_req
    state "Notify HR/Admins" as notify_hr
    state "HR reviews request" as hr_review
    state "Decision" as decision
    state "Approve" as approve
    state "Reject" as reject_req
    state "Set employee status → Terminated" as terminate
    state "Set resignation_reason & date" as set_reason
    state "Terminate active contract" as terminate_contract
    state "Update request status" as update_status
    state "Notify employee of decision" as notify_emp
    state "Done" as done

    [*] --> submit
    submit --> check_existing
    check_existing --> reject_dup : Exists
    check_existing --> save_req : None
    reject_dup --> [*]
    save_req --> notify_hr
    notify_hr --> hr_review
    hr_review --> decision
    
    decision --> approve : Approved
    decision --> reject_req : Rejected
    
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

## 5. Notification Delivery Workflow (WebSocket Real-time)

```mermaid
stateDiagram-v2
    state "Frontend connects Socket.io" as connect
    state "Gateway parses access_token from cookie" as parse_cookie
    state "JWT verify token" as verify_jwt
    state "Register socket in userSockets map" as register
    state "Business event occurs (leave/payroll/etc)" as event
    state "Service calls NotificationsService.createNotification()" as create_notif
    state "Check employee preferences" as check_prefs
    state "Skip (preferences disabled)" as skip
    state "INSERT into notification table" as insert_db
    state "Gateway: find socket(s) by userId" as find_socket
    state "Emit 'newNotification' event to socket" as emit
    state "Frontend: socket.on('newNotification')" as receive
    state "Update NotificationContext state" as update_state
    state "Show toast + bell badge update" as show_toast
    state "User clicks notification → markAsRead" as mark_read

    [*] --> connect
    connect --> parse_cookie
    parse_cookie --> verify_jwt
    verify_jwt --> register : Valid
    verify_jwt --> [*] : Invalid
    register --> event
    
    event --> create_notif
    create_notif --> check_prefs
    check_prefs --> skip : Disabled
    check_prefs --> insert_db : Enabled
    skip --> [*]
    insert_db --> find_socket
    find_socket --> emit : Socket found
    find_socket --> [*] : No socket (offline - DB persisted)
    emit --> receive
    receive --> update_state
    update_state --> show_toast
    show_toast --> mark_read
    mark_read --> [*]
```

---

## 6. Daily Attendance Sync Cron (Midnight)

```mermaid
stateDiagram-v2
    state "Cron triggers at midnight" as cron
    state "Query today's timekeeping (hours < 8)" as query_tk
    state "Process each incomplete record" as loop
    state "Already has violation for today?" as has_violation
    state "Skip (already exists)" as skip_v
    state "Create violation (Incomplete Shift)" as create_v
    state "Notify employee" as notify_emp
    state "More records?" as more
    state "CreatedCount > 0?" as any_created
    state "Notify HR/Admins with summary" as notify_hr
    state "Done" as done

    [*] --> cron
    cron --> query_tk
    query_tk --> loop
    
    loop --> has_violation
    has_violation --> skip_v : Yes
    has_violation --> create_v : No
    create_v --> notify_emp
    notify_emp --> more
    skip_v --> more
    
    more --> loop : Yes
    more --> any_created : No
    
    any_created --> notify_hr : Yes
    any_created --> done : No
    notify_hr --> done
    done --> [*]
```
