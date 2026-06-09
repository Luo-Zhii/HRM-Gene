# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: announcements/announcements.spec.ts >> [M13] Announcements - Admin >> TC_ANN_011 - Employee bị chặn /admin/announcements
- Location: specs/announcements/announcements.spec.ts:98:7

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
        - button "People" [ref=e41] [cursor=pointer]:
          - generic [ref=e42]:
            - img [ref=e44]
            - generic [ref=e48]: People
          - img [ref=e49]
        - button "Attend & Leave" [ref=e52] [cursor=pointer]:
          - generic [ref=e53]:
            - img [ref=e55]
            - generic [ref=e57]: Attend & Leave
          - img [ref=e58]
        - button "Performance" [ref=e61] [cursor=pointer]:
          - generic [ref=e62]:
            - img [ref=e64]
            - generic [ref=e67]: Performance
          - img [ref=e68]
        - generic [ref=e70]:
          - button "Communication" [ref=e71] [cursor=pointer]:
            - generic [ref=e72]:
              - img [ref=e74]
              - generic [ref=e80]: Communication
            - img [ref=e81]
          - link "Manage News" [ref=e84] [cursor=pointer]:
            - /url: /admin/announcements
            - img [ref=e85]
            - generic [ref=e88]: Manage News
        - button "Analytics" [ref=e90] [cursor=pointer]:
          - generic [ref=e91]:
            - img [ref=e93]
            - generic [ref=e96]: Analytics
          - img [ref=e97]
      - link "System Settings" [ref=e100] [cursor=pointer]:
        - /url: /admin/settings
        - img [ref=e101]
        - generic [ref=e112]: System Settings
    - generic [ref=e113]:
      - banner [ref=e114]:
        - generic [ref=e115]:
          - generic [ref=e117]:
            - img [ref=e118]
            - textbox "Search pages & features..." [ref=e121]
          - button "🇬🇧 EN" [ref=e122] [cursor=pointer]:
            - img [ref=e123]
            - generic [ref=e126]: 🇬🇧
            - generic [ref=e127]: EN
          - button "1" [ref=e129] [cursor=pointer]:
            - img [ref=e130]
            - generic [ref=e133]: "1"
          - button "Giang Staff G" [ref=e135] [cursor=pointer]:
            - generic [ref=e136]:
              - paragraph [ref=e137]: Giang
              - paragraph [ref=e138]: Staff
            - generic [ref=e140]: G
            - img [ref=e141]
      - main [ref=e143]:
        - generic [ref=e146]:
          - generic [ref=e148]:
            - generic [ref=e149]:
              - img [ref=e151]
              - heading "Manage Announcements" [level=1] [ref=e154]
            - paragraph [ref=e155]: Broadcast updates and manage automated system alerts across the entire organization or specific departments.
          - generic [ref=e156]:
            - generic [ref=e158]:
              - heading "Compose New Announcement" [level=2] [ref=e160]
              - generic [ref=e161]:
                - generic [ref=e162]:
                  - generic [ref=e163]:
                    - text: Announcement Type
                    - combobox [ref=e164]:
                      - option "General" [selected]
                      - option "Policy"
                      - option "Events"
                      - option "Alerts"
                  - generic [ref=e165]:
                    - text: Target Audience
                    - combobox [ref=e166]:
                      - option "All Employees" [selected]
                      - option "Specific Department"
                  - generic [ref=e167]:
                    - text: Title
                    - textbox "e.g. Q3 Townhall Meeting" [ref=e168]
                  - generic [ref=e169]:
                    - text: Content
                    - textbox "Write your announcement message here..." [ref=e170]
                - generic [ref=e171]:
                  - generic [ref=e172]:
                    - text: Delivery Method
                    - generic [ref=e173]:
                      - generic [ref=e174] [cursor=pointer]:
                        - checkbox "In-App Notification" [checked] [ref=e175]
                        - generic [ref=e176]:
                          - img [ref=e177]
                          - generic [ref=e180]: In-App Notification
                      - generic [ref=e181] [cursor=pointer]:
                        - checkbox "Email Delivery" [ref=e182]
                        - generic [ref=e183]:
                          - img [ref=e184]
                          - generic [ref=e187]: Email Delivery
                  - generic [ref=e188]:
                    - generic [ref=e189]:
                      - text: Priority Level
                      - generic [ref=e190]:
                        - generic [ref=e191] [cursor=pointer]:
                          - radio "Low" [ref=e192]
                          - generic [ref=e193]: Low
                        - generic [ref=e194] [cursor=pointer]:
                          - radio "Normal" [checked] [ref=e195]
                          - generic [ref=e196]: Normal
                        - generic [ref=e197] [cursor=pointer]:
                          - radio "High" [ref=e198]
                          - generic [ref=e199]: High
                    - generic [ref=e200]:
                      - text: Send Schedule (Optional)
                      - textbox [ref=e201]
                      - paragraph [ref=e202]: Leave blank to broadcast immediately.
                - generic [ref=e203]:
                  - button "Preview" [ref=e204] [cursor=pointer]:
                    - img
                    - text: Preview
                  - button "Send Announcement" [ref=e205] [cursor=pointer]:
                    - text: Send Announcement
                    - img
            - generic [ref=e207]:
              - generic [ref=e208]:
                - heading "Recent Announcements" [level=2] [ref=e209]:
                  - img [ref=e210]
                  - text: Recent Announcements
                - button [ref=e213] [cursor=pointer]:
                  - img
              - generic [ref=e215]:
                - generic [ref=e216] [cursor=pointer]:
                  - generic [ref=e217]:
                    - generic [ref=e218]: General
                    - generic [ref=e219]:
                      - generic [ref=e220]: Active
                      - button [ref=e221]:
                        - img [ref=e222]
                      - button [ref=e225]:
                        - img [ref=e226]
                  - heading "Welcome to HRM AI Inc." [level=3] [ref=e229]
                  - generic [ref=e230]:
                    - generic [ref=e231]:
                      - img [ref=e232]
                      - text: All
                    - generic [ref=e237]:
                      - img [ref=e238]
                      - text: 6/8/2026
                - generic [ref=e240] [cursor=pointer]:
                  - generic [ref=e241]:
                    - generic [ref=e242]: news.catEvent
                    - generic [ref=e243]:
                      - generic [ref=e244]: Active
                      - button [ref=e245]:
                        - img [ref=e246]
                      - button [ref=e249]:
                        - img [ref=e250]
                  - heading "Quarterly Townhall Scheduled" [level=3] [ref=e253]
                  - generic [ref=e254]:
                    - generic [ref=e255]:
                      - img [ref=e256]
                      - text: All
                    - generic [ref=e261]:
                      - img [ref=e262]
                      - text: 6/8/2026
                - generic [ref=e264] [cursor=pointer]:
                  - generic [ref=e265]:
                    - generic [ref=e266]: Policy
                    - generic [ref=e267]:
                      - generic [ref=e268]: Active
                      - button [ref=e269]:
                        - img [ref=e270]
                      - button [ref=e273]:
                        - img [ref=e274]
                  - heading "Annual Leave Policy Changes" [level=3] [ref=e277]
                  - generic [ref=e278]:
                    - generic [ref=e279]:
                      - img [ref=e280]
                      - text: All
                    - generic [ref=e285]:
                      - img [ref=e286]
                      - text: 6/8/2026
  - alert [ref=e288]
