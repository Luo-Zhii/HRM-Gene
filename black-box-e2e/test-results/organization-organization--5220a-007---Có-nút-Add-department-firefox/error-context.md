# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: organization/organization.spec.ts >> [M04] Organization - Admin >> TC_ORG_007 - Có nút Add department
- Location: specs/organization/organization.spec.ts:44:7

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 1
Received:    0
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - link "Logo" [ref=e6] [cursor=pointer]:
        - /url: /dashboard
        - img "Logo" [ref=e7]
      - navigation [ref=e8]:
        - link "Dashboard" [ref=e9] [cursor=pointer]:
          - /url: /dashboard
          - img [ref=e10]
          - generic [ref=e15]: Dashboard
        - link "News Feed" [ref=e16] [cursor=pointer]:
          - /url: /company-news
          - img [ref=e17]
          - generic [ref=e22]: News Feed
        - link "Staff Directory" [ref=e23] [cursor=pointer]:
          - /url: /directory
          - img [ref=e24]
          - generic [ref=e29]: Staff Directory
        - button "My Workspace" [ref=e32] [cursor=pointer]:
          - generic [ref=e33]:
            - img [ref=e35]
            - generic [ref=e38]: My Workspace
          - img [ref=e39]
        - paragraph [ref=e42]: Administration
        - generic [ref=e43]:
          - button "People" [ref=e44] [cursor=pointer]:
            - generic [ref=e45]:
              - img [ref=e47]
              - generic [ref=e51]: People
            - img [ref=e52]
          - generic [ref=e54]:
            - link "Employee Directory" [ref=e55] [cursor=pointer]:
              - /url: /admin/employees
              - img [ref=e56]
              - generic [ref=e60]: Employee Directory
            - link "Employment Contract" [ref=e61] [cursor=pointer]:
              - /url: /admin/contracts
              - img [ref=e62]
              - generic [ref=e66]: Employment Contract
            - link "Organizational Management" [ref=e67] [cursor=pointer]:
              - /url: /admin/organization
              - img [ref=e68]
              - generic [ref=e73]: Organizational Management
            - link "Discipline" [ref=e74] [cursor=pointer]:
              - /url: /admin/discipline
              - img [ref=e75]
              - generic [ref=e79]: Discipline
            - link "Permissions" [ref=e80] [cursor=pointer]:
              - /url: /admin/permissions
              - img [ref=e81]
              - generic [ref=e85]: Permissions
        - button "Attend & Leave" [ref=e87] [cursor=pointer]:
          - generic [ref=e88]:
            - img [ref=e90]
            - generic [ref=e101]: Attend & Leave
          - img [ref=e102]
        - button "Payroll" [ref=e105] [cursor=pointer]:
          - generic [ref=e106]:
            - img [ref=e108]
            - generic [ref=e112]: Payroll
          - img [ref=e113]
        - button "Performance" [ref=e116] [cursor=pointer]:
          - generic [ref=e117]:
            - img [ref=e119]
            - generic [ref=e122]: Performance
          - img [ref=e123]
        - button "Communication" [ref=e126] [cursor=pointer]:
          - generic [ref=e127]:
            - img [ref=e129]
            - generic [ref=e135]: Communication
          - img [ref=e136]
        - button "Analytics" [ref=e139] [cursor=pointer]:
          - generic [ref=e140]:
            - img [ref=e142]
            - generic [ref=e145]: Analytics
          - img [ref=e146]
      - generic [ref=e148]:
        - link "System Settings" [ref=e149] [cursor=pointer]:
          - /url: /admin/settings
          - img [ref=e150]
          - generic [ref=e165]: System Settings
        - link "Payroll Settings" [ref=e166] [cursor=pointer]:
          - /url: /admin/settings/payroll
          - img [ref=e167]
          - generic [ref=e170]: Payroll Settings
    - generic [ref=e171]:
      - banner [ref=e172]:
        - generic [ref=e173]:
          - generic [ref=e175]:
            - img [ref=e176]
            - textbox "Search pages & features..." [ref=e179]
          - button "🇬🇧 EN" [ref=e180] [cursor=pointer]:
            - img [ref=e181]
            - generic [ref=e185]: 🇬🇧
            - generic [ref=e186]: EN
          - button "1" [ref=e188] [cursor=pointer]:
            - img [ref=e189]
            - generic [ref=e192]: "1"
          - button "System Director S" [ref=e194] [cursor=pointer]:
            - generic [ref=e195]:
              - paragraph [ref=e196]: System
              - paragraph [ref=e197]: Director
            - generic [ref=e199]: S
            - img [ref=e200]
      - main [ref=e202]:
        - generic [ref=e205]:
          - heading "Organizational Management" [level=1] [ref=e207]
          - generic [ref=e208]:
            - generic [ref=e209]:
              - img [ref=e211]
              - generic [ref=e217]: "5"
              - generic [ref=e218]: Total Departments
            - generic [ref=e219]:
              - img [ref=e221]
              - generic [ref=e226]: "40"
              - generic [ref=e227]: Total Employments
            - generic [ref=e228]:
              - img [ref=e230]
              - generic "1476664680 VND" [ref=e234]: 1.476.664.680 VND
              - generic [ref=e235]: Total Budgets
          - generic [ref=e236]:
            - generic [ref=e237]:
              - generic [ref=e238]:
                - heading "Departments" [level=2] [ref=e239]
                - paragraph [ref=e240]: Manage corporate structure and budgets
              - generic [ref=e241]:
                - textbox "New department name..." [ref=e242]
                - button "Add" [ref=e243] [cursor=pointer]:
                  - img [ref=e244]
                  - text: Add
            - generic [ref=e247]:
              - generic [ref=e248]:
                - generic [ref=e249]:
                  - button "Assign Staff" [ref=e250] [cursor=pointer]:
                    - img [ref=e251]
                  - button "Edit department" [ref=e256] [cursor=pointer]:
                    - img [ref=e257]
                  - button "Delete department" [ref=e259] [cursor=pointer]:
                    - img [ref=e260]
                - generic [ref=e266]:
                  - img [ref=e268]
                  - heading "HR" [level=3] [ref=e271]
                - generic [ref=e272]:
                  - generic [ref=e273]:
                    - generic [ref=e274]: Head
                    - generic [ref=e275]: Not assigned
                  - generic [ref=e276]:
                    - generic [ref=e277]: Employees
                    - generic [ref=e278]: "9"
                  - generic [ref=e279]:
                    - generic [ref=e280]: Budget
                    - generic [ref=e281]: 447.608.338 VND
              - generic [ref=e282]:
                - generic [ref=e283]:
                  - button "Assign Staff" [ref=e284] [cursor=pointer]:
                    - img [ref=e285]
                  - button "Edit department" [ref=e290] [cursor=pointer]:
                    - img [ref=e291]
                  - button "Delete department" [ref=e293] [cursor=pointer]:
                    - img [ref=e294]
                - generic [ref=e300]:
                  - img [ref=e302]
                  - heading "Marketing" [level=3] [ref=e305]
                - generic [ref=e306]:
                  - generic [ref=e307]:
                    - generic [ref=e308]: Head
                    - generic [ref=e309]: Not assigned
                  - generic [ref=e310]:
                    - generic [ref=e311]: Employees
                    - generic [ref=e312]: "10"
                  - generic [ref=e313]:
                    - generic [ref=e314]: Budget
                    - generic [ref=e315]: 265.607.333 VND
              - generic [ref=e316]:
                - generic [ref=e317]:
                  - button "Assign Staff" [ref=e318] [cursor=pointer]:
                    - img [ref=e319]
                  - button "Edit department" [ref=e324] [cursor=pointer]:
                    - img [ref=e325]
                  - button "Delete department" [ref=e327] [cursor=pointer]:
                    - img [ref=e328]
                - generic [ref=e334]:
                  - img [ref=e336]
                  - heading "Sales" [level=3] [ref=e339]
                - generic [ref=e340]:
                  - generic [ref=e341]:
                    - generic [ref=e342]: Head
                    - generic [ref=e343]: Not assigned
                  - generic [ref=e344]:
                    - generic [ref=e345]: Employees
                    - generic [ref=e346]: "11"
                  - generic [ref=e347]:
                    - generic [ref=e348]: Budget
                    - generic [ref=e349]: 345.759.710 VND
              - generic [ref=e350]:
                - generic [ref=e351]:
                  - button "Assign Staff" [ref=e352] [cursor=pointer]:
                    - img [ref=e353]
                  - button "Edit department" [ref=e358] [cursor=pointer]:
                    - img [ref=e359]
                  - button "Delete department" [ref=e361] [cursor=pointer]:
                    - img [ref=e362]
                - generic [ref=e368]:
                  - img [ref=e370]
                  - heading "Engineering" [level=3] [ref=e373]
                - generic [ref=e374]:
                  - generic [ref=e375]:
                    - generic [ref=e376]: Head
                    - generic [ref=e377]: Not assigned
                  - generic [ref=e378]:
                    - generic [ref=e379]: Employees
                    - generic [ref=e380]: "7"
                  - generic [ref=e381]:
                    - generic [ref=e382]: Budget
                    - generic [ref=e383]: 333.932.555 VND
              - generic [ref=e384]:
                - generic [ref=e385]:
                  - button "Assign Staff" [ref=e386] [cursor=pointer]:
                    - img [ref=e387]
                  - button "Edit department" [ref=e392] [cursor=pointer]:
                    - img [ref=e393]
                  - button "Delete department" [ref=e395] [cursor=pointer]:
                    - img [ref=e396]
                - generic [ref=e402]:
                  - img [ref=e404]
                  - heading "Finance" [level=3] [ref=e407]
                - generic [ref=e408]:
                  - generic [ref=e409]:
                    - generic [ref=e410]: Head
                    - generic [ref=e411]: Not assigned
                  - generic [ref=e412]:
                    - generic [ref=e413]: Employees
                    - generic [ref=e414]: "3"
                  - generic [ref=e415]:
                    - generic [ref=e416]: Budget
                    - generic [ref=e417]: 83.756.744 VND
          - generic [ref=e418]:
            - generic [ref=e419]:
              - generic [ref=e420]:
                - heading "Positions" [level=2] [ref=e421]
                - paragraph [ref=e422]: Manage job titles across the company
              - generic [ref=e423]:
                - textbox "New position name..." [ref=e424]
                - button "Add" [ref=e425] [cursor=pointer]:
                  - img [ref=e426]
                  - text: Add
            - generic [ref=e429]:
              - generic [ref=e430]:
                - generic [ref=e431]:
                  - generic [ref=e432]: "#1"
                  - generic [ref=e433]: Director
                - button "Delete position" [ref=e434] [cursor=pointer]:
                  - img [ref=e435]
              - generic [ref=e441]:
                - generic [ref=e442]:
                  - generic [ref=e443]: "#2"
                  - generic [ref=e444]: Manager
                - button "Delete position" [ref=e445] [cursor=pointer]:
                  - img [ref=e446]
              - generic [ref=e452]:
                - generic [ref=e453]:
                  - generic [ref=e454]: "#3"
                  - generic [ref=e455]: Staff
                - button "Delete position" [ref=e456] [cursor=pointer]:
                  - img [ref=e457]
              - generic [ref=e463]:
                - generic [ref=e464]:
                  - generic [ref=e465]: "#4"
                  - generic [ref=e466]: Intern
                - button "Delete position" [ref=e467] [cursor=pointer]:
                  - img [ref=e468]
            - paragraph [ref=e475]: "Total Active Positions: 4"
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
> 48  |     expect(await btns.count()).toBeGreaterThanOrEqual(1);
      |                                ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
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