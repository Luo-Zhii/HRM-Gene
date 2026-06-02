# IEEE-829 Master Test Plan (MTP)

## Document Control

| Field | Value |
|---|---|
| **Document ID** | HRM-Gene-E2E-MTP-001 |
| **Version** | 1.0 |
| **Date** | 2026-05-18 |
| **Author** | QA Team |
| **Status** | Approved |
| **Tool** | Playwright 1.60+ |

---

## 1. Introduction

### 1.1 Purpose
This Master Test Plan defines the strategy, scope, resources, and schedule for black-box end-to-end (E2E) testing of the HRM-Gene system — a comprehensive Human Resource Management platform built with NestJS (backend) and Next.js 14 (frontend).

### 1.2 Scope
Black-box E2E testing of 20 functional modules covering both employee self-service and admin/HR management features. Tests target the integrated full-stack application from the browser.

### 1.3 Objectives
- Verify all user-facing features function correctly in real browser environments
- Validate Role-Based Access Control (RBAC) enforcement across 3 user roles
- Ensure cross-browser compatibility (Chromium + Firefox)
- Detect regressions before production deployment
- Provide IEEE-829 standard documentation for audit compliance

### 1.4 System Overview

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TailwindCSS, i18next |
| Backend | NestJS, TypeORM, PostgreSQL, Redis |
| Auth | JWT with httpOnly cookies |
| Real-time | Socket.IO |
| i18n | English + Vietnamese |

---

## 2. Test Strategy

### 2.1 Testing Approach
- **Black-box**: Tests interact only with the UI — no direct database or API access
- **Page Object Model**: Reusable page objects (`LoginPage`, `Sidebar`, `HeaderBar`) encapsulate UI selectors
- **Fixture-based auth**: Pre-authenticated browser contexts for Admin, HR, and Employee roles
- **Role isolation**: Each test uses exactly one role fixture, ensuring clean RBAC boundary testing

### 2.2 Test Levels

| Level | Description | Count |
|---|---|---|
| **Smoke** | Page loads, critical elements visible | ~80 TC |
| **Functional** | CRUD operations, form interactions | ~110 TC |
| **RBAC** | Access control enforcement per role | ~60 TC |
| **Integration** | Cross-module workflows, navigation | ~42 TC |

### 2.3 Entry Criteria
- Backend server running on `http://localhost:3001`
- Frontend server running on `http://localhost:3000`
- Test database seeded with required fixture data (admin, HR, employee accounts)
- All dependent services (PostgreSQL, Redis) operational

### 2.4 Exit Criteria
- All 292 test cases executed
- Critical/High severity defects resolved
- Test Summary Report approved
- No P0/P1 open defects

### 2.5 Suspension/Resumption
- **Suspend** if: environment unreachable, >30% tests failing from infrastructure issues, data corruption
- **Resume** after: environment restored, data re-seeded, smoke tests pass

---

## 3. Test Environment

### 3.1 Hardware/Software

| Component | Specification |
|---|---|
| OS | Linux (CI) / macOS (dev) |
| Browsers | Chromium (latest), Firefox (latest) |
| Node.js | 20.x+ |
| Playwright | 1.60.x |
| Viewport | 1280×720 (Desktop Chrome/Firefox) |

### 3.2 Test Data
Pre-seeded accounts:

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | Admin@123 |
| HR | hr@example.com | Hr@123 |
| Employee | employee@example.com | Employee@123 |

### 3.3 Configuration
```
Base URL: http://localhost:3000
Timeout: 60s (test), 15s (expect)
Retries: 0 (CI: 2)
Workers: 1 (to avoid shared-state conflicts)
Reporter: HTML + JSON + List
```

---

## 4. Test Organization

### 4.1 Directory Structure

