# Entity Relationship Diagram (ERD) — HRM System

> Auto-generated from the codebase. Last updated: 2026-05-18.

## Full Entity Diagram

```mermaid
classDiagram
    direction TB

    %% ── Core identity ──
    class Employee {
        +int employee_id PK
        +varchar email UK
        +varchar password
        +varchar first_name
        +varchar last_name
        +varchar avatar_url
        +varchar phone_number
        +varchar address
        +text description
        +boolean email_notifications
        +boolean push_notifications
        +boolean task_reminders
        +boolean announcements
        +boolean daily_reports
        +boolean dark_mode
        +boolean two_factor_auth
        +varchar language
        +enum employment_status
        +enum resignation_reason
        +date resignation_date
        +timestamptz deleted_at
    }

    class Department {
        +int department_id PK
        +varchar department_name
    }

    class Position {
        +int position_id PK
        +varchar position_name UK
    }

    class BankInfo {
        +int bank_info_id PK
        +varchar bank_name
        +varchar account_number
        +varchar account_holder_name
    }

    %% ── Employment ──
    class Contract {
        +int contract_id PK
        +varchar contract_number
        +enum contract_type
        +date start_date
        +date end_date
        +enum status
        +decimal salary_rate
        +varchar file_url
    }

    %% ── Leave ──
    class LeaveType {
        +int leave_type_id PK
        +varchar name
        +int default_days_allocated
        +boolean is_paid
    }

    class LeaveBalance {
        +int balance_id PK
        +float remaining_days
    }

    class LeaveRequest {
        +int request_id PK
        +date start_date
        +date end_date
        +text reason
        +varchar status
        +text admin_note
    }

    %% ── Attendance ──
    class TimeKeeping {
        +int timekeeping_id PK
        +timestamp check_in_time
        +timestamp check_out_time
        +date work_date
        +double hours_worked
        +varchar status
        +varchar ip_address
        +varchar qr_payload
    }

    class PublicHoliday {
        +int id PK
        +varchar name
        +date date
        +date end_date
        +varchar type
        +text description
        +boolean is_recurring
        +int year
        +timestamp created_at
    }

    %% ── Payroll ──
    class SalaryConfig {
        +int config_id PK
        +decimal base_salary
        +decimal transport_allowance
        +decimal lunch_allowance
        +decimal responsibility_allowance
        +decimal target_bonus
        +float kpi_bonus_percentage
        +int dependents_count
    }

    class SalaryHistory {
        +int history_id PK
        +decimal old_salary
        +decimal new_salary
        +date change_date
        +text reason
    }

    class SalaryAdjustment {
        +int id PK
        +enum type
        +decimal amount
        +varchar applied_month
        +text reason
        +enum status
        +timestamp created_at
        +int created_by_id
    }

    class PayrollPeriod {
        +int id PK
        +int month
        +int year
        +enum status
        +int standard_work_days
    }

    class Payslip {
        +int payslip_id PK
        +float actual_work_days
        +float ot_hours
        +decimal bonus
        +decimal gross_salary
        +decimal deductions
        +decimal net_salary
        +float kpi_bonus_amount
        +enum status
        +varchar pay_period
        +int created_by_id
    }

    %% ── Discipline ──
    class Violation {
        +int violation_id PK
        +date violation_date
        +varchar violation_type
        +text description
        +decimal deduction_amount
        +enum severity
        +enum status
    }

    %% ── Resignation ──
    class ResignationRequest {
        +int id PK
        +int employee_id FK
        +text reason_text
        +date requested_last_day
        +enum status
        +timestamp created_at
        +timestamp updated_at
    }

    %% ── Communication ──
    class Message {
        +int id PK
        +text content
        +boolean is_read
        +boolean is_deleted
        +timestamp created_at
    }

    class Announcement {
        +int id PK
        +varchar title
        +text content
        +varchar type
        +varchar target_audience
        +varchar priority
        +varchar status
        +json delivery_methods
        +timestamp scheduled_at
        +timestamp created_at
    }

    class Comment {
        +uuid id PK
        +varchar entityType
        +varchar entityId
        +int authorId FK
        +text content
        +timestamp createdAt
    }

    class Notification {
        +int id PK
        +varchar title
        +text message
        +enum type
        +boolean isRead
        +varchar link
        +timestamp createdAt
        +int userId FK
    }

    %% ── KPI ──
    class KpiLibrary {
        +int id PK
        +varchar name
        +text description
        +text calculation_formula
        +enum unit
    }

    class KpiPeriod {
        +int id PK
        +varchar name
        +date start_date
        +date end_date
        +enum status
    }

    class KpiAssignment {
        +int id PK
        +float target_value
        +float actual_value
        +int weight
        +float manager_score
        +enum status
    }

    %% ── Permissions ──
    class Permission {
        +int permission_id PK
        +varchar permission_name
        +varchar module_group
        +varchar method
        +varchar apiPath
    }

    class PositionPermission {
        +int position_id PK,FK
        +int permission_id PK,FK
    }

    %% ── System ──
    class AuditLog {
        +int log_id PK
        +varchar action
        +varchar target_entity
        +int target_id
        +timestamp timestamp
    }

    class CompanySettings {
        +int setting_id PK
        +varchar key UK
        +text value
        +timestamp updated_at
    }

    class CompanyProfile {
        +int id PK
        +varchar company_name
        +varchar tax_id
        +varchar address
        +varchar city
        +varchar state
        +varchar zip
        +varchar country
        +varchar base_currency
        +varchar secondary_currency
        +varchar logo_url
        +timestamp updated_at
    }

    %% ── Relationships ──
    Employee "1" --> "0..1" Department : department
    Employee "1" --> "0..1" Position : position
    Employee "1" --> "0..1" BankInfo : bankInfo (1:1 cascade)

    Department "0..1" --> "1" Employee : manager (manager_id FK)
    Department "1" --> "*" Employee : employees

    Employee "1" --> "*" Contract : contracts
    Contract "*" --> "1" Employee : employee (CASCADE)

    Employee "1" --> "*" LeaveRequest : employee
    LeaveType "1" --> "*" LeaveRequest : leave_type
    Employee "1" --> "*" LeaveRequest : manager_approver

    Employee "1" --> "*" LeaveBalance : employee
    LeaveType "1" --> "*" LeaveBalance : leave_type

    Employee "1" --> "*" TimeKeeping : employee

    Employee "1" --> "0..1" SalaryConfig : employee (1:1 CASCADE)
    Employee "1" --> "*" SalaryHistory : employee
    Employee "1" --> "*" SalaryAdjustment : employee (CASCADE)
    Employee "1" --> "*" Payslip : employee

    PayrollPeriod "1" --> "*" Payslip : payroll_period
    Employee "1" --> "*" Payslip : created_by

    Employee "1" --> "*" Violation : employee (CASCADE)

    Employee "1" --> "*" Message : sender (CASCADE)
    Employee "1" --> "*" Message : receiver (CASCADE)

    Employee "1" --> "*" Comment : author
    Employee "1" --> "*" Notification : user (CASCADE)
    Employee "1" --> "*" AuditLog : user

    Employee "1" --> "*" KpiAssignment : employee
    KpiPeriod "1" --> "*" KpiAssignment : period
    KpiLibrary "1" --> "*" KpiAssignment : kpi_library

    Employee "1" --> "*" KpiLibrary : created_by

    Position "1" --> "*" PositionPermission : position
    Permission "1" --> "*" PositionPermission : permission

    Employee "1" --> "*" ResignationRequest : employee
```

