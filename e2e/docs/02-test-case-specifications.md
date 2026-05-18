# IEEE-829 Test Case Specifications (TCS)

## Document Control

| Field | Value |
|---|---|
| **Document ID** | HRM-Gene-E2E-TCS-001 |
| **Version** | 1.0 |
| **Date** | 2026-05-18 |
| **Total Test Cases** | 292 |

---

## M01 - Authentication (25 TC)

| ID | Description | Role | Type | Expected Result |
|---|---|---|---|---|
| TC_AUTH_001 | Login với credentials hợp lệ | Unauthenticated | Smoke | Redirect → /dashboard |
| TC_AUTH_002 | Login sai password | Unauthenticated | Functional | Error message displayed |
| TC_AUTH_003 | Login sai email format | Unauthenticated | Functional | Validation error shown |
| TC_AUTH_004 | Login để trống fields | Unauthenticated | Functional | Submit disabled or validation error |
| TC_AUTH_005 | Login page hiển thị đúng layout | Unauthenticated | Smoke | Logo, form, inputs visible |
| TC_AUTH_006 | Logout từ dashboard | Employee | Functional | Redirect → /login, token cleared |
| TC_AUTH_007 | Protected route /dashboard yêu cầu login | Unauthenticated | RBAC | Redirect → /login |
| TC_AUTH_008 | Protected route /admin yêu cầu login | Unauthenticated | RBAC | Redirect → /login |
| TC_AUTH_009 | Token hết hạn → redirect login | Employee | Functional | App handles 401 gracefully |
| TC_AUTH_010 | Admin truy cập /login khi đã đăng nhập | Admin | Functional | Redirect away from login |
| TC_AUTH_011 | Remember me / persist login | Employee | Functional | Session persists after tab close |
| TC_AUTH_012 | Hiển thị user info sau login | Employee | Smoke | Name/role visible in header |
| TC_AUTH_013 | Navigation đến Dashboard sau login | Admin | Smoke | Dashboard page loads fully |
| TC_AUTH_014 | Navigation đến Profile page | Employee | Functional | Profile page accessible |
| TC_AUTH_015 | Header bar hiển thị sau login | Employee | Smoke | Notification bell, user menu, search |
| TC_AUTH_016 | Sidebar hiển thị đúng menu theo role Employee | Employee | RBAC | Employee-only menu items |
| TC_AUTH_017 | Sidebar hiển thị đúng menu theo role Admin | Admin | RBAC | Admin menu with Administration |
| TC_AUTH_018 | Sidebar hiển thị đúng menu theo role HR | HR | RBAC | HR-specific menu items |
| TC_AUTH_019 | Admin register page load | Unauthenticated | Smoke | Registration form visible |
| TC_AUTH_020 | Admin register với valid data | Unauthenticated | Functional | Success message or redirect |
| TC_AUTH_021 | Admin register thiếu fields | Unauthenticated | Functional | Validation error |
| TC_AUTH_022 | Logout → không back lại được dashboard | Employee | RBAC | Back button shows login page |
| TC_AUTH_023 | Search/Search spotlight có trong header | Employee | Smoke | Search input visible |
| TC_AUTH_024 | User dropdown có các option | Employee | Smoke | Profile, Logout options |
| TC_AUTH_025 | Đăng nhập HR → redirect dashboard | HR | Smoke | Dashboard loads successfully |

---

## M02 - Dashboard (18 TC)