```

# Test source

```ts
  3   | 
  4   | test.describe('[M13] Announcements - Admin', () => {
  5   | 
  6   |   test('TC_ANN_001 - Admin → Manage News', async ({ adminPage: page }) => {
  7   |     await new Sidebar(page).navigateTo('Manage News');
  8   |     await page.waitForTimeout(1000);
  9   |   });
  10  | 
  11  |   test('TC_ANN_002 - Bảng announcements hiển thị', async ({ adminPage: page }) => {
  12  |     await page.goto('/admin/announcements');
  13  |     await page.waitForLoadState('domcontentloaded');
  14  |     // Announcements may render as cards or table — verify page has content
  15  |     await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  16  |     await expect(page.locator('body')).not.toContainText('Error');
  17  |   });
  18  | 
  19  |   test('TC_ANN_003 - Nút Create Announcement', async ({ adminPage: page }) => {
  20  |     await page.goto('/admin/announcements');
  21  |     await page.waitForLoadState('domcontentloaded');
  22  |     // Broader button match for Create/Add/New announcement
  23  |     const btns = page.getByRole('button').filter({ hasText: /Create|Tạo|Add|Thêm|New|Mới/i });
  24  |     expect(await btns.count()).toBeGreaterThanOrEqual(0);
  25  |   });
  26  | 
  27  |   test('TC_ANN_004 - Form tạo có input title', async ({ adminPage: page }) => {
  28  |     await page.goto('/admin/announcements');
  29  |     await page.waitForLoadState('domcontentloaded');
  30  |     const btn = page.getByRole('button').filter({ hasText: /Create|Tạo|Add|Thêm|New/i }).first();
  31  |     if (await btn.isVisible()) {
  32  |       await btn.click();
  33  |       await page.waitForTimeout(500);
  34  |       await expect(page.locator('input').first()).toBeVisible({ timeout: 5000 });
  35  |     }
  36  |   });
  37  | 
  38  |   test('TC_ANN_005 - Form có textarea content', async ({ adminPage: page }) => {
  39  |     await page.goto('/admin/announcements');
  40  |     await page.waitForLoadState('domcontentloaded');
  41  |     const btn = page.getByRole('button').filter({ hasText: /Create|Tạo|Add|Thêm|New/i }).first();
  42  |     if (await btn.isVisible()) {
  43  |       await btn.click();
  44  |       await page.waitForTimeout(500);
  45  |       await expect(page.locator('textarea').first()).toBeVisible({ timeout: 5000 });
  46  |     }
  47  |   });
  48  | 
  49  |   test('TC_ANN_006 - Form có chọn type', async ({ adminPage: page }) => {
  50  |     await page.goto('/admin/announcements');
  51  |     await page.waitForLoadState('domcontentloaded');
  52  |     const btn = page.getByRole('button').filter({ hasText: /Create|Tạo|Add|Thêm|New/i }).first();
  53  |     if (await btn.isVisible()) {
  54  |       await btn.click();
  55  |       await page.waitForTimeout(500);
  56  |       await expect(page.locator('select').first()).toBeVisible({ timeout: 5000 });
  57  |     }
  58  |   });
  59  | 
  60  |   test('TC_ANN_007 - Form có chọn priority', async ({ adminPage: page }) => {
  61  |     await page.goto('/admin/announcements');
  62  |     await page.waitForLoadState('domcontentloaded');
  63  |     const btn = page.getByRole('button').filter({ hasText: /Create|Tạo|Add|Thêm|New/i }).first();
  64  |     if (await btn.isVisible()) {
  65  |       await btn.click();
  66  |       await page.waitForTimeout(500);
  67  |       const selects = page.locator('select');
  68  |       expect(await selects.count()).toBeGreaterThanOrEqual(1);
  69  |     }
  70  |   });
  71  | 
  72  |   test('TC_ANN_008 - Form có chọn target audience', async ({ adminPage: page }) => {
  73  |     await page.goto('/admin/announcements');
  74  |     await page.waitForLoadState('domcontentloaded');
  75  |     const btn = page.getByRole('button').filter({ hasText: /Create|Tạo|Add|Thêm|New/i }).first();
  76  |     if (await btn.isVisible()) {
  77  |       await btn.click();
  78  |       await page.waitForTimeout(500);
  79  |       const checks = page.locator('[role="checkbox"], input[type="checkbox"]');
  80  |       expect(await checks.count()).toBeGreaterThanOrEqual(0);
  81  |     }
  82  |   });
  83  | 
  84  |   test('TC_ANN_009 - Nút Edit announcement', async ({ adminPage: page }) => {
  85  |     await page.goto('/admin/announcements');
  86  |     await page.waitForLoadState('domcontentloaded');
  87  |     const btns = page.locator('button').filter({ hasText: /Edit|Sửa/i });
  88  |     expect(await btns.count()).toBeGreaterThanOrEqual(0);
  89  |   });
  90  | 
  91  |   test('TC_ANN_010 - Nút Delete announcement', async ({ adminPage: page }) => {
  92  |     await page.goto('/admin/announcements');
  93  |     await page.waitForLoadState('domcontentloaded');
  94  |     const btns = page.locator('button').filter({ hasText: /Delete|Xóa/i });
  95  |     expect(await btns.count()).toBeGreaterThanOrEqual(0);
  96  |   });
  97  | 
  98  |   test('TC_ANN_011 - Employee bị chặn /admin/announcements', async ({ employeePage: page }) => {
  99  |     await page.goto('/admin/announcements');
  100 |     await page.waitForTimeout(2000);
  101 |     const denied = await page.getByText(/Access Denied|Truy cập bị từ chối/i).isVisible().catch(() => false);
  102 |     const redirected = !page.url().includes('/admin/announcements');
> 103 |     expect(denied || redirected).toBeTruthy();
      |                                  ^ Error: expect(received).toBeTruthy()
  104 |   });
  105 | });
  106 | 
  107 | test.describe('[M13] Announcements - Employee', () => {
  108 | 
  109 |   test('TC_ANN_012 - Employee → News Feed', async ({ employeePage: page }) => {
  110 |     await page.goto('/company-news');
  111 |     await page.waitForLoadState('domcontentloaded');
  112 |     await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  113 |   });
  114 | 
  115 |   test('TC_ANN_013 - News feed hiển thị bài viết', async ({ employeePage: page }) => {
  116 |     await page.goto('/company-news');
  117 |     await page.waitForLoadState('domcontentloaded');
  118 |     await page.waitForTimeout(500);
  119 |   });
  120 | 
  121 |   test('TC_ANN_014 - Bài viết có title', async ({ employeePage: page }) => {
  122 |     await page.goto('/company-news');
  123 |     await page.waitForLoadState('domcontentloaded');
  124 |     await page.waitForTimeout(500);
  125 |   });
  126 | 
  127 |   test('TC_ANN_015 - Bài viết có content', async ({ employeePage: page }) => {
  128 |     await page.goto('/company-news');
  129 |     await page.waitForLoadState('domcontentloaded');
  130 |     await page.waitForTimeout(500);
  131 |   });
  132 | 
  133 |   test('TC_ANN_016 - Bài viết có type/priority badge', async ({ employeePage: page }) => {
  134 |     await page.goto('/company-news');
  135 |     await page.waitForLoadState('domcontentloaded');
  136 |     const badges = page.locator('span').filter({ hasText: /High|Cao|Normal|Thường|Low|Thấp|Urgent|Khẩn/i });
  137 |     expect(await badges.count()).toBeGreaterThanOrEqual(0);
  138 |   });
  139 | });
  140 | 
```