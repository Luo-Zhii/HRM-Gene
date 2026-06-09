# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: organization/organization.spec.ts >> [M04] Organization - Admin >> TC_ORG_005 - Employee bị chặn /admin/organization
- Location: specs/organization/organization.spec.ts:30:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - link "Logo" [ref=e5] [cursor=pointer]:
        - /url: /dashboard
        - img "Logo" [ref=e6]
      - navigation [ref=e7]:
        - link "Dashboard" [ref=e8] [cursor=pointer]:
          - /url: /dashboard
          - img [ref=e9]
          - generic [ref=e14]: Dashboard
        - link "News Feed" [ref=e15] [cursor=pointer]:
          - /url: /company-news
          - img [ref=e16]
          - generic [ref=e19]: News Feed
        - link "Staff Directory" [ref=e20] [cursor=pointer]:
          - /url: /directory
          - img [ref=e21]
          - generic [ref=e26]: Staff Directory
        - button "My Workspace" [ref=e29] [cursor=pointer]:
          - generic [ref=e30]:
            - img [ref=e32]
            - generic [ref=e35]: My Workspace
          - img [ref=e36]
        - paragraph [ref=e39]: Administration
        - generic [ref=e40]:
          - button "People" [ref=e41] [cursor=pointer]:
            - generic [ref=e42]:
              - img [ref=e44]
              - generic [ref=e48]: People
            - img [ref=e49]
          - generic [ref=e51]:
            - link "Employee Directory" [ref=e52] [cursor=pointer]:
              - /url: /admin/employees
              - img [ref=e53]
              - generic [ref=e57]: Employee Directory
            - link "Employment Contract" [ref=e58] [cursor=pointer]:
              - /url: /admin/contracts
              - img [ref=e59]
              - generic [ref=e63]: Employment Contract
            - link "Organizational Management" [ref=e64] [cursor=pointer]:
              - /url: /admin/organization
              - img [ref=e65]
              - generic [ref=e69]: Organizational Management
            - link "Discipline" [ref=e70] [cursor=pointer]:
              - /url: /admin/discipline
              - img [ref=e71]
              - generic [ref=e73]: Discipline
        - button "Attend & Leave" [ref=e75] [cursor=pointer]:
          - generic [ref=e76]:
            - img [ref=e78]
            - generic [ref=e80]: Attend & Leave
          - img [ref=e81]
        - button "Performance" [ref=e84] [cursor=pointer]:
          - generic [ref=e85]:
            - img [ref=e87]
            - generic [ref=e90]: Performance
          - img [ref=e91]
        - button "Communication" [ref=e94] [cursor=pointer]:
          - generic [ref=e95]:
            - img [ref=e97]
            - generic [ref=e103]: Communication
          - img [ref=e104]
        - button "Analytics" [ref=e107] [cursor=pointer]:
          - generic [ref=e108]:
            - img [ref=e110]
            - generic [ref=e113]: Analytics
          - img [ref=e114]
      - link "System Settings" [ref=e117] [cursor=pointer]:
        - /url: /admin/settings
        - img [ref=e118]
        - generic [ref=e129]: System Settings
    - generic [ref=e130]:
      - banner [ref=e131]:
        - generic [ref=e132]:
          - generic [ref=e134]:
            - img [ref=e135]
            - textbox "Search pages & features..." [ref=e138]
          - button "🇬🇧 EN" [ref=e139] [cursor=pointer]:
            - img [ref=e140]
            - generic [ref=e143]: 🇬🇧
            - generic [ref=e144]: EN
          - button "3" [ref=e146] [cursor=pointer]:
            - img [ref=e147]
            - generic [ref=e150]: "3"
          - button "Giang Staff G" [ref=e152] [cursor=pointer]:
            - generic [ref=e153]:
              - paragraph [ref=e154]: Giang
              - paragraph [ref=e155]: Staff
            - generic [ref=e157]: G
            - img [ref=e158]
      - main [ref=e160]:
        - generic [ref=e163]:
          - heading "Organizational Management" [level=1] [ref=e165]
          - generic [ref=e166]: Failed to fetch data
          - generic [ref=e167]:
            - generic [ref=e168]:
              - img [ref=e170]
              - generic [ref=e174]: "0"
              - generic [ref=e175]: Total Departments
            - generic [ref=e176]:
              - img [ref=e178]
              - generic [ref=e183]: "0"
              - generic [ref=e184]: Total Employments
            - generic [ref=e185]:
              - img [ref=e187]
              - generic "0 VND" [ref=e190]
              - generic [ref=e191]: Total Budgets
          - generic [ref=e192]:
            - generic [ref=e193]:
              - generic [ref=e194]:
                - heading "Departments" [level=2] [ref=e195]
                - paragraph [ref=e196]: Manage corporate structure and budgets
              - generic [ref=e197]:
                - textbox "New department name..." [ref=e198]
                - button "Add" [ref=e199] [cursor=pointer]:
                  - img [ref=e200]
                  - text: Add
            - generic [ref=e201]: No departments found. Create one above.
          - generic [ref=e202]:
            - generic [ref=e203]:
              - generic [ref=e204]:
                - heading "Positions" [level=2] [ref=e205]
                - paragraph [ref=e206]: Manage job titles across the company
              - generic [ref=e207]:
                - textbox "New position name..." [ref=e208]
                - button "Add" [ref=e209] [cursor=pointer]:
                  - img [ref=e210]
                  - text: Add
            - generic [ref=e211]: No positions found. Create one above.
            - paragraph [ref=e213]: "Total Active Positions: 0"
  - alert [ref=e214]
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
  27  |     await expect(page.getByText(/Position|Vị trí|Chức vụ/i).first()).toBeVisible({ timeout: 10000 });
  28  |   });
  29  | 
  30  |   test('TC_ORG_005 - Employee bị chặn /admin/organization', async ({ employeePage: page }) => {
  31  |     await page.goto('/admin/organization');
  32  |     await page.waitForTimeout(2000);
  33  |     const denied = await page.getByText(/Access Denied|Truy cập bị từ chối/i).isVisible().catch(() => false);
  34  |     const redirected = !page.url().includes('/admin/organization');
> 35  |     expect(denied || redirected).toBeTruthy();
      |                                  ^ Error: expect(received).toBeTruthy()
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