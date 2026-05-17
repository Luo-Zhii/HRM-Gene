# HRM-DashStack System Integration & Business Logic Audit Report

**Date**: 2026-05-16  
**Scope**: Cross-module integration audit (Leave, Timekeeping, Payroll, Resignation/Access)  
**Architecture**: NestJS backend (TypeORM + PostgreSQL) + Next.js frontend

---

## 1. Leave to Payroll Integration

### 1.1 Current Status

**What happens today:**

- `LeaveType` entity has **no `is_paid` field**. Leave types are free-text names (e.g. "Annual", "Sick", "Unpaid"). Whether a leave type is paid or unpaid is not modeled in the database.
- When payroll is generated (`PayrollService.generatePayslips`), approved leave requests are fetched and their days are **unconditionally added to work days** — every approved leave is treated as paid leave.
- The leave approval flow (`LeaveService.approveLeaveRequest`) deducts days from `LeaveBalance` but does **not** notify the payroll module or trigger recalculation.
- There is no `@nestjs/event-emitter` dependency in the project. All cross-module communication happens via direct TypeORM repository injection (i.e., each service reads raw data from other modules' tables).

```typescript
// payroll.service.ts, generatePayslips() — ALL approved leave added as work days:
for (const leave of ctx.approvedLeaves) {
  const days = /* calendar days between start and end */;
  workDaysMap[empId] = (workDaysMap[empId] || 0) + days; // No distinction paid vs unpaid
}
```

- **Retroactive cancellation**: The `approveLeaveRequest` method has a **dead code** path for restoring leave balance on rejection of a previously-approved request. The condition `if (newStatus === "Rejected" && leaveRequest.status === "Approved")` is checked **after** `leaveRequest.status` has already been overwritten to `"Rejected"`, so balance restoration never executes. Cancelling an approved leave does not restore the leave balance, nor does it trigger any payroll recalculation.

### 1.2 Enterprise Gap

| Risk | Severity | Impact |
|------|----------|--------|
| Unpaid leave is paid as if it were regular attendance | **High** | Employees on unpaid leave receive full salary; payroll liability is inflated |
| No `is_paid` flag on `LeaveType` | **High** | Impossible to differentiate leave types programmatically |
| Retroactive leave cancellation does not restore balance | **Medium** | Employee loses leave days permanently on cancelled leave |
| No payroll recalculation on leave status change | **Medium** | Payroll becomes stale if leave is approved/rejected after generation |
| Leave vs. payroll work-day calculation mismatch | **Low** | Leave uses weekday-only; payroll uses calendar days |

### 1.3 Actionable Fix

1. **Add `is_paid` column to `LeaveType` entity**:
   - Migration: `ALTER TABLE leave_type ADD COLUMN is_paid BOOLEAN DEFAULT TRUE;`
   - Update `LeaveType` entity to include `is_paid: boolean`.
   - Update seed data to mark "Unpaid Leave" / "Nghỉ không lương" as `is_paid = false`.

2. **Fix the dead-code balance restoration bug in `LeaveService.approveLeaveRequest`**:
   - Capture `previousStatus = leaveRequest.status` **before** overwriting it with `newStatus`.
   - Use `previousStatus` in the condition: `if (newStatus === "Rejected" && previousStatus === "Approved")`.

3. **Install `@nestjs/event-emitter` and emit events on leave state changes**:
   ```bash
   npm install @nestjs/event-emitter
   ```
   - Add `EventEmitterModule.forRoot()` to `AppModule`.
   - In `LeaveService.approveLeaveRequest`, emit:
     - `leave.approved` — payload: `{ requestId, employeeId, leaveTypeId, startDate, endDate, isPaid }`
     - `leave.rejected` — payload: `{ requestId, employeeId, leaveTypeId, startDate, endDate, previousStatus }`
   - In `PayrollService`, add an `@OnEvent('leave.approved')` listener that checks if a payroll period exists for that month and, if so, recalculates the affected employee's payslip via `generateSinglePayslip`.

4. **Update `PayrollService.generatePayslips` to handle unpaid leave**:
   - When fetching approved leaves, join with `leave_type` and filter: paid leaves → add to work days (current behavior); unpaid leaves → add to absent days (deduction applied via existing `unpaidAbsentDeduction` logic).

---

## 2. Timekeeping to Payroll Integration

### 2.1 Current Status

**What happens today:**

- The `TimeKeeping` entity tracks check-in/out with statuses: `"Present"`, `"Late"`, `"Half-day"`. There is no `"Absent"` status set by the service — the payroll module aggregates it synthetically by counting days with no record or `Half-day` as 0.5 absent.
- **Late check-ins**: Marked as `"Late"` in the `status` field, but payroll treats `"Late"` identically to `"Present"` (counts as 1 full work day). There is **no late penalty calculation** anywhere.
- **Missing check-outs**: If an employee checks in but never checks out, `hours_worked` stays at `0` and `check_out_time` is null. The midnight cron (`ViolationsService.handleDailyAttendanceSync`) finds records with `hours_worked < 8` and creates a `Violation` with `deduction_amount: "0.00"`. The violation exists for tracking but has **zero monetary impact on payroll**.
- **Incomplete shifts** (4–8 hours): Creates a `Violation` at check-out time. Same issue — deduction is always `"0.00"`.
- **Penalty adjustments** require manual admin creation via `POST /payroll/adjustments` with `type: "Penalty"`. There is no automated conversion from violations to payroll deductions.

```typescript
// payroll.service.ts, generatePayslips() — Late = Present for payroll purposes:
if (status === "Present" || status === "Late") {
  workDaysMap[empId] = (workDaysMap[empId] || 0) + 1;
}
```

- **No-show detection**: There is no logic to detect employees who neither checked in nor had approved leave. The system relies on timekeeping records existing — if none exist, the employee gets full `standard_work_days` by default.

### 2.2 Enterprise Gap

| Risk | Severity | Impact |
|------|----------|--------|
| Late arrivals have zero payroll consequence | **High** | No deterrent for tardiness; payroll cost inflated |
| Missing check-outs produce violations with no monetary deduction | **High** | Attendance violations exist but don't affect salary |
| Employees with no timekeeping records get full pay | **High** | Default-to-full-days means absences without leave requests are paid |
| Violation-to-payroll pipeline is entirely manual | **Medium** | HR must manually create penalty adjustments for each violation |
| No overtime approval/rejection flow | **Medium** | `ot_hours` field exists in `Payslip` but is always 0 — no logic populates it |

### 2.3 Actionable Fix

1. **Add late penalty configuration to `CompanySettings`**:
   - Key: `late_penalty_per_occurrence` (monetary amount deducted per late check-in).
   - Key: `late_penalty_threshold_minutes` (grace period in minutes; default 0).
   - Key: `absent_penalty_rate` (multiplier on `salaryPerDay`, e.g. 1.0 = 1 day's pay deducted per absent day).

2. **Implement automated penalty calculation in `PayrollService.generatePayslips`**:
   - Count late check-ins for each employee in the payroll month.
   - Apply: `lateDeduction = lateCount * latePenaltyPerOccurrence`.
   - For no-show days (no timekeeping record AND no approved leave): count as absent, apply salary deduction.

3. **Wire violations to payroll automatically**:
   - In `PayrollService.calculateAndSavePayslip`, query approved `Violation` records for the employee in the payroll month.
   - Sum `deduction_amount` from violations and add to the deductions total.
   - Add a cron job or event listener that auto-approves violations when a payroll period is locked.

4. **Add overtime tracking**:
   - If `hours_worked > 8` on any day, calculate overtime as `(hours_worked - 8) * overtimeRate * hourlyRate`.
   - Populate the existing `ot_hours` field in `Payslip`.

5. **Handle default-to-full-days gap**:
   - In `generatePayslips`, if an employee has zero timekeeping records for the entire month and zero approved leave days, set `actual_work_days = 0` (not `standard_work_days`).

---

## 3. Resignation to Payroll & Access Control

### 3.1 Current Status

**What happens today:**

- **Resignation approval** (`ResignationsService.updateStatus` with `APPROVED`):
  - Sets `employee.employment_status = TERMINATED`
  - Sets `resignation_reason` and `resignation_date`
  - Executes raw SQL: `UPDATE contract SET status = 'Terminated', end_date = ? WHERE employee_id = ? AND status = 'Active'`
  - Sends notification to employee

- **Access revocation**: JWT tokens are **stateless with no blacklist**. The only access control is:
  - `JwtStrategy.validate()` checks if `employment_status === 'Terminated'` AND today's date is past `resignation_date` → throws `UnauthorizedException`.
  - **Gap**: If the token was issued before termination, it remains valid until its natural expiry (1 hour). A terminated employee can continue accessing the system for up to 60 minutes after termination.
  - **Gap**: If `resignation_date` is set to a future date (e.g., 2-week notice period), the employee retains full access until that date passes.
  - The `SUSPENDED` enum value exists on `Employee.employment_status` but is **never used** — no service, guard, or controller references it.

- **Final salary proration**: 
  - Payroll generation (`generatePayslips`) does **not filter by `employment_status`**. A terminated employee will still have a payslip generated for months after their termination date.
  - There is **no proration logic** for partial-month employment. The system uses `actual_work_days` from timekeeping, but if an employee is terminated mid-month, there's no automatic final-settlement calculation (no unused leave payout, no severance, no pro-rated 13th-month salary).

- **No offboarding audit trail**: The `AuditLog` entity exists but is **never written to** by any service.

### 3.2 Enterprise Gap

| Risk | Severity | Impact |
|------|----------|--------|
| JWT remains valid for up to 1 hour after termination | **High** | Terminated employees retain system access post-termination |
| No token blacklist/invalidation mechanism | **High** | No way to force-logout a user before token expiry |
| Future-dated resignation has no access restriction | **Medium** | Employee has full access during notice period — no reduced privileges |
| `SUSPENDED` status is dead code | **Medium** | No ability to temporarily lock an account without full termination |
| Payroll generated for terminated employees | **Medium** | Overpayment risk; manual correction required |
| No final-settlement calculation | **High** | Missing statutory requirement: prorated salary, unused leave payout, severance |
| No audit log for offboarding actions | **Low** | No traceability for compliance/legal purposes |

### 3.3 Actionable Fix

1. **Implement JWT token invalidation**:
   - Add a `token_version` column to `Employee` (integer, default 0).
   - Include `token_version` in the JWT payload.
   - In `JwtStrategy.validate()`, compare the token's version with the current `employee.token_version`. Reject if mismatch.
   - On termination/suspension, increment `employee.token_version` — immediately invalidates all existing tokens.
   - On logout, increment `employee.token_version` — invalidates all sessions (optional: use a separate `token_version` per session if single-device logout is needed).

2. **Activate `SUSPENDED` status**:
   - Add a `PATCH /employees/:id/suspend` and `PATCH /employees/:id/unsuspend` endpoint.
   - Update `JwtStrategy.validate()` and `AuthService.validateUser()` to reject suspended employees with `UnauthorizedException('Your account has been temporarily suspended.')`.

3. **Add notice-period access restrictions**:
   - When `resignation_date` is in the future, restrict sensitive endpoints (payroll generation, salary config changes, employee CRUD) for that user.
   - This can be implemented in `EndpointPermissionsGuard` by checking if the user has a pending resignation and the endpoint is in a "restricted during notice" list.

4. **Filter terminated employees from payroll generation**:
   - In `PayrollService.generatePayslips`, add a filter: `WHERE employment_status = 'Active'` OR `(employment_status = 'Terminated' AND resignation_date >= start_of_payroll_month)`.

5. **Implement final-settlement calculation**:
   - New service method: `PayrollService.generateFinalSettlement(employeeId, terminationDate)`.
   - Calculate:
     - **Prorated base salary** for days worked in the final month: `(baseSalary / standardDays) * actualDaysWorked`.
     - **Unused leave payout**: `(baseSalary / standardDays) * remainingLeaveDays` from all leave balances.
     - **Severance pay** (if applicable per labor law): typically `0.5 * monthlySalary * yearsOfService`.
     - **Outstanding deductions**: recover advances, equipment cost, etc.
   - Generate a final `Payslip` with `status: "FinalSettlement"` and a `pay_period` labeled accordingly.

6. **Enable audit logging for offboarding**:
   - In `EmployeesService.update` and `ResignationsService.updateStatus`, when `employment_status` changes, create an `AuditLog` entry: `{ action: "EMPLOYEE_TERMINATED", target_entity: "Employee", target_id: employeeId }`.

---

## 4. Data Concurrency — Mid-Month Salary Modification

### 4.1 Current Status

**What happens today:**

- `SalaryConfig` is stored as a single row per employee. Updates are direct upserts via `PATCH /payroll/config/:employeeId` (calls `PayrollService.updateSalaryConfig`).
- When `SalaryConfig` is updated, **no `SalaryHistory` record is created** (only contract changes in `ContractsService` create history).
- Payroll generation (`generatePayslips`) reads `SalaryConfig` at generation time. If payroll was already generated for the month and HR then changes `base_salary`, the existing payslip is **not automatically recalculated** — unless HR manually regenerates.
- The `PayrollPeriod.status` enum has values `Draft/Locked/Paid` but the `status` is **never transitioned** by any service method. It's set to `Draft` on creation and never changed to `Locked` or `Paid`. This means there is no period-locking mechanism to prevent changes.
- TypeORM's `synchronize: true` is enabled in production, meaning schema changes apply automatically — but this also means no migration-based locking.
- There are **no database transactions** wrapping the payroll generation loop. If generation fails halfway through 200 employees, the first 100 payslips are already committed.

### 4.2 Enterprise Gap

| Risk | Severity | Impact |
|------|----------|--------|
| No `SalaryHistory` creation on direct config updates | **Medium** | No audit trail for HR-driven salary changes |
| No payroll period locking | **High** | Salary config can change after payroll is finalized; no source of truth |
| No automatic recalculation on config change | **Medium** | Stale payslips if HR changes salary post-generation |
| No transaction wrapping during bulk payslip generation | **High** | Partial generation on failure = inconsistent payroll state |
| No optimistic locking or version columns | **Medium** | Concurrent updates to same SalaryConfig/Payslip silently overwrite |

### 4.3 Actionable Fix

1. **Add `SalaryHistory` creation to `PayrollService.updateSalaryConfig`**:
   - Before upserting, read the current `SalaryConfig`.
   - If `base_salary` changed, create a `SalaryHistory` record: `{ employee, old_salary, new_salary, change_date: today, reason }`.
   - Expose the reason field in the DTO: `UpdateSalaryConfigDto` should include an optional `change_reason`.

2. **Implement payroll period locking**:
   - Add a `POST /payroll/period/:id/lock` endpoint that transitions `PayrollPeriod.status` from `Draft` → `Locked`.
   - When a period is `Locked`, all `PATCH /payroll/config/:employeeId` calls must check: if there's a locked period covering any month, reject with `BadRequestException('Cannot modify salary config while payroll period is locked.')`.
   - Similarly, `PATCH /payroll/adjustments/:id` should reject changes to adjustments in a locked period.
   - `POST /payroll/generate` should refuse to regenerate for a locked period.

3. **Add auto-recalculation on salary change during an active period**:
   - In `updateSalaryConfig`, check if a `Draft` payroll period exists for the current month.
   - If yes, automatically call `generateSinglePayslip(employeeId, month, year)` to update the payslip.
   - Alternatively, emit a `salary.changed` event (with `@nestjs/event-emitter`) and let `PayrollService` handle it via `@OnEvent`.

4. **Wrap bulk generation in a database transaction**:
   ```typescript
   async generatePayslips(month, year, createdByUserId?) {
     return this.dataSource.transaction(async (manager) => {
       // ... all queries and calculations using manager.getRepository(...)
       // All-or-nothing: if any step fails, entire generation rolls back
     });
   }
   ```

5. **Add `@VersionColumn` to `SalaryConfig` and `Payslip` entities**:
   - TypeORM's `@VersionColumn()` provides automatic optimistic locking.
   - If two concurrent requests try to update the same row, the second one gets a `OptimisticLockVersionMismatchError` — catch it and return a conflict response.

---

## 5. Cross-Cutting Concerns

### 5.1 Missing `@nestjs/event-emitter`

The entire codebase uses **direct repository injection** for cross-module communication. This creates tight coupling:

- `PayrollModule` imports TypeORM features for `LeaveRequest`, `TimeKeeping`, `Employee`, `Contract`, `SalaryConfig`, etc. — it directly queries tables owned by other modules.
- `LeaveModule` directly injects `NotificationsService`.
- `ViolationsModule` directly queries `TimeKeeping`.

**Recommendation**: Install `@nestjs/event-emitter` and migrate cross-module triggers to events. This decouples modules and enables the reactive workflows described above (leave approval → payroll recalculation, salary change → payslip update, termination → token invalidation).

### 5.2 No `PayrollPeriod` Lifecycle Management

The `PayrollPeriod` entity has `Draft → Locked → Paid` statuses but zero code transitions between them. `Paid` status appears to exist only in the enum. Without period lifecycle management, there is no way to prevent changes after payroll is finalized.

### 5.3 Legacy `runPayroll` vs. Modern `generatePayslips`

Two payroll calculation paths coexist:
- `runPayroll`: Uses `Contract.salary_rate`, no allowances, no KPI, no PIT, no insurance. Legacy `pay_period` string format.
- `generatePayslips`: Full calculation with allowances, KPI bonus, PIT, insurance, etc.

Both are exposed as endpoints. This creates confusion and potential data inconsistency. Deprecate `runPayroll` and eventually remove it.

### 5.4 No Public Holiday Awareness

The `PublicHoliday` entity exists but is **never queried** by leave or payroll calculations. Leave day counting and payroll work-day calculations should exclude public holidays from the standard work day count.

### 5.5 No `dependents_count` in Entity Schema

`PayrollService.calculateAndSavePayslip` accesses `(salaryConfig as any).dependents_count` for PIT dependent exemption, but the field is not defined in the `SalaryConfig` entity. It likely exists in the database but is missing from TypeORM.

---

## 6. Prioritized Action Plan

| Priority | Action | Modules Affected | Effort |
|----------|--------|-----------------|--------|
| **P0** | Add `is_paid` to LeaveType + unpaid leave deduction in payroll | Leave, Payroll | Medium |
| **P0** | Fix dead-code balance restoration on leave rejection | Leave | Small |
| **P0** | Filter terminated employees from payroll generation | Payroll | Small |
| **P0** | Implement JWT token invalidation (token_version) | Auth, Employees | Medium |
| **P0** | Wrap payroll generation in DB transactions | Payroll | Medium |
| **P1** | Install `@nestjs/event-emitter` + wire leave→payroll events | All | Large |
| **P1** | Implement payroll period locking (Draft→Locked→Paid) | Payroll | Medium |
| **P1** | Auto-create SalaryHistory on config update | Payroll, Contracts | Small |
| **P1** | Auto-apply violation deductions to payroll | Violations, Payroll | Medium |
| **P1** | Late penalty calculation from timekeeping | Timekeeping, Payroll | Medium |
| **P2** | Final settlement (proration + leave payout + severance) | Payroll, Leave | Large |
| **P2** | Public holiday exclusion from work-day counts | Leave, Payroll | Small |
| **P2** | Activate SUSPENDED status + notice-period restrictions | Employees, Auth | Medium |
| **P2** | Add optimistic locking (@VersionColumn) | Payroll, Employees | Small |
| **P3** | Deprecate legacy `runPayroll` | Payroll | Small |
| **P3** | Enable audit logging for offboarding | Employees, Resignations | Small |
| **P3** | Add `dependents_count` to SalaryConfig entity | Payroll | Small |
