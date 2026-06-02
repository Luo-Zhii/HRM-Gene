# IEEE-829 Test Procedure Specification (TPS)

## Document Control

| Field | Value |
|---|---|
| **Document ID** | HRM-Gene-E2E-TPS-001 |
| **Version** | 1.0 |
| **Date** | 2026-05-18 |
| **Tool** | Playwright 1.60+ |

---

## 1. Purpose

This document defines the step-by-step procedures for executing the HRM-Gene E2E test suite, including environment setup, test execution, and result collection.

---

## 2. Prerequisites

### 2.1 System Requirements
- Node.js 20.x or later
- npm 9.x or later
- Git (for cloning repository)
- At least 2GB free disk space (for browser binaries)
- Display server (for headed mode) or headless support

### 2.2 Application Services
Ensure the following are running before test execution:

| Service | Default URL | Verification |
|---|---|---|
| Frontend (Next.js) | http://localhost:3000 | `curl http://localhost:3000` returns 200 |
| Backend (NestJS) | http://localhost:3001 | `curl http://localhost:3001/api/health` returns 200 |
| PostgreSQL | localhost:5432 | Backend can connect |
| Redis | localhost:6379 | Backend can connect |

### 2.3 Test Data Seeding
The following test accounts must exist in the database:

```
Admin:    admin@example.com    / Admin@123
HR:       hr@example.com       / Hr@123
Employee: employee@example.com / Employee@123
```

---

## 3. Setup Procedure

### Step 1: Navigate to e2e directory
```bash
cd /path/to/HRM-Gene/e2e
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Install Playwright browsers
```bash
npx playwright install --with-deps chromium firefox
```

### Step 4: Verify installation
```bash
npx playwright --version
# Expected: Version 1.60.x or later
```

### Step 5: Verify configuration
```bash
npx playwright test --list
# Lists all 292 test cases across 20 modules
```

---

## 4. Execution Procedure

### 4.1 Full Suite Execution (Headless)

```bash
npm test
```

This runs all 292 tests across Chromium and Firefox (584 total executions) with:
- HTML report output to `e2e-report/`
- JSON results to `e2e-report/results.json`
- Console list reporter for real-time progress

**Estimated duration**: 15-25 minutes (varies by hardware)

### 4.2 Single Browser Execution

```bash
# Chromium only
npm run test:chromium

# Firefox only
npm run test:firefox
```

### 4.3 Headed Mode (Visual Debugging)

```bash
npm run test:headed
```

Browsers will open visibly. Useful for debugging test failures.

### 4.4 Running Specific Modules

```bash
# Single module
npx playwright test --config=playwright.config.ts specs/auth/

# Single test file
npx playwright test --config=playwright.config.ts specs/leave/leave.spec.ts

# Single test case by name
npx playwright test --config=playwright.config.ts -g "TC_LEAVE_001"
```

### 4.5 Debug Mode

```bash
npm run test:debug
```

Opens Playwright Inspector for step-through debugging.

### 4.6 CI Execution

```bash
# Install browsers with system dependencies
npx playwright install --with-deps chromium firefox

# Run tests (fail on first error for faster CI feedback)
npx playwright test --config=playwright.config.ts --max-failures=10
```

---

## 5. Result Collection

### 5.1 HTML Report
After execution, open the HTML report:
```bash
npm run report
```

The report opens in the default browser showing:
- Pass/fail/skip summary per browser
- Individual test duration and status
- Screenshots of failure states
- Trace files for debugging
- Filterable by module, status, browser

### 5.2 JSON Results
Machine-readable results at `e2e-report/results.json`:
```json
{
  "suites": [...],
  "specs": [...],
  "stats": {
    "total": 292,
    "expected": 292,
    "unexpected": 0,
    "flaky": 0,
    "skipped": 0,
    "duration": 1234567
  }
}
```

### 5.3 Console Output
Real-time results during execution:
```
[chromium] › specs/auth/auth.spec.ts:6:3 › [M01] Auth - Login › TC_AUTH_001 - Login valid
  ✓ TC_AUTH_001 - Login valid (3.2s)
[chromium] › specs/auth/auth.spec.ts:10:3 › [M01] Auth - Login › TC_AUTH_002 - Login invalid
  ✓ TC_AUTH_002 - Login invalid (2.8s)
```

---

## 6. Failure Analysis Procedure

### 6.1 Triage Steps
1. Open the HTML report: `npm run report`
2. Click on the failed test to see the error message
3. Review the screenshot attached to the failure
4. Check if the failure is:
   - **Environment issue**: Backend/frontend not running, database stale
   - **Selector issue**: UI changed, i18n key changed
   - **Timing issue**: Page too slow, timeout insufficient
   - **Genuine regression**: Feature broken

### 6.2 Common Issues and Resolutions

| Symptom | Likely Cause | Resolution |
|---|---|---|
| `page.goto` timeout | Frontend not running | Start frontend: `cd frontend && npm run dev` |
| `Network request failed` | Backend not running | Start backend: `cd backend && npm run start:dev` |
| `Access Denied` for admin | Test credentials wrong | Verify seed data in database |
| `locator.isVisible` timeout | i18n key mismatch | Test supports both EN/VI regex patterns |
| `waitForLoadState` timeout | Slow page load | Increase timeout in playwright.config.ts |

### 6.3 Re-running Failed Tests
```bash
# Using Playwright's built-in retry mechanism
npx playwright test --config=playwright.config.ts --last-failed

# With retries enabled
npx playwright test --config=playwright.config.ts --retries=2
```

---

## 7. Test Completion Criteria

### 7.1 Pass Criteria
- All 292 test cases executed
- ≥ 95% pass rate (allowing for pre-existing known issues)
- 0 P0 (blocker) defects open
- ≤ 2 P1 (critical) defects open

### 7.2 Fail Criteria
- ≥ 10% test failure rate from new regressions
- Any P0 defect preventing core user flows
- Environment unstable (intermittent failures in >20% of tests)

---

## 8. Test Artifacts

After execution, the following artifacts are available:

| Artifact | Path | Format |
|---|---|---|
| HTML Report | `e2e-report/index.html` | Interactive HTML |
| JSON Results | `e2e-report/results.json` | JSON |
| Failure Screenshots | `e2e-report/data/` | PNG |
| Trace Files | `e2e-report/data/` | Playwright Trace |
| Console Logs | Embedded in report | Text |

---

## 9. Cleanup

No cleanup is required after test execution. Tests are non-destructive:
- No test creates or mutates data that affects other tests
- Each test uses isolated browser contexts
- No database writes are performed through the UI (tests verify UI state only)

To remove test artifacts:
```bash
rm -rf e2e-report/
rm -rf test-results/
```

---

## Appendix A: Quick Reference Card

```bash
# Setup (first time only)
cd e2e && npm install && npx playwright install --with-deps

# Run all tests
npm test

# View report
npm run report

# Run specific module in headed mode
npx playwright test --config=playwright.config.ts specs/leave/ --headed

# Debug a failing test
npx playwright test --config=playwright.config.ts -g "TC_LEAVE_001" --debug

# Re-run failures
npx playwright test --config=playwright.config.ts --last-failed
```