## Entity Summary Table

| # | Entity | Table | PK | Key Columns |
|---|--------|-------|-----|-------------|
| 1 | Employee | employee | employee_id | email(UK), first_name, last_name, employment_status |
| 2 | Department | department | department_id | department_name, manager_id(FK→Employee) |
| 3 | Position | position | position_id | position_name(UK) |
| 4 | BankInfo | bank_info | bank_info_id | bank_name, account_number |
| 5 | Contract | contract | contract_id | contract_type, salary_rate, start/end_date |
| 6 | LeaveType | leave_type | leave_type_id | name, default_days_allocated, is_paid |
| 7 | LeaveBalance | leave_balance | balance_id | remaining_days |
| 8 | LeaveRequest | leave_request | request_id | start/end_date, status, admin_note |
| 9 | TimeKeeping | time_keeping | timekeeping_id | check_in/out_time, hours_worked, status |
| 10 | SalaryConfig | salary_config | config_id | base_salary, allowances, kpi_bonus_percentage, dependents_count |
| 11 | SalaryHistory | salary_history | history_id | old_salary, new_salary, change_date |
| 12 | SalaryAdjustment | salary_adjustment | id | type, amount, applied_month, status |
| 13 | PayrollPeriod | payroll_period | id | month, year, status, standard_work_days |
| 14 | Payslip | payslip | payslip_id | actual_work_days, ot_hours, gross_salary, net_salary |
| 15 | PublicHoliday | public_holiday | id | name, date, type, is_recurring |
| 16 | Violation | violation | violation_id | violation_type, deduction_amount, severity |
| 17 | ResignationRequest | resignation_request | id | reason_text, requested_last_day, status |
| 18 | Message | message | id | content, is_read, sender_id, receiver_id |
| 19 | Announcement | announcements | id | title, content, type, priority |
| 20 | Comment | comments | id(UUID) | entityType, entityId, content |
| 21 | Notification | notification | id | title, message, type, isRead |
| 22 | Permission | permission | permission_id | permission_name, method, apiPath |
| 23 | PositionPermission | position_permission | (position_id, permission_id) | M:N join table |
| 24 | KpiLibrary | kpi_library | id | name, unit |
| 25 | KpiPeriod | kpi_period | id | name, start/end_date, status |
| 26 | KpiAssignment | kpi_assignment | id | target_value, actual_value, weight, status |
| 27 | AuditLog | audit_log | log_id | action, target_entity, timestamp |
| 28 | CompanySettings | company_settings | setting_id | key(UK), value |
| 29 | CompanyProfile | company_profile | id | company_name, base_currency, logo_url |