```
e2e/
├── package.json              # Self-contained package, npm test → full run
├── playwright.config.ts      # Browsers, timeout, reporter config
├── fixtures/
│   └── auth.ts               # Admin/HR/Employee authenticated page fixtures
├── pages/
│   └── base.ts               # LoginPage, Sidebar, HeaderBar POMs
├── specs/
│   ├── auth/                  # [M01] 25 TC - Login/Logout/Profile
│   ├── dashboard/             # [M02] 18 TC - Employee Dashboard
│   ├── employee/              # [M03] 20 TC - Employee Directory (Admin)
│   ├── organization/          # [M04] 16 TC - Organization Management
│   ├── permissions/           # [M05] 15 TC - RBAC Permissions
│   ├── contracts/             # [M06] 13 TC - Employment Contracts
│   ├── leave/                 # [M07] 19 TC - Leave Management
│   ├── timekeeping/           # [M08] 11 TC - Timekeeping & Attendance
│   ├── payroll/               # [M09] 18 TC - Payroll Management
│   ├── discipline/            # [M10] 15 TC - Discipline/Violations
│   ├── resignations/          # [M11] 17 TC - Resignation Management
│   ├── kpi/                   # [M12] 18 TC - KPI & Performance
│   ├── announcements/         # [M13] 16 TC - Announcements & News
│   ├── company/               # [M14] 12 TC - Company Profile
│   ├── notifications/         # [M15]  9 TC - Notifications
│   ├── reports/               # [M16]  9 TC - Analysis Reports
│   ├── holidays/              # [M17] 12 TC - Public Holidays
│   ├── directory/             # [M18] 11 TC - Staff Directory
│   ├── i18n/                  # [M19]  8 TC - Language Switching
│   └── settings/              # [M20] 10 TC - System & Payroll Settings
├── docs/                      # IEEE-829 documents
└── e2e-report/                # Generated: HTML + JSON test results
```

### 4.2 Module Summary

| # | Module | Test Cases | Smoke | Functional | RBAC |
|---|--------|-----------|-------|------------|------|
| M01 | Authentication | 25 | 5 | 11 | 9 |
| M02 | Dashboard | 18 | 4 | 10 | 4 |
| M03 | Employee Directory | 20 | 4 | 12 | 4 |
| M04 | Organization | 16 | 4 | 9 | 3 |
| M05 | Permissions | 15 | 4 | 7 | 4 |
| M06 | Contracts | 13 | 3 | 8 | 2 |
| M07 | Leave | 19 | 4 | 11 | 4 |
| M08 | Timekeeping | 11 | 3 | 5 | 3 |
| M09 | Payroll | 18 | 3 | 11 | 4 |
| M10 | Discipline | 15 | 3 | 10 | 2 |
| M11 | Resignations | 17 | 3 | 10 | 4 |
| M12 | KPI | 18 | 4 | 11 | 3 |
| M13 | Announcements | 16 | 3 | 11 | 2 |
| M14 | Company Profile | 12 | 3 | 7 | 2 |
| M15 | Notifications | 9 | 2 | 5 | 2 |
| M16 | Reports | 9 | 2 | 5 | 2 |
| M17 | Holidays | 12 | 3 | 7 | 2 |
| M18 | Directory | 11 | 3 | 7 | 1 |
| M19 | i18n | 8 | 2 | 6 | 0 |
| M20 | Settings | 10 | 3 | 5 | 2 |
| **TOTAL** | | **292** | **65** | **168** | **59** |

---

## 5. Test Identification

### 5.1 Naming Convention
`TC_<MODULE>_<NNN>` — e.g., `TC_AUTH_001`, `TC_LEAVE_012`

### 5.2 Test Grouping
Tests are grouped using Playwright `test.describe()` blocks:
- `[Mxx] Module Name - Role` — module-level grouping
- Each test is independently executable with its own authentication fixture

---

## 6. Defect Management
- Defects discovered during testing are logged as GitHub Issues
- Severity: **P0** (blocker), **P1** (critical), **P2** (major), **P3** (minor), **P4** (cosmetic)
- Failed tests in the HTML report link to the specific assertion failure with screenshot

## 7. Risks and Contingencies

| Risk | Impact | Mitigation |
|---|---|---|
| Test data dependencies | Medium | Tests only verify UI state; no destructive mutations |
| Shared state between tests | Medium | Each fixture creates a fresh browser context |
| i18n string matching | Low | All text selectors use regex alternation (EN\|VI) |
| Network latency in CI | Medium | 60s test timeout, `networkidle` wait strategy |
| Flaky selectors | Medium | Prefer `role` and `text` selectors over CSS classes |

---

## 8. Execution Instructions

### Quick Start
```bash
cd e2e
npm install
npm test
```

### View Report
```bash
npm run report
```

### CI Integration
```bash
cd e2e && npx playwright install --with-deps && npm test
```

---

## 9. Approvals

| Role | Name | Date | Signature |
|---|---|---|---|
| QA Lead | | 2026-05-18 | |
| Project Manager | | 2026-05-18 | |
| Technical Lead | | 2026-05-18 | |