| ID | Description | Role | Type | Expected Result |
|---|---|---|---|---|
| TC_DASH_001 | Dashboard page hiển thị | Employee | Smoke | h1/h2 heading visible |
| TC_DASH_002 | Dashboard không có lỗi render | Employee | Smoke | No error text in body |
| TC_DASH_003 | Summary cards hiển thị | Employee | Smoke | Stat cards/panels visible |
| TC_DASH_004 | Welcome message có tên user | Employee | Functional | Employee name in greeting |
| TC_DASH_005 | Company news/announcements widget | Employee | Functional | News section rendered |
| TC_DASH_006 | Quick links / shortcut buttons | Employee | Functional | Action buttons present |
| TC_DASH_007 | Upcoming holidays widget | Employee | Functional | Holiday list section |
| TC_DASH_008 | My pending tasks/approvals widget | Employee | Functional | Pending items displayed |
| TC_DASH_009 | Timekeeping quick status | Employee | Functional | Today's attendance status |
| TC_DASH_010 | Leave balance summary | Employee | Functional | Remaining leave days shown |
| TC_DASH_011 | Admin dashboard page hiển thị | Admin | Smoke | Admin dashboard loads |
| TC_DASH_012 | Admin dashboard có stats overview | Admin | Functional | Employee count, dept count etc. |
| TC_DASH_013 | Admin dashboard có chart widgets | Admin | Functional | Charts/graphs rendered |
| TC_DASH_014 | Recent activities widget | Admin | Functional | Activity feed visible |
| TC_DASH_015 | Click logo/home → về dashboard | Employee | Functional | Navigates back to /dashboard |
| TC_DASH_016 | Dashboard responsive trên mobile | Employee | Functional | Mobile menu toggle visible |
| TC_DASH_017 | Refresh dashboard → data vẫn hiển thị | Employee | Functional | Page reloads without error |
| TC_DASH_018 | Sidebar navigation từ dashboard | Employee | Functional | Click nav items → correct pages |

---

## M03 - Employee Directory (20 TC)

| ID | Description | Role | Type | Expected Result |
|---|---|---|---|---|
| TC_EMP_001 | Admin → Employee Directory | Admin | Smoke | Page loads via sidebar |
| TC_EMP_002 | Bảng danh sách nhân viên | Admin | Smoke | Table/grid of employees |
| TC_EMP_003 | Search theo tên | Admin | Functional | Filtered results |
| TC_EMP_004 | Search theo email | Admin | Functional | Filtered results |
| TC_EMP_005 | Filter theo phòng ban | Admin | Functional | Department filter works |
| TC_EMP_006 | Filter theo chức vụ | Admin | Functional | Position filter works |
| TC_EMP_007 | Filter theo trạng thái | Admin | Functional | Status filter works |
| TC_EMP_008 | Nút Create Employee | Admin | Functional | Opens create form/modal |
| TC_EMP_009 | Form tạo nhân viên có đủ fields | Admin | Functional | All required inputs present |
| TC_EMP_010 | Validation required fields | Admin | Functional | Errors on empty submit |
| TC_EMP_011 | Nút Edit nhân viên | Admin | Functional | Opens edit form with data |
| TC_EMP_012 | Nút Delete nhân viên | Admin | Functional | Delete with confirmation |
| TC_EMP_013 | Employee bị chặn /admin/employees | Employee | RBAC | Access denied or redirected |
| TC_EMP_014 | HR có thể truy cập /admin/employees | HR | RBAC | Page loads for HR |
| TC_EMP_015 | Pagination hoạt động | Admin | Functional | Page navigation works |
| TC_EMP_016 | Sort theo cột | Admin | Functional | Column sorting works |
| TC_EMP_017 | Export danh sách | Admin | Functional | Export button exists |
| TC_EMP_018 | View employee detail | Admin | Functional | Detail view opens |
| TC_EMP_019 | Import nhân viên | Admin | Functional | Import button/functionality |
| TC_EMP_020 | Avatar/ảnh hiển thị | Admin | Smoke | Employee photos render |

---

## M04 - Organization (16 TC)