## Key Relationships

| From | To | Type | FK Column | Notes |
|------|----|------|-----------|-------|
| Employee | Department | M:1 | department_id | Optional |
| Employee | Position | M:1 | position_id | Optional |
| Employee | BankInfo | 1:1 | (bidirectional) | Cascade delete |
| Department | Employee | M:1 | manager_id | Department head |
| Contract | Employee | M:1 | employee_id | Cascade delete |
| LeaveRequest | Employee | M:1 | (employee FK) | Requester |
| LeaveRequest | LeaveType | M:1 | leave_type_id | |
| LeaveRequest | Employee | M:1 | (manager_approver FK) | Approver |
| LeaveBalance | Employee | M:1 | (employee FK) | |
| LeaveBalance | LeaveType | M:1 | leave_type_id | |
| TimeKeeping | Employee | M:1 | (employee FK) | |
| SalaryConfig | Employee | 1:1 | employee_id | Cascade delete |
| SalaryHistory | Employee | M:1 | (employee FK) | |
| SalaryAdjustment | Employee | M:1 | employee_id | Cascade delete |
| Payslip | Employee | M:1 | (employee FK) | |
| Payslip | PayrollPeriod | M:1 | payroll_period_id | |
| Payslip | Employee | M:1 | (created_by FK) | HR who generated |
| Violation | Employee | M:1 | (employee FK) | Cascade delete |
| ResignationRequest | Employee | M:1 | employee_id | |
| Message | Employee | M:1 | sender_id | Cascade delete |
| Message | Employee | M:1 | receiver_id | Cascade delete |
| Comment | Employee | M:1 | authorId | |
| Notification | Employee | M:1 | userId | Cascade delete |
| AuditLog | Employee | M:1 | (user FK) | Nullable |
| KpiAssignment | Employee | M:1 | employee_id | |
| KpiAssignment | KpiPeriod | M:1 | period_id | |
| KpiAssignment | KpiLibrary | M:1 | kpi_library_id | |
| KpiLibrary | Employee | M:1 | (created_by FK) | |
| PositionPermission | Position | M:1 | position_id | Composite PK |
| PositionPermission | Permission | M:1 | permission_id | Composite PK |
