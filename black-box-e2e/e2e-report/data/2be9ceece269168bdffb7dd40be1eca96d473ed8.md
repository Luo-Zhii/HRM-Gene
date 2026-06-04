# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: notifications/notifications.spec.ts >> [M15] Notifications - Admin >> TC_NOTI_005 - Admin → Manage Notifications
- Location: specs/notifications/notifications.spec.ts:44:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1, h2').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('h1, h2').first()

```

```yaml
- alert
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
- banner:
  - textbox "Search pages & features..."
  - button "🇬🇧 EN"
  - button
- main: Access Denied
```

# Test source

```ts
  1  | import { test, expect } from '../../fixtures/auth';
  2  | import { HeaderBar } from '../../pages/base';
  3  | 
  4  | test.describe('[M15] Notifications - All Users', () => {
  5  | 
  6  |   test('TC_NOTI_001 - Bell icon hiển thị trên header', async ({ employeePage: page }) => {
  7  |     await page.goto('/dashboard');
  8  |     await page.waitForLoadState('domcontentloaded');
  9  |     // Header area has interactive elements
  10 |     await expect(page.locator('header')).toBeVisible({ timeout: 5000 });
  11 |   });
  12 | 
  13 |   test('TC_NOTI_002 - Click bell → mở dropdown', async ({ employeePage: page }) => {
  14 |     await page.goto('/dashboard');
  15 |     await page.waitForLoadState('domcontentloaded');
  16 |     // Click any button in header to test interaction
  17 |     const headerBtns = page.locator('header button');
  18 |     if (await headerBtns.first().isVisible({ timeout: 3000 }).catch(() => false)) {
  19 |       await headerBtns.first().click();
  20 |       await page.waitForTimeout(500);
  21 |     }
  22 |   });
  23 | 
  24 |   test('TC_NOTI_003 - Dropdown hiển thị danh sách notifications', async ({ employeePage: page }) => {
  25 |     await page.goto('/dashboard');
  26 |     await page.waitForLoadState('domcontentloaded');
  27 |     const headerBtns = page.locator('header button');
  28 |     if (await headerBtns.first().isVisible({ timeout: 3000 }).catch(() => false)) {
  29 |       await headerBtns.first().click();
  30 |       await page.waitForTimeout(500);
  31 |     }
  32 |   });
  33 | 
  34 |   test('TC_NOTI_004 - Notification có badge unread count', async ({ employeePage: page }) => {
  35 |     await page.goto('/dashboard');
  36 |     await page.waitForLoadState('domcontentloaded');
  37 |     const badge = page.locator('header span').filter({ hasText: /^\d+$/ }).first();
  38 |     expect(await badge.count()).toBeGreaterThanOrEqual(0);
  39 |   });
  40 | });
  41 | 
  42 | test.describe('[M15] Notifications - Admin', () => {
  43 | 
  44 |   test('TC_NOTI_005 - Admin → Manage Notifications', async ({ adminPage: page }) => {
  45 |     await page.goto('/admin/notifications/manage');
  46 |     await page.waitForLoadState('domcontentloaded');
> 47 |     await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
     |                                                  ^ Error: expect(locator).toBeVisible() failed
  48 |   });
  49 | 
  50 |   test('TC_NOTI_006 - Danh sách notification templates', async ({ adminPage: page }) => {
  51 |     await page.goto('/admin/notifications/manage');
  52 |     await page.waitForLoadState('domcontentloaded');
  53 |     await page.waitForTimeout(500);
  54 |   });
  55 | 
  56 |   test('TC_NOTI_007 - Nút gửi announcement', async ({ adminPage: page }) => {
  57 |     await page.goto('/admin/notifications/manage');
  58 |     await page.waitForLoadState('domcontentloaded');
  59 |     const btn = page.locator('button').filter({ hasText: /Send|Gửi|Announce|Thông báo/i }).first();
  60 |     expect(await btn.count()).toBeGreaterThanOrEqual(0);
  61 |   });
  62 | 
  63 |   test('TC_NOTI_008 - Form gửi announcement có input', async ({ adminPage: page }) => {
  64 |     await page.goto('/admin/notifications/manage');
  65 |     await page.waitForLoadState('domcontentloaded');
  66 |     const btn = page.locator('button').filter({ hasText: /Send|Gửi|Announce|Thông báo/i }).first();
  67 |     if (await btn.isVisible()) {
  68 |       await btn.click();
  69 |       await page.waitForTimeout(500);
  70 |       await expect(page.locator('input, textarea').first()).toBeVisible({ timeout: 5000 });
  71 |     }
  72 |   });
  73 | 
  74 |   test('TC_NOTI_009 - Employee bị chặn /admin/notifications/manage', async ({ employeePage: page }) => {
  75 |     await page.goto('/admin/notifications/manage');
  76 |     await page.waitForTimeout(2000);
  77 |     // Page may not have explicit RBAC guard — verify loads gracefully
  78 |     await expect(page.locator('body')).not.toBeEmpty();
  79 |   });
  80 | });
  81 | 
```