| ID | Description | Role | Type | Expected Result |
|---|---|---|---|---|
| TC_ORG_001 | Admin → Organization Management | Admin | Smoke | Page loads via sidebar |
| TC_ORG_002 | Sơ đồ tổ chức hiển thị | Admin | Smoke | Org chart/ tree rendered |
| TC_ORG_003 | Danh sách phòng ban | Admin | Smoke | Department list visible |
| TC_ORG_004 | Danh sách chức vụ | Admin | Smoke | Position list visible |
| TC_ORG_005 | Nút Create Department | Admin | Functional | Form opens |
| TC_ORG_006 | Nút Edit Department | Admin | Functional | Edit form with data |
| TC_ORG_007 | Nút Delete Department | Admin | Functional | Delete with confirmation |
| TC_ORG_008 | Nút Create Position | Admin | Functional | Form opens |
| TC_ORG_009 | Nút Edit Position | Admin | Functional | Edit form with data |
| TC_ORG_010 | Nút Delete Position | Admin | Functional | Delete with confirmation |
| TC_ORG_011 | Assign manager cho department | Admin | Functional | Manager select works |
| TC_ORG_012 | Parent department chọn | Admin | Functional | Hierarchy respected |
| TC_ORG_013 | Employee bị chặn /admin/organization | Employee | RBAC | Access denied or redirected |
| TC_ORG_014 | Validation trùng tên phòng ban | Admin | Functional | Error on duplicate name |
| TC_ORG_015 | Validation trùng tên chức vụ | Admin | Functional | Error on duplicate name |
| TC_ORG_016 | Hiển thị số lượng nhân viên mỗi phòng ban | Admin | Functional | Employee count per dept |

---

## M05 - Permissions (15 TC)

| ID | Description | Role | Type | Expected Result |
|---|---|---|---|---|
| TC_PERM_001 | Admin → Permissions page | Admin | Smoke | Page loads via sidebar |
| TC_PERM_002 | Danh sách role/position | Admin | Smoke | Role/position selector visible |
| TC_PERM_003 | Permission groups hiển thị | Admin | Smoke | Module/group labels visible |
| TC_PERM_004 | Accordion permission groups | Admin | Functional | Expandable groups |
| TC_PERM_005 | Method badges (GET/POST/PATCH/DELETE) | Admin | Smoke | HTTP method badges visible |
| TC_PERM_006 | API path hiển thị | Admin | Smoke | Endpoint paths in mono font |
| TC_PERM_007 | Toggle switches | Admin | Functional | Toggle permission on/off |
| TC_PERM_008 | Nút Save Policies | Admin | Functional | Save button present |
| TC_PERM_009 | Employee bị chặn /admin/permissions | Employee | RBAC | Access denied |
| TC_PERM_010 | Employee bị chặn /admin/payroll/config | Employee | RBAC | Access denied |
| TC_PERM_011 | Employee bị chặn /admin/contracts | Employee | RBAC | Access denied |
| TC_PERM_012 | Employee bị chặn /admin/resignations | Employee | RBAC | Access denied |
| TC_PERM_013 | Chuyển role → permission cập nhật | Admin | Functional | UI updates on role switch |
| TC_PERM_014 | Permission count badge | Admin | Functional | Count shown per role |
| TC_PERM_015 | Admin sidebar có Administration | Admin | Smoke | Administration section in sidebar |

---

## M06 - Contracts (13 TC)

| ID | Description | Role | Type | Expected Result |
|---|---|---|---|---|
| TC_CONT_001 | Admin → Contracts page | Admin | Smoke | Page loads via sidebar |
| TC_CONT_002 | Bảng contracts hiển thị | Admin | Smoke | Contract table visible |
| TC_CONT_003 | Nút Create Contract | Admin | Functional | Create button present |
| TC_CONT_004 | Search input | Admin | Functional | Search field visible |
| TC_CONT_005 | Status filter | Admin | Functional | Filter dropdown visible |
| TC_CONT_006 | Employee bị chặn /admin/contracts | Employee | RBAC | Access denied |
| TC_CONT_007 | Create modal → mở form | Admin | Functional | Dialog opens on create |
| TC_CONT_008 | Create form có select + input | Admin | Functional | Form fields present |
| TC_CONT_009 | Nút Edit → mở modal | Admin | Functional | Edit dialog opens |
| TC_CONT_010 | File link mở tab mới | Admin | Functional | Document links target _blank |
| TC_CONT_011 | Filter theo contract type | Admin | Functional | Type filter works |
| TC_CONT_012 | Filter theo contract status | Admin | Functional | Status filter works |
| TC_CONT_013 | Search lọc theo tên | Admin | Functional | Name search filters results |

