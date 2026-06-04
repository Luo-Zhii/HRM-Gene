# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: organization/organization.spec.ts >> [M04] Organization - Admin >> TC_ORG_004 - Có section Positions
- Location: specs/organization/organization.spec.ts:24:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/Position|Vị trí|Chức vụ/i).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText(/Position|Vị trí|Chức vụ/i).first()

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
- main:
  - paragraph: Loading...
```

# Test source

```ts
  1   | import { test, expect } from '../../fixtures/auth';
  2   | import { Sidebar } from '../../pages/base';
  3   | 
  4   | test.describe('[M04] Organization - Admin', () => {
  5   | 
  6   |   test('TC_ORG_001 - Admin → Organization page', async ({ adminPage: page }) => {
  7   |     await new Sidebar(page).navigateTo('Organizational');
  8   |     await page.waitForTimeout(1000);
  9   |   });
  10  | 
  11  |   test('TC_ORG_002 - Hiển thị stats cards', async ({ adminPage: page }) => {
  12  |     await page.goto('/admin/organization');
  13  |     await page.waitForLoadState('domcontentloaded');
  14  |     const cards = page.locator('[class*="stat"], [class*="card"]');
  15  |     expect(await cards.count()).toBeGreaterThanOrEqual(0);
  16  |   });
  17  | 
  18  |   test('TC_ORG_003 - Có section Departments', async ({ adminPage: page }) => {
  19  |     await page.goto('/admin/organization');
  20  |     await page.waitForLoadState('domcontentloaded');
  21  |     await expect(page.getByText(/Department|Phòng ban/i).first()).toBeVisible({ timeout: 10000 });
  22  |   });
  23  | 
  24  |   test('TC_ORG_004 - Có section Positions', async ({ adminPage: page }) => {
  25  |     await page.goto('/admin/organization');
  26  |     await page.waitForLoadState('domcontentloaded');
> 27  |     await expect(page.getByText(/Position|Vị trí|Chức vụ/i).first()).toBeVisible({ timeout: 10000 });
      |                                                                      ^ Error: expect(locator).toBeVisible() failed
  28  |   });
  29  | 
  30  |   test('TC_ORG_005 - Employee bị chặn /admin/organization', async ({ employeePage: page }) => {
  31  |     await page.goto('/admin/organization');
  32  |     await page.waitForTimeout(2000);
  33  |     const denied = await page.getByText(/Access Denied|Truy cập bị từ chối/i).isVisible().catch(() => false);
  34  |     const redirected = !page.url().includes('/admin/organization');
  35  |     expect(denied || redirected).toBeTruthy();
  36  |   });
  37  | 
  38  |   test('TC_ORG_006 - Có input tạo department', async ({ adminPage: page }) => {
  39  |     await page.goto('/admin/organization');
  40  |     await page.waitForLoadState('domcontentloaded');
  41  |     await expect(page.getByPlaceholder(/Department|Phòng ban/i).first()).toBeVisible({ timeout: 10000 });
  42  |   });
  43  | 
  44  |   test('TC_ORG_007 - Có nút Add department', async ({ adminPage: page }) => {
  45  |     await page.goto('/admin/organization');
  46  |     await page.waitForLoadState('domcontentloaded');
  47  |     const btns = page.locator('button').filter({ hasText: /Add|Thêm/ });
  48  |     expect(await btns.count()).toBeGreaterThanOrEqual(1);
  49  |   });
  50  | 
  51  |   test('TC_ORG_008 - Department cards render', async ({ adminPage: page }) => {
  52  |     await page.goto('/admin/organization');
  53  |     await page.waitForLoadState('domcontentloaded');
  54  |     const cards = page.locator('[class*="border"][class*="rounded"]');
  55  |     expect(await cards.count()).toBeGreaterThan(0);
  56  |   });
  57  | 
  58  |   test('TC_ORG_009 - Hover department card → hiện actions', async ({ adminPage: page }) => {
  59  |     await page.goto('/admin/organization');
  60  |     await page.waitForLoadState('domcontentloaded');
  61  |     const card = page.locator('[class*="border"][class*="rounded"], .group').first();
  62  |     if (await card.isVisible()) {
  63  |       await card.hover();
  64  |       await page.waitForTimeout(300);
  65  |     }
  66  |   });
  67  | 
  68  |   test('TC_ORG_010 - Edit department → có manager select', async ({ adminPage: page }) => {
  69  |     await page.goto('/admin/organization');
  70  |     await page.waitForLoadState('domcontentloaded');
  71  |     const editBtn = page.locator('button').filter({ hasText: /Edit|Sửa/ }).first();
  72  |     if (await editBtn.isVisible()) {
  73  |       await editBtn.click();
  74  |       await page.waitForTimeout(500);
  75  |       await expect(page.locator('[role="dialog"], .fixed.inset-0').first()).toBeVisible();
  76  |     }
  77  |   });
  78  | 
  79  |   test('TC_ORG_011 - Delete department → confirm dialog', async ({ adminPage: page }) => {
  80  |     await page.goto('/admin/organization');
  81  |     await page.waitForLoadState('domcontentloaded');
  82  |     page.on('dialog', async (d) => { await d.dismiss(); });
  83  |     const delBtn = page.locator('button').filter({ hasText: /Delete|Xóa/ }).first();
  84  |     if (await delBtn.isVisible()) await delBtn.click();
  85  |   });
  86  | 
  87  |   test('TC_ORG_012 - Có input tạo position', async ({ adminPage: page }) => {
  88  |     await page.goto('/admin/organization');
  89  |     await page.waitForLoadState('domcontentloaded');
  90  |     const inputs = page.locator('input[placeholder]');
  91  |     expect(await inputs.count()).toBeGreaterThanOrEqual(1);
  92  |   });
  93  | 
  94  |   test('TC_ORG_013 - Có nút Delete position', async ({ adminPage: page }) => {
  95  |     await page.goto('/admin/organization');
  96  |     await page.waitForLoadState('domcontentloaded');
  97  |     const btns = page.locator('button').filter({ hasText: /Delete|Xóa/ });
  98  |     expect(await btns.count()).toBeGreaterThanOrEqual(0);
  99  |   });
  100 | 
  101 |   test('TC_ORG_014 - Có section Assign nhân viên', async ({ adminPage: page }) => {
  102 |     await page.goto('/admin/organization');
  103 |     await page.waitForLoadState('domcontentloaded');
  104 |     const btns = page.locator('button').filter({ hasText: /Assign|Phân công|Transfer|Chuyển/i });
  105 |     expect(await btns.count()).toBeGreaterThanOrEqual(0);
  106 |   });
  107 | 
  108 |   test('TC_ORG_015 - Stats có tổng departments', async ({ adminPage: page }) => {
  109 |     await page.goto('/admin/organization');
  110 |     await page.waitForLoadState('domcontentloaded');
  111 |     await expect(page.locator('body')).not.toContainText('Error');
  112 |   });
  113 | 
  114 |   test('TC_ORG_016 - Stats có tổng nhân viên', async ({ adminPage: page }) => {
  115 |     await page.goto('/admin/organization');
  116 |     await page.waitForLoadState('domcontentloaded');
  117 |     await expect(page.locator('body')).not.toContainText('Loading');
  118 |   });
  119 | });
  120 | 
```