# HRM-Gene E2E Tests

Black-box end-to-end testing for the HRM-Gene system using Playwright.

## Quick Start

```bash
cd e2e
npm install
npx playwright install --with-deps
npm test
```

## View Report

```bash
npm run report
```

## Structure

```
e2e/
├── package.json              # npm test → full run
├── playwright.config.ts      # Chromium + Firefox, HTML reporter
├── fixtures/auth.ts          # Admin/HR/Employee authenticated pages
├── pages/base.ts             # LoginPage, Sidebar, HeaderBar POMs
├── specs/                    # 20 modules, 292 test cases
│   ├── auth/                 # M01 - Authentication (25 TC)
│   ├── dashboard/            # M02 - Dashboard (18 TC)
│   ├── employee/             # M03 - Employee Directory (20 TC)
│   ├── organization/         # M04 - Organization Management (16 TC)
│   ├── permissions/          # M05 - Permissions RBAC (15 TC)
│   ├── contracts/            # M06 - Employment Contracts (13 TC)
│   ├── leave/                # M07 - Leave Management (19 TC)
│   ├── timekeeping/          # M08 - Timekeeping (11 TC)
│   ├── payroll/              # M09 - Payroll (18 TC)
│   ├── discipline/           # M10 - Discipline/Violations (15 TC)
│   ├── resignations/         # M11 - Resignations (17 TC)
│   ├── kpi/                  # M12 - KPI Performance (18 TC)
│   ├── announcements/        # M13 - Announcements (16 TC)
│   ├── company/              # M14 - Company Profile (12 TC)
│   ├── notifications/        # M15 - Notifications (9 TC)
│   ├── reports/              # M16 - Analysis Reports (9 TC)
│   ├── holidays/             # M17 - Public Holidays (12 TC)
│   ├── directory/            # M18 - Staff Directory (11 TC)
│   ├── i18n/                 # M19 - Language Switching (8 TC)
│   └── settings/             # M20 - System Settings (10 TC)
├── docs/                     # IEEE-829 documentation
│   ├── 01-master-test-plan.md
│   ├── 02-test-case-specifications.md
│   ├── 03-test-procedure-specification.md
│   └── 04-test-summary-report.md
└── e2e-report/               # Generated HTML + JSON results
```

## Scripts

| Command | Description |
|---|---|
| `npm test` | Run all tests (Chromium + Firefox) |
| `npm run test:headed` | Run with visible browser |
| `npm run test:chromium` | Chromium only |
| `npm run test:firefox` | Firefox only |
| `npm run test:smoke` | Smoke tests only |
| `npm run test:debug` | Debug mode with Playwright Inspector |
| `npm run report` | Open HTML report |

## Running Specific Tests

```bash
# Single module
npx playwright test --config=playwright.config.ts specs/leave/

# Single file
npx playwright test --config=playwright.config.ts specs/auth/auth.spec.ts

# Single test
npx playwright test --config=playwright.config.ts -g "TC_LEAVE_001"
```

## Test Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | Admin@123 |
| HR | hr@example.com | Hr@123 |
| Employee | employee@example.com | Employee@123 |

## Requirements

- Frontend running on http://localhost:3000
- Backend running on http://localhost:3001
- PostgreSQL + Redis operational
- Test accounts seeded in database

## Design

- **Black-box**: No direct database/API access — UI-only testing
- **Page Object Model**: `LoginPage`, `Sidebar`, `HeaderBar` encapsulate selectors
- **Authenticated fixtures**: `adminPage`, `hrPage`, `employeePage` provide pre-logged-in browser contexts
- **i18n-aware**: Text selectors use regex alternation matching both English and Vietnamese labels
- **Non-destructive**: Tests verify UI state without creating or mutating data