---

## M07 - Leave (19 TC)

| ID | Description | Role | Type | Expected Result |
|---|---|---|---|---|
| TC_LEAVE_001 | Employee → Leave page | Employee | Smoke | Page loads |
| TC_LEAVE_002 | Balance cards hiển thị | Employee | Smoke | Remaining days visible |
| TC_LEAVE_003 | Select leave type | Employee | Functional | Type dropdown visible |
| TC_LEAVE_004 | Date pickers start/end | Employee | Functional | Date inputs present |
| TC_LEAVE_005 | Textarea reason | Employee | Functional | Reason textarea visible |
| TC_LEAVE_006 | Nút Submit Request | Employee | Functional | Submit button present |
| TC_LEAVE_007 | Nút Clear/Reset | Employee | Functional | Reset button present |
| TC_LEAVE_008 | Bảng lịch sử leave | Employee | Smoke | History table visible |
| TC_LEAVE_009 | Tính duration khi chọn date | Employee | Functional | Duration auto-calculated |
| TC_LEAVE_010 | View detail → mở modal | Employee | Functional | Detail modal opens |
| TC_LEAVE_011 | Admin → Leave Approvals | Admin | Smoke | Page loads |
| TC_LEAVE_012 | Pending requests hiển thị | Admin | Smoke | Pending list visible |
| TC_LEAVE_013 | Stats cards | Admin | Functional | Pending/Approved/Rejected counts |
| TC_LEAVE_014 | Tab filters | Admin | Functional | Status tab filters |
| TC_LEAVE_015 | Click request → detail | Admin | Functional | Detail view opens |
| TC_LEAVE_016 | Nút Approve | Admin | Functional | Approve button present |
| TC_LEAVE_017 | Nút Reject | Admin | Functional | Reject button present |
| TC_LEAVE_018 | Employee bị chặn /admin/leave-approvals | Employee | RBAC | Access denied |
| TC_LEAVE_019 | Confirmation modal khi Approve/Reject | Admin | Functional | Confirmation dialog shown |

---

## M08 - Timekeeping (11 TC)

| ID | Description | Role | Type | Expected Result |
|---|---|---|---|---|
| TC_TIME_001 | Employee → Timekeeping page | Employee | Smoke | Page loads |
| TC_TIME_002 | Timekeeping không lỗi | Employee | Smoke | No error text |
| TC_TIME_003 | Redirect /dashboard/timekeeping → /timekeeping | Employee | Functional | URL redirects correctly |
| TC_TIME_004 | QR section hiển thị | Employee | Functional | QR code area present |
| TC_TIME_005 | Admin → Attendance History | Admin | Smoke | Page loads via sidebar |
| TC_TIME_006 | Bảng attendance hiển thị | Admin | Smoke | Attendance table visible |
| TC_TIME_007 | QR Display page load được | Admin | Smoke | QR display page loads |
| TC_TIME_008 | Có pagination | Admin | Functional | Pagination controls |
| TC_TIME_009 | Có date filter | Admin | Functional | Date input filters |
| TC_TIME_010 | Employee bị chặn /admin/attendance | Employee | RBAC | Access denied |
| TC_TIME_011 | Status badges (Present/Late/Absent) | Admin | Functional | Status indicators |

---

## M09 - Payroll (18 TC)

