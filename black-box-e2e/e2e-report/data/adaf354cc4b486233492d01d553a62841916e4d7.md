# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: leave/leave.spec.ts >> [M07] Leave - Admin Approval >> TC_LEAVE_015 - Click request → detail view opens
- Location: specs/leave/leave.spec.ts:189:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.lg\\:col-span-2').getByText(/Click on any leave request/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.lg\\:col-span-2').getByText(/Click on any leave request/i)

```

```yaml
- complementary:
  - link "Logo":
    - /url: /dashboard
    - img "Logo"
  - navigation:
    - link "Dashboard":
      - /url: /dashboard
    - link "News Feed":
      - /url: /company-news
    - link "Staff Directory":
      - /url: /directory
    - button "My Workspace"
    - paragraph: Administration
    - button "People"
    - button "Attend & Leave"
    - link "Attendance History":
      - /url: /admin/attendance
    - link "QR Display (Tablet)":
      - /url: /admin/qr-display
    - link "Leave Approvals":
      - /url: /admin/leave-approvals
    - link "Resignation Approvals":
      - /url: /admin/resignations
    - link "Public Holidays":
      - /url: /admin/holidays
    - button "Payroll"
    - button "Performance"
    - button "Communication"
    - button "Analytics"
  - link "System Settings":
    - /url: /admin/settings
  - link "Payroll Settings":
    - /url: /admin/settings/payroll
- banner:
  - textbox "Search pages & features..."
  - button "🇬🇧 EN"
  - button "2"
  - button "System Director S":
    - paragraph: System
    - paragraph: Director
    - text: S
- main:
  - heading "Leave Approvals" [level=1]
  - paragraph: Review and manage employee leave requests
  - paragraph: Total Requests
  - heading "1" [level=3]
  - paragraph: Pending Approval
  - heading "1" [level=3]
  - paragraph: Approved
  - heading "0" [level=3]
  - paragraph: Rejected
  - heading "0" [level=3]
  - text: Search Employee
  - textbox "Search Employee":
    - /placeholder: Name or email...
  - text: From Date
  - textbox "From Date..."
  - text: To Date
  - textbox "To Date..."
  - button "Clear Filters"
  - button "Split View"
  - button "List View"
  - heading "Pending" [level=2]
  - text: "1"
  - button "Pending"
  - button "Approved"
  - button "Rejected"
  - text: H1
  - heading "Hoa Le 1" [level=3]
  - text: Sep 20
  - paragraph: Annual Leave
  - text: Pending
  - heading "Request Details" [level=2]
  - text: Pending
  - heading "Employee Information" [level=3]
  - text: H1
  - paragraph: Full Name
  - paragraph: Hoa Le 1
  - paragraph: Email
  - paragraph: user1@company.com
  - paragraph: Department
  - paragraph: Marketing
  - paragraph: Position
  - paragraph: Intern
  - heading "Leave Information" [level=3]
  - paragraph: Leave Type
  - paragraph: Annual Leave
  - paragraph: Remaining Balance
  - paragraph: 7 days
  - paragraph: From Date
  - paragraph: 9/20/2026
  - paragraph: To Date
  - paragraph: 9/20/2026
  - paragraph: Duration
  - paragraph: 1 day
  - paragraph: Reason for Leave
  - text: TC_010 view test
  - heading "Discussion & Notes" [level=3]
  - paragraph: No messages yet
  - paragraph: Ask a question or leave a note.
  - textbox "Type your reply..."
  - button [disabled]
  - paragraph: Two-Way Channel Active
  - paragraph: Shift + Enter for new line
  - text: "Request ID: #1"
  - button "Reject"
  - button "Approve Leave"
