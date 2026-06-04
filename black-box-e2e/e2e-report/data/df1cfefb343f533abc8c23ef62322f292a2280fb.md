# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: leave/leave.spec.ts >> [M07] Leave - Employee >> TC_LEAVE_006 - Nút Submit Request
- Location: specs/leave/leave.spec.ts:36:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button').filter({ hasText: /Submit|Gửi/i }).first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByRole('button').filter({ hasText: /Submit|Gửi/i }).first()

```

```yaml
- alert
- heading "Login to Account" [level=1]
- paragraph: Please enter your email and password to continue
- text: "Email address:"
- textbox "Email address:":
  - /placeholder: admin@example.com
- text: Password
- textbox "Password":
  - /placeholder: ••••••
- checkbox "Remember Password"
- text: Remember Password
- button "Sign In"
- text: admin@example.com / admin
```

# Test source

```ts
  1   | import { test, expect } from '../../fixtures/auth';
  2   | import { Sidebar } from '../../pages/base';
  3   | 
  4   | test.describe('[M07] Leave - Employee', () => {
  5   | 
  6   |   test('TC_LEAVE_001 - Employee → Leave page', async ({ employeePage: page }) => {
  7   |     await page.goto('/dashboard/leave');
  8   |     await page.waitForLoadState('domcontentloaded');
  9   |     await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  10  |   });
  11  | 
  12  |   test('TC_LEAVE_002 - Hiển thị balance cards', async ({ employeePage: page }) => {
  13  |     await page.goto('/dashboard/leave');
  14  |     await page.waitForLoadState('domcontentloaded');
  15  |     await expect(page.getByText(/Balance|Remaining|Còn lại|ngày/i).first()).toBeVisible({ timeout: 10000 });
  16  |   });
  17  | 
  18  |   test('TC_LEAVE_003 - Select leave type', async ({ employeePage: page }) => {
  19  |     await page.goto('/dashboard/leave');
  20  |     await page.waitForLoadState('domcontentloaded');
  21  |     await expect(page.locator('select').first()).toBeVisible({ timeout: 10000 });
  22  |   });
  23  | 
  24  |   test('TC_LEAVE_004 - Date pickers start/end', async ({ employeePage: page }) => {
  25  |     await page.goto('/dashboard/leave');
  26  |     await page.waitForLoadState('domcontentloaded');
  27  |     await page.waitForTimeout(500);
  28  |   });
  29  | 
  30  |   test('TC_LEAVE_005 - Textarea reason', async ({ employeePage: page }) => {
  31  |     await page.goto('/dashboard/leave');
  32  |     await page.waitForLoadState('domcontentloaded');
  33  |     await expect(page.locator('textarea').first()).toBeVisible({ timeout: 10000 });
  34  |   });
  35  | 
  36  |   test('TC_LEAVE_006 - Nút Submit Request', async ({ employeePage: page }) => {
  37  |     await page.goto('/dashboard/leave');
  38  |     await page.waitForLoadState('domcontentloaded');
> 39  |     await expect(page.getByRole('button').filter({ hasText: /Submit|Gửi/i }).first()).toBeVisible();
      |                                                                                       ^ Error: expect(locator).toBeVisible() failed
  40  |   });
  41  | 
  42  |   test('TC_LEAVE_007 - Nút Clear/Reset', async ({ employeePage: page }) => {
  43  |     await page.goto('/dashboard/leave');
  44  |     await page.waitForLoadState('domcontentloaded');
  45  |     await expect(page.getByRole('button').filter({ hasText: /Clear|Xóa|Reset/i }).first()).toBeVisible();
  46  |   });
  47  | 
  48  |   test('TC_LEAVE_008 - Bảng lịch sử leave', async ({ employeePage: page }) => {
  49  |     await page.goto('/dashboard/leave');
  50  |     await page.waitForLoadState('domcontentloaded');
  51  |     await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 10000 });
  52  |   });
  53  | 
  54  |   test('TC_LEAVE_009 - Tính duration khi chọn date', async ({ employeePage: page }) => {
  55  |     await page.goto('/dashboard/leave');
  56  |     await page.waitForLoadState('domcontentloaded');
  57  |     await page.waitForTimeout(500);
  58  |   });
  59  | 
  60  |   test('TC_LEAVE_010 - View detail → mở modal', async ({ employeePage: page }) => {
  61  |     await page.goto('/dashboard/leave');
  62  |     await page.waitForLoadState('domcontentloaded');
  63  |     const btn = page.locator('button').filter({ hasText: /View|Xem/ }).first();
  64  |     if (await btn.isVisible()) {
  65  |       await btn.click();
  66  |       await page.waitForTimeout(500);
  67  |     }
  68  |   });
  69  | });
  70  | 
  71  | test.describe('[M07] Leave - Admin Approval', () => {
  72  | 
  73  |   test('TC_LEAVE_011 - Admin → Leave Approvals', async ({ adminPage: page }) => {
  74  |     await new Sidebar(page).navigateTo('Leave Approvals');
  75  |     await page.waitForTimeout(1000);
  76  |   });
  77  | 
  78  |   test('TC_LEAVE_012 - Hiển thị pending requests', async ({ adminPage: page }) => {
  79  |     await page.goto('/admin/leave-approvals');
  80  |     await page.waitForLoadState('domcontentloaded');
  81  |     await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  82  |   });
  83  | 
  84  |   test('TC_LEAVE_013 - Stats cards (Total/Pending/Approved/Rejected)', async ({ adminPage: page }) => {
  85  |     await page.goto('/admin/leave-approvals');
  86  |     await page.waitForLoadState('domcontentloaded');
  87  |     await expect(page.getByText(/Pending|Chờ/i).first()).toBeVisible({ timeout: 10000 });
  88  |   });
  89  | 
  90  |   test('TC_LEAVE_014 - Tab filters', async ({ adminPage: page }) => {
  91  |     await page.goto('/admin/leave-approvals');
  92  |     await page.waitForLoadState('domcontentloaded');
  93  |     await expect(page.getByRole('button').filter({ hasText: /Pending|Chờ|Approved|Đã duyệt|Rejected|Từ chối/i }).first()).toBeVisible();
  94  |   });
  95  | 
  96  |   test('TC_LEAVE_015 - Click request → hiện detail', async ({ adminPage: page }) => {
  97  |     await page.goto('/admin/leave-approvals');
  98  |     await page.waitForLoadState('domcontentloaded');
  99  |     const row = page.locator('table tbody tr, [role="row"]').first();
  100 |     if (await row.isVisible()) {
  101 |       await row.click();
  102 |       await page.waitForTimeout(500);
  103 |     }
  104 |   });
  105 | 
  106 |   test('TC_LEAVE_016 - Nút Approve', async ({ adminPage: page }) => {
  107 |     await page.goto('/admin/leave-approvals');
  108 |     await page.waitForLoadState('domcontentloaded');
  109 |     const btn = page.locator('button').filter({ hasText: /Approve|Duyệt/i }).first();
  110 |     expect(await btn.count()).toBeGreaterThanOrEqual(0);
  111 |   });
  112 | 
  113 |   test('TC_LEAVE_017 - Nút Reject', async ({ adminPage: page }) => {
  114 |     await page.goto('/admin/leave-approvals');
  115 |     await page.waitForLoadState('domcontentloaded');
  116 |     const btn = page.locator('button').filter({ hasText: /Reject|Từ chối/i }).first();
  117 |     expect(await btn.count()).toBeGreaterThanOrEqual(0);
  118 |   });
  119 | 
  120 |   test('TC_LEAVE_018 - Employee bị chặn /admin/leave-approvals', async ({ employeePage: page }) => {
  121 |     await page.goto('/admin/leave-approvals');
  122 |     await page.waitForTimeout(3000);
  123 |     // Leave approvals has canManageLeave guard — Intern only has GET:/api/admin/leave
  124 |     // Guard checks permission strings so Intern may or may not be blocked
  125 |     const denied = await page.getByText(/Access Denied|Truy cập bị từ chối/i).isVisible().catch(() => false);
  126 |     const redirected = !page.url().includes('/admin/leave-approvals');
  127 |     // If neither denied nor redirected, verify page still loads without crash
  128 |     if (!denied && !redirected) {
  129 |       await expect(page.locator('body')).not.toBeEmpty();
  130 |     }
  131 |     expect(denied || redirected || true).toBeTruthy();
  132 |   });
  133 | 
  134 |   test('TC_LEAVE_019 - Confirmation modal khi Approve/Reject', async ({ adminPage: page }) => {
  135 |     await page.goto('/admin/leave-approvals');
  136 |     await page.waitForLoadState('domcontentloaded');
  137 |     const btn = page.locator('button').filter({ hasText: /Approve|Duyệt/i }).first();
  138 |     if (await btn.isVisible()) {
  139 |       await btn.click();
```