| ID | Description | Role | Type | Expected Result |
|---|---|---|---|---|
| TC_PAY_001 | Admin → Create Payroll | Admin | Smoke | Page loads via sidebar |
| TC_PAY_002 | Month/Year selectors | Admin | Functional | Date selectors visible |
| TC_PAY_003 | Nút Generate/Calculate | Admin | Functional | Generate button present |
| TC_PAY_004 | Bảng payslip hiển thị | Admin | Smoke | Payslip table visible |
| TC_PAY_005 | Summary cards hiển thị | Admin | Functional | Summary statistics |
| TC_PAY_006 | Employee bị chặn /admin/payroll | Employee | RBAC | Access denied |
| TC_PAY_007 | Admin → Salary Configuration | Admin | Smoke | Page loads via sidebar |
| TC_PAY_008 | Salary config hiển thị danh sách | Admin | Smoke | Config table visible |
| TC_PAY_009 | Nút Edit config | Admin | Functional | Edit button present |
| TC_PAY_010 | Admin → Salary Adjustment | Admin | Smoke | Page loads via sidebar |
| TC_PAY_011 | Adjustments page load được | Admin | Smoke | Heading visible |
| TC_PAY_012 | Có nút Add Adjustment | Admin | Functional | Add button present |
| TC_PAY_013 | Có filter status | Admin | Functional | Status filter dropdown |
| TC_PAY_014 | Admin → Issue Payslips | Admin | Smoke | Page loads via sidebar |
| TC_PAY_015 | Issue page load được | Admin | Smoke | Heading visible |
| TC_PAY_016 | Employee → My Salary | Employee | Smoke | Page loads |
| TC_PAY_017 | Bảng lịch sử payslip | Employee | Smoke | History table visible |
| TC_PAY_018 | Nút View payslip detail | Employee | Functional | Detail view opens |

---

## M10 - Discipline (15 TC)

| ID | Description | Role | Type | Expected Result |
|---|---|---|---|---|
| TC_DISC_001 | Admin → Discipline page | Admin | Smoke | Page loads via sidebar |
| TC_DISC_002 | Bảng violations hiển thị | Admin | Smoke | Violations table visible |
| TC_DISC_003 | Nút Create Violation | Admin | Functional | Create button present |
| TC_DISC_004 | Form tạo violation có select employee | Admin | Functional | Employee selector in form |
| TC_DISC_005 | Form có input violation type | Admin | Functional | Type input visible |
| TC_DISC_006 | Form có chọn severity | Admin | Functional | Severity selector |
| TC_DISC_007 | Filter theo trạng thái | Admin | Functional | Status filter dropdown |
| TC_DISC_008 | Search input | Admin | Functional | Search field visible |
| TC_DISC_009 | Nút Edit violation | Admin | Functional | Edit button present |
| TC_DISC_010 | Nút Delete violation | Admin | Functional | Delete button present |
| TC_DISC_011 | Click row → xem detail | Admin | Functional | Detail view opens |
| TC_DISC_012 | Severity badges hiển thị | Admin | Functional | Low/Normal/High badges |
| TC_DISC_013 | Status badges hiển thị | Admin | Functional | Pending/Resolved badges |
| TC_DISC_014 | Employee bị chặn /admin/discipline | Employee | RBAC | Access denied |
| TC_DISC_015 | Sync attendance button | Admin | Functional | Sync button present |

---

## M11 - Resignations (17 TC)

| ID | Description | Role | Type | Expected Result |
|---|---|---|---|---|
| TC_RESIGN_001 | Admin → Resignation Approvals | Admin | Smoke | Page loads via sidebar |
| TC_RESIGN_002 | Bảng resignations hiển thị | Admin | Smoke | Resignations table visible |
| TC_RESIGN_003 | Filter theo trạng thái | Admin | Functional | Status filter present |
| TC_RESIGN_004 | Nút Approve | Admin | Functional | Approve button present |
| TC_RESIGN_005 | Nút Reject | Admin | Functional | Reject button present |
| TC_RESIGN_006 | Click row → xem detail | Admin | Functional | Detail view opens |
| TC_RESIGN_007 | Hiển thị ngày last day | Admin | Smoke | Last day column visible |
| TC_RESIGN_008 | Hiển thị lý do resign | Admin | Smoke | Reason column visible |
| TC_RESIGN_009 | Employee bị chặn /admin/resignations | Employee | RBAC | Access denied |
| TC_RESIGN_010 | Chọn resignation category | Admin | Functional | Category selector shown |
| TC_RESIGN_011 | Employee → My Resignation | Employee | Smoke | Page loads |
| TC_RESIGN_012 | Form tạo resignation request | Employee | Functional | Form inputs visible |
| TC_RESIGN_013 | Input last working day | Employee | Functional | Date input present |
| TC_RESIGN_014 | Textarea reason | Employee | Functional | Reason textarea visible |
| TC_RESIGN_015 | Nút Submit resignation | Employee | Functional | Submit button present |
| TC_RESIGN_016 | Bảng lịch sử resignation | Employee | Smoke | History table visible |
| TC_RESIGN_017 | Status hiển thị trên request | Employee | Functional | Status on each request |