- alert
```

# Test source

```ts
  101 |   test('TC_LEAVE_009 - Tính duration khi chọn start/end date', async ({ employeePage: page }) => {
  102 |     const lp = new LeaveDashboardPage(page);
  103 |     await lp.goto();
  104 |     await lp.waitForPageLoad();
  105 |     await lp.selectLeaveType('Annual Leave');
  106 | 
  107 |     await lp.setStartDate(daysFromNow(14));
  108 |     await lp.setEndDate(daysFromNow(17));
  109 | 
  110 |     // Duration banner should appear with "Calculated Duration"
  111 |     await expect(lp.durationBanner).toBeVisible({ timeout: 5000 });
  112 |     const text = await lp.durationBanner.textContent();
  113 |     expect(text).toMatch(/Calculated Duration/i);
  114 |     expect(text).toMatch(/\d+ days?/i);
  115 |   });
  116 | 
  117 |   test('TC_LEAVE_010 - View detail → mở modal', async ({ employeePage: page }) => {
  118 |     const lp = new LeaveDashboardPage(page);
  119 |     await lp.goto();
  120 |     await lp.waitForPageLoad();
  121 |     await expect(lp.historyTable).toBeVisible({ timeout: 10000 });
  122 | 
  123 |     const count = await lp.getHistoryRowCount();
  124 |     if (count === 0) {
  125 |       // Create a request first so we have something to view
  126 |       const s = daysFromNow(nextDateOffset());
  127 |       const e = new Date(s);
  128 |       await lp.fillLeaveForm('Annual Leave', s, e, 'TC_010 view test');
  129 |       const resp010 = lp.waitForSubmitResponse();
  130 |       await lp.submitRequest();
  131 |       await resp010;
  132 |       await lp.reloadPage();
  133 |     }
  134 |     await lp.viewRequestByIndex(0);
  135 |     await expect(lp.detailModal).toBeVisible({ timeout: 5000 });
  136 |     await lp.closeDetailModal();
  137 |   });
  138 | });
  139 | 
  140 | 
  141 | // ──────────────────────────────────────────────────────────────────────────
  142 | // [M07] Leave – Admin Approval (TC_LEAVE_011 → TC_LEAVE_019)
  143 | // ──────────────────────────────────────────────────────────────────────────
  144 | test.describe('[M07] Leave - Admin Approval', () => {
  145 | 
  146 |   test('TC_LEAVE_011 - Admin → Leave Approvals via sidebar', async ({ adminPage: page }) => {
  147 |     await new Sidebar(page).navigateTo('Leave Approvals');
  148 |     await page.waitForLoadState('domcontentloaded');
  149 |     const ap = new LeaveApprovalPage(page);
  150 |     await expect(ap.pageTitle).toBeVisible({ timeout: 10000 });
  151 |   });
  152 | 
  153 |   test('TC_LEAVE_012 - Pending requests hiển thị', async ({ adminPage: page }) => {
  154 |     const ap = new LeaveApprovalPage(page);
  155 |     await ap.goto();
  156 |     await ap.waitForPageLoad();
  157 |     await expect(ap.pageTitle).toBeVisible({ timeout: 10000 });
  158 |     await expect(ap.pendingTab).toBeVisible();
  159 |   });
  160 | 
  161 |   test('TC_LEAVE_013 - Stats cards hiển thị counts', async ({ adminPage: page }) => {
  162 |     const ap = new LeaveApprovalPage(page);
  163 |     await ap.goto();
  164 |     await ap.waitForPageLoad();
  165 |     await expect(ap.statsTotalCard).toBeVisible({ timeout: 5000 });
  166 |     await expect(ap.statsPendingCard).toBeVisible({ timeout: 5000 });
  167 |     await expect(ap.statsApprovedCard).toBeVisible({ timeout: 5000 });
  168 |     await expect(ap.statsRejectedCard).toBeVisible({ timeout: 5000 });
  169 |     const stats = await ap.getAllStats();
  170 |     expect(Number(stats.total)).toBeGreaterThanOrEqual(0);
  171 |     expect(Number(stats.pending)).toBeGreaterThanOrEqual(0);
  172 |     expect(Number(stats.approved)).toBeGreaterThanOrEqual(0);
  173 |     expect(Number(stats.rejected)).toBeGreaterThanOrEqual(0);
  174 |   });
  175 | 
  176 |   test('TC_LEAVE_014 - Tab filters (Pending / Approved / Rejected)', async ({ adminPage: page }) => {
  177 |     const ap = new LeaveApprovalPage(page);
  178 |     await ap.goto();
  179 |     await ap.waitForPageLoad();
  180 |     await expect(ap.pendingTab).toBeVisible();
  181 |     await expect(ap.approvedTab).toBeVisible();
  182 |     await expect(ap.rejectedTab).toBeVisible();
  183 |     // Click each tab — page should not crash
  184 |     await ap.switchToTab('Approved');
  185 |     await ap.switchToTab('Rejected');
  186 |     await ap.switchToTab('Pending');
  187 |   });
  188 | 
  189 |   test('TC_LEAVE_015 - Click request → detail view opens', async ({ adminPage: page }) => {
  190 |     const ap = new LeaveApprovalPage(page);
  191 |     await ap.goto();
  192 |     await ap.waitForPageLoad();
  193 |     if (await ap.isAccessDenied()) { test.skip(true, 'Access denied'); return; }
  194 | 
  195 |     const count = await ap.getSplitListItemCount();
  196 |     if (count > 0) {
  197 |       await ap.selectRequestByIndex(0);
  198 |       await expect(ap.detailTitle).toBeVisible({ timeout: 5000 });
  199 |     } else {
  200 |       // No requests in pending — verify the page is still functional
> 201 |       await expect(ap.detailPlaceholder).toBeVisible({ timeout: 5000 });
      |                                          ^ Error: expect(locator).toBeVisible() failed
  202 |     }
  203 |   });
  204 | 
  205 |   test('TC_LEAVE_016 - Nút Approve hiển thị trong detail', async ({ adminPage: page }) => {
  206 |     const ap = new LeaveApprovalPage(page);
  207 |     await ap.goto();
  208 |     await ap.waitForPageLoad();
  209 |     if (await ap.isAccessDenied()) { test.skip(true, 'Access denied'); return; }
  210 | 
  211 |     const count = await ap.getSplitListItemCount();
  212 |     if (count > 0) {
  213 |       await ap.selectRequestByIndex(0);
  214 |       // Approve button should be in the footer
  215 |       const btn = ap.detailPanel.locator('button').filter({ hasText: /Approve/i });
  216 |       expect(await btn.count()).toBeGreaterThanOrEqual(0);
  217 |     }
  218 |     // Test passes even if no requests — UI is correct
  219 |   });
  220 | 
  221 |   test('TC_LEAVE_017 - Nút Reject hiển thị trong detail', async ({ adminPage: page }) => {
  222 |     const ap = new LeaveApprovalPage(page);
  223 |     await ap.goto();
  224 |     await ap.waitForPageLoad();
  225 |     if (await ap.isAccessDenied()) { test.skip(true, 'Access denied'); return; }
  226 | 
  227 |     const count = await ap.getSplitListItemCount();
  228 |     if (count > 0) {
  229 |       await ap.selectRequestByIndex(0);
  230 |       const btn = ap.detailPanel.locator('button').filter({ hasText: /Reject|Revoke/i });
  231 |       expect(await btn.count()).toBeGreaterThanOrEqual(0);
  232 |     }
  233 |   });
  234 | 
  235 |   test('TC_LEAVE_018 - Employee bị chặn /admin/leave-approvals', async ({ employeePage: page }) => {
  236 |     await page.goto('/admin/leave-approvals');
  237 |     await page.waitForLoadState('domcontentloaded');
  238 |     await page.waitForTimeout(2000);
  239 | 
  240 |     const denied = await page.getByText(/Access Denied/i).isVisible().catch(() => false);
  241 |     const redirected = !page.url().includes('/admin/leave-approvals');
  242 |     expect(denied || redirected || true).toBeTruthy();
  243 |   });
  244 | 
  245 |   test('TC_LEAVE_019 - Confirmation modal khi Approve/Reject', async ({ adminPage: page }) => {
  246 |     const ap = new LeaveApprovalPage(page);
  247 |     await ap.goto();
  248 |     await ap.waitForPageLoad();
  249 |     if (await ap.isAccessDenied()) { test.skip(true, 'Access denied'); return; }
  250 | 
  251 |     const count = await ap.getSplitListItemCount();
  252 |     if (count === 0) { test.skip(true, 'No pending requests to test modal'); return; }
  253 | 
  254 |     await ap.selectRequestByIndex(0);
  255 |     const approveBtn = ap.detailPanel.locator('button').filter({ hasText: /Approve Leave/i });
  256 |     if ((await approveBtn.count()) > 0 && await approveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  257 |       await approveBtn.click();
  258 |       // Confirmation modal should appear
  259 |       await expect(ap.confirmModal).toBeVisible({ timeout: 5000 });
  260 |       await ap.cancelAction();
  261 |     }
  262 |   });
  263 | });
  264 | 
  265 | 
  266 | // ──────────────────────────────────────────────────────────────────────────
  267 | // [M07] Leave – E2E Full Workflows (TC_LEAVE_020 → TC_LEAVE_023)
  268 | //   Uses { employeePage, adminPage } fixture — both pre-authenticated.
  269 | // ──────────────────────────────────────────────────────────────────────────
  270 | test.describe('[M07] Leave - E2E Workflows', () => {
  271 | 
  272 |   test('TC_LEAVE_020 - Submit → Admin Approve → Trừ ngày phép', async ({ employeePage, adminPage }) => {
  273 |     const lp = new LeaveDashboardPage(employeePage);
  274 |     const ap = new LeaveApprovalPage(adminPage);
  275 | 
  276 |     // Step 1: Employee submits
  277 |     await lp.goto();
  278 |     await lp.waitForPageLoad();
  279 | 
  280 |     const balanceBefore = await lp.getBalanceForType('Annual Leave');
  281 | 
  282 |     const start = daysFromNow(nextDateOffset());
  283 |     const end = new Date(start);
  284 | 
  285 |     await lp.fillLeaveForm('Annual Leave', start, end, 'E2E TC_020');
  286 |     const submitResp = lp.waitForSubmitResponse();
  287 |     await lp.submitRequest();
  288 |     const sr = await submitResp;
  289 |     if (!sr.ok()) { test.skip(true, `Submit 400 — skipped`); return; }
  290 | 
  291 |     // Step 2: Admin approves
  292 |     await ap.goto();
  293 |     await ap.waitForPageLoad();
  294 |     if (await ap.isAccessDenied()) { test.skip(true, 'Admin denied'); return; }
  295 | 
  296 |     await ap.searchEmployee('user1');
  297 |     await adminPage.waitForTimeout(500);
  298 | 
  299 |     const count = await ap.getSplitListItemCount();
  300 |     if (count === 0) { test.skip(true, 'Not found in admin list'); return; }
  301 | 
```