---

## M12 - KPI (18 TC)

| ID | Description | Role | Type | Expected Result |
|---|---|---|---|---|
| TC_KPI_001 | Admin → KPI Library | Admin | Smoke | Page loads via sidebar |
| TC_KPI_002 | Bảng KPI library hiển thị | Admin | Smoke | KPI template table |
| TC_KPI_003 | Nút Create KPI template | Admin | Functional | Create button present |
| TC_KPI_004 | Form tạo KPI có input name | Admin | Functional | Name input in form |
| TC_KPI_005 | Form có chọn weight/trọng số | Admin | Functional | Weight input present |
| TC_KPI_006 | Nút Edit KPI template | Admin | Functional | Edit button present |
| TC_KPI_007 | Nút Delete KPI template | Admin | Functional | Delete button present |
| TC_KPI_008 | Admin → Team Performance | Admin | Smoke | Page loads via sidebar |
| TC_KPI_009 | Bảng team performance hiển thị | Admin | Smoke | Performance table |
| TC_KPI_010 | Select period/KPI kỳ | Admin | Functional | Period selector |
| TC_KPI_011 | Chức năng grade/chấm điểm | Admin | Functional | Grade/scoring controls |
| TC_KPI_012 | Employee bị chặn /admin/performance/library | Employee | RBAC | Access denied |
| TC_KPI_013 | Employee → My Goals | Employee | Smoke | Page loads |
| TC_KPI_014 | Hiển thị KPI được giao | Employee | Smoke | Assigned KPIs table |
| TC_KPI_015 | Input cập nhật actual value | Employee | Functional | Actual value inputs |
| TC_KPI_016 | Nút Save/Cập nhật KPI | Employee | Functional | Save button present |
| TC_KPI_017 | Hiển thị điểm số/grade | Employee | Functional | Score display |
| TC_KPI_018 | Hiển thị period hiện tại | Employee | Functional | Current period shown |

---

## M13 - Announcements (16 TC)

| ID | Description | Role | Type | Expected Result |
|---|---|---|---|---|
| TC_ANN_001 | Admin → Manage News | Admin | Smoke | Page loads via sidebar |
| TC_ANN_002 | Bảng announcements hiển thị | Admin | Smoke | Announcements table |
| TC_ANN_003 | Nút Create Announcement | Admin | Functional | Create button present |
| TC_ANN_004 | Form có input title | Admin | Functional | Title input in form |
| TC_ANN_005 | Form có textarea content | Admin | Functional | Content textarea |
| TC_ANN_006 | Form có chọn type | Admin | Functional | Type selector |
| TC_ANN_007 | Form có chọn priority | Admin | Functional | Priority selector |
| TC_ANN_008 | Form có chọn target audience | Admin | Functional | Target audience options |
| TC_ANN_009 | Nút Edit announcement | Admin | Functional | Edit button present |
| TC_ANN_010 | Nút Delete announcement | Admin | Functional | Delete button present |
| TC_ANN_011 | Employee bị chặn /admin/announcements | Employee | RBAC | Access denied |
| TC_ANN_012 | Employee → News Feed | Employee | Smoke | Page loads |
| TC_ANN_013 | News feed hiển thị bài viết | Employee | Smoke | Posts rendered |
| TC_ANN_014 | Bài viết có title | Employee | Smoke | Titles visible |
| TC_ANN_015 | Bài viết có content | Employee | Smoke | Content visible |
| TC_ANN_016 | Bài viết có type/priority badge | Employee | Functional | Priority badges shown |

---

## M14 - Company Profile (12 TC)

| ID | Description | Role | Type | Expected Result |
|---|---|---|---|---|
| TC_COMP_001 | Admin → Settings → Company | Admin | Smoke | Page accessible |
| TC_COMP_002 | Company profile page load được | Admin | Smoke | Heading visible |
| TC_COMP_003 | Form có input company name | Admin | Functional | Name input present |
| TC_COMP_004 | Form có input tax ID | Admin | Functional | Tax ID input present |
| TC_COMP_005 | Form có input address | Admin | Functional | Address fields present |
| TC_COMP_006 | Form có input city/state/zip | Admin | Functional | Location fields present |
| TC_COMP_007 | Form có chọn country | Admin | Functional | Country selector |
| TC_COMP_008 | Form có chọn currency | Admin | Functional | Currency selector |
| TC_COMP_009 | Nút Save/Lưu | Admin | Functional | Save button present |
| TC_COMP_010 | Upload logo section | Admin | Functional | File upload present |
| TC_COMP_011 | Employee bị chặn /admin/settings/company | Employee | RBAC | Access denied |
| TC_COMP_012 | Logo preview hiển thị | Admin | Functional | Current logo shown |

---

## M15 - Notifications (9 TC)

| ID | Description | Role | Type | Expected Result |
|---|---|---|---|---|
| TC_NOTI_001 | Bell icon hiển thị trên header | Employee | Smoke | Bell icon visible |
| TC_NOTI_002 | Click bell → mở dropdown | Employee | Functional | Dropdown opens |
| TC_NOTI_003 | Dropdown hiển thị danh sách | Employee | Functional | Notification items shown |
| TC_NOTI_004 | Badge unread count | Employee | Smoke | Unread count badge |
| TC_NOTI_005 | Admin → Manage Notifications | Admin | Smoke | Page loads |
| TC_NOTI_006 | Danh sách notification templates | Admin | Functional | Template list |
| TC_NOTI_007 | Nút gửi announcement | Admin | Functional | Send button present |
| TC_NOTI_008 | Form gửi announcement có input | Admin | Functional | Form fields present |
| TC_NOTI_009 | Employee bị chặn /admin/notifications/manage | Employee | RBAC | Access denied |

---

## M16 - Reports (9 TC)

| ID | Description | Role | Type | Expected Result |
|---|---|---|---|---|
| TC_RPT_001 | Admin → Analysis Report | Admin | Smoke | Page loads via sidebar |
| TC_RPT_002 | Reports page load được | Admin | Smoke | Heading visible |
| TC_RPT_003 | Payroll summary section | Admin | Functional | Payroll data shown |
| TC_RPT_004 | Dashboard metrics hiển thị | Admin | Functional | Metric cards |
| TC_RPT_005 | Month/year selector | Admin | Functional | Date selectors |
| TC_RPT_006 | Charts/Biểu đồ hiển thị | Admin | Functional | Chart/graph elements |
| TC_RPT_007 | Stats cards hiển thị | Admin | Functional | Statistic cards |
| TC_RPT_008 | Số liệu tổng quan | Admin | Functional | Overview numbers |
| TC_RPT_009 | Employee bị chặn /admin/reports | Employee | RBAC | Access denied |

---

## M17 - Holidays (12 TC)

| ID | Description | Role | Type | Expected Result |
|---|---|---|---|---|
| TC_HOL_001 | Employee → Holidays page | Employee | Smoke | Page loads |
| TC_HOL_002 | Danh sách holidays hiển thị | Employee | Smoke | Holidays table |
| TC_HOL_003 | Year selector | Employee | Functional | Year filter dropdown |
| TC_HOL_004 | Hiển thị ngày lễ | Employee | Functional | Holiday dates shown |
| TC_HOL_005 | Upcoming holidays section | Employee | Smoke | Upcoming section |
| TC_HOL_006 | Admin → Holidays page | Admin | Smoke | Page loads |
| TC_HOL_007 | Bảng holidays admin | Admin | Smoke | Admin holidays table |
| TC_HOL_008 | Nút Create Holiday | Admin | Functional | Create button present |
| TC_HOL_009 | Nút Edit holiday | Admin | Functional | Edit button present |
| TC_HOL_010 | Nút Delete holiday | Admin | Functional | Delete button present |
| TC_HOL_011 | Stats holidays hiển thị | Admin | Functional | Holiday statistics |
| TC_HOL_012 | Employee bị chặn /admin/holidays | Employee | RBAC | Access denied |

---

## M18 - Staff Directory (11 TC)

| ID | Description | Role | Type | Expected Result |
|---|---|---|---|---|
| TC_DIR_001 | Directory page load được | Employee | Smoke | Heading visible |
| TC_DIR_002 | Danh sách nhân viên hiển thị | Employee | Smoke | Employee cards/table |
| TC_DIR_003 | Search input | Employee | Functional | Search field visible |
| TC_DIR_004 | Search theo tên | Employee | Functional | Filtered results |
| TC_DIR_005 | Department filter | Employee | Functional | Department selector |
| TC_DIR_006 | Click nhân viên → detail | Employee | Functional | Navigates to /directory/[id] |
| TC_DIR_007 | Detail page hiển thị thông tin | Employee | Smoke | Employee info shown |
| TC_DIR_008 | Detail có tên nhân viên | Employee | Smoke | Name displayed |
| TC_DIR_009 | Detail có department/position | Employee | Functional | Dept & position shown |
| TC_DIR_010 | Detail có email liên hệ | Employee | Functional | Email displayed |
| TC_DIR_011 | Admin → Employee Directory | Admin | Smoke | Page loads via sidebar |

---

## M19 - i18n (8 TC)

| ID | Description | Role | Type | Expected Result |
|---|---|---|---|---|
| TC_I18N_001 | Language switcher trên header | Employee | Smoke | Lang switcher visible |
| TC_I18N_002 | Switch sang tiếng Việt | Employee | Functional | UI changes to VI |
| TC_I18N_003 | Switch sang tiếng Anh | Employee | Functional | UI changes to EN |
| TC_I18N_004 | Sidebar labels đổi ngôn ngữ | Employee | Functional | Sidebar translates |
| TC_I18N_005 | Switch lại về English sau khi đổi | Employee | Functional | Toggle back works |
| TC_I18N_006 | Page content không rỗng | Employee | Smoke | Content renders |
| TC_I18N_007 | Login page có language switcher | Unauthenticated | Smoke | Lang switcher on login |
| TC_I18N_008 | Switch ngôn ngữ trên login page | Unauthenticated | Functional | Login page translates |

---

## M20 - Settings (10 TC)

| ID | Description | Role | Type | Expected Result |
|---|---|---|---|---|
| TC_SET_001 | Admin → System Settings | Admin | Smoke | Page loads via sidebar |
| TC_SET_002 | System settings page load | Admin | Smoke | Heading visible |
| TC_SET_003 | Tab/section settings | Admin | Functional | Settings sections |
| TC_SET_004 | Nút Save settings | Admin | Functional | Save button present |
| TC_SET_005 | Admin → Payroll Settings | Admin | Smoke | Page loads via sidebar |
| TC_SET_006 | Payroll settings page load | Admin | Smoke | Heading visible |
| TC_SET_007 | Form payroll settings có input | Admin | Functional | Form inputs present |
| TC_SET_008 | Nút Save payroll settings | Admin | Functional | Save button present |
| TC_SET_009 | Employee bị chặn /admin/settings | Employee | RBAC | Access denied |
| TC_SET_010 | Employee bị chặn /admin/settings/payroll | Employee | RBAC | Access denied |
