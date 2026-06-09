# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth/auth.spec.ts >> [M01] Authentication - Profile & Navigation >> TC_AUTH_019 - Employee không thấy Administration trong sidebar
- Location: specs/auth/auth.spec.ts:131:7

# Error details

```
Error: expect(locator).not.toContainText(expected) failed

Locator: locator('aside')
Expected pattern: not /Administration/i
Received string: "DashboardNews FeedStaff DirectoryMy WorkspaceTimekeepingLeave ManagementMy GoalsMy SalaryMy ResignationAdministrationPeopleAttend & LeavePerformanceCommunicationAnalyticsSystem Settings"
Timeout: 15000ms

Call log:
  - Expect "not toContainText" with timeout 15000ms
  - waiting for locator('aside')
    33 × locator resolved to <aside class="fixed md:sticky top-0 h-screen z-50 w-[240px] bg-white border-r border-gray-200 transform transition-transform duration-300 flex flex-col -translate-x-full md:translate-x-0">…</aside>
       - unexpected value "DashboardNews FeedStaff DirectoryMy WorkspaceTimekeepingLeave ManagementMy GoalsMy SalaryMy ResignationAdministrationPeopleAttend & LeavePerformanceCommunicationAnalyticsSystem Settings"

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
    - link "Timekeeping":
      - /url: /dashboard/timekeeping
    - link "Leave Management":
      - /url: /dashboard/leave
    - link "My Goals":
      - /url: /dashboard/performance/me
    - link "My Salary":
      - /url: /dashboard/salary
    - link "My Resignation":
      - /url: /my-resignation
    - paragraph: Administration
    - button "People"
    - button "Attend & Leave"
    - button "Performance"
    - button "Communication"
    - button "Analytics"
  - link "System Settings":
    - /url: /admin/settings
```

# Test source

```ts
  32  |     const login = new LoginPage(page);
  33  |     await login.goto();
  34  |     await login.emailInput.fill('admin@example.com');
  35  |     // Press Enter instead of clicking — avoids the <text> element overlap
  36  |     await login.emailInput.press('Enter');
  37  |     const err = await login.errorMsg.isVisible().catch(() => false);
  38  |     expect(err).toBeTruthy();
  39  |   });
  40  | 
  41  |   test('TC_AUTH_005 - Trang login hiển thị demo credentials', async ({ page }) => {
  42  |     await page.goto('/login');
  43  |     await expect(page.getByText(/admin@example/i).first()).toBeVisible();
  44  |   });
  45  | 
  46  |   test('TC_AUTH_006 - Form login có đủ email/password/button', async ({ page }) => {
  47  |     const login = new LoginPage(page);
  48  |     await login.goto();
  49  |     await expect(login.emailInput).toBeVisible();
  50  |     await expect(login.passwordInput).toBeVisible();
  51  |     await expect(login.submitBtn).toBeVisible();
  52  |   });
  53  | });
  54  | 
  55  | test.describe('[M01] Authentication - Logout & Protected Routes', () => {
  56  | 
  57  |   test('TC_AUTH_007 - Logout → redirect về /login', async ({ adminPage: page }) => {
  58  |     const h = new HeaderBar(page);
  59  |     await h.logout();
  60  |     await page.waitForURL('**/login', { timeout: 10000 });
  61  |     await expect(page.locator('input[type="email"]')).toBeVisible();
  62  |   });
  63  | 
  64  |   test('TC_AUTH_008 - Sau logout, /dashboard không truy cập được', async ({ adminPage: page }) => {
  65  |     const h = new HeaderBar(page);
  66  |     await h.logout();
  67  |     await page.waitForURL('**/login', { timeout: 10000 });
  68  |     await page.goto('/dashboard');
  69  |     await page.waitForURL('**/login', { timeout: 10000 });
  70  |   });
  71  | 
  72  |   test('TC_AUTH_009 - Chưa login → /dashboard redirect /login', async ({ page }) => {
  73  |     await page.goto('/dashboard');
  74  |     await page.waitForURL('**/login', { timeout: 10000 });
  75  |   });
  76  | 
  77  |   test('TC_AUTH_010 - Chưa login → /admin/employees redirect /login', async ({ page }) => {
  78  |     await page.goto('/admin/employees');
  79  |     await page.waitForURL('**/login', { timeout: 10000 });
  80  |   });
  81  | 
  82  |   test('TC_AUTH_011 - Chưa login → /admin/payroll redirect /login', async ({ page }) => {
  83  |     await page.goto('/admin/payroll/generate');
  84  |     await page.waitForURL('**/login', { timeout: 10000 });
  85  |   });
  86  | 
  87  |   test('TC_AUTH_012 - /login luôn truy cập được khi chưa login', async ({ page }) => {
  88  |     await page.goto('/login');
  89  |     await expect(page.locator('input[type="email"]')).toBeVisible();
  90  |   });
  91  | 
  92  |   test('TC_AUTH_013 - Đã login → vào /login tự redirect /dashboard', async ({ adminPage: page }) => {
  93  |     await page.goto('/login');
  94  |     await page.waitForURL('**/dashboard', { timeout: 10000 });
  95  |   });
  96  | });
  97  | 
  98  | test.describe('[M01] Authentication - Profile & Navigation', () => {
  99  | 
  100 |   test('TC_AUTH_014 - Admin xem profile của mình', async ({ adminPage: page }) => {
  101 |     const h = new HeaderBar(page);
  102 |     await h.gotoProfile();
  103 |     await page.waitForURL('**/profile', { timeout: 10000 });
  104 |     await expectLoaded(page);
  105 |   });
  106 | 
  107 |   test('TC_AUTH_015 - Employee xem profile của mình', async ({ employeePage: page }) => {
  108 |     const h = new HeaderBar(page);
  109 |     await h.gotoProfile();
  110 |     await page.waitForURL('**/profile', { timeout: 10000 });
  111 |     await expectLoaded(page);
  112 |   });
  113 | 
  114 |   test('TC_AUTH_016 - Trang profile hiển thị tên người dùng', async ({ adminPage: page }) => {
  115 |     await page.goto('/profile');
  116 |     await page.waitForURL('**/profile', { timeout: 10000 });
  117 |     await expect(page.locator('body')).not.toContainText('Error');
  118 |   });
  119 | 
  120 |   test('TC_AUTH_017 - User menu có Profile + Logout', async ({ adminPage: page }) => {
  121 |     const h = new HeaderBar(page);
  122 |     await h.openUserMenu();
  123 |     await expect(page.locator('a, button').filter({ hasText: /My Profile|Hồ sơ/ }).first()).toBeVisible();
  124 |     await expect(page.locator('button').filter({ hasText: /Log Out|Đăng xuất/ }).first()).toBeVisible();
  125 |   });
  126 | 
  127 |   test('TC_AUTH_018 - Admin thấy Administration trong sidebar', async ({ adminPage: page }) => {
  128 |     await expect(page.locator('aside')).toContainText(/Administration/i);
  129 |   });
  130 | 
  131 |   test('TC_AUTH_019 - Employee không thấy Administration trong sidebar', async ({ employeePage: page }) => {
> 132 |     await expect(page.locator('aside')).not.toContainText(/Administration/i);
      |                                             ^ Error: expect(locator).not.toContainText(expected) failed
  133 |   });
  134 | 
  135 |   test('TC_AUTH_020 - Sidebar có link Dashboard', async ({ adminPage: page }) => {
  136 |     await expect(page.locator('aside').getByText(/Dashboard|Tổng quan/).first()).toBeVisible();
  137 |   });
  138 | 
  139 |   test('TC_AUTH_021 - Sidebar có link Staff Directory', async ({ employeePage: page }) => {
  140 |     await expect(page.locator('aside').getByText(/Staff Directory|Danh bạ/).first()).toBeVisible();
  141 |   });
  142 | 
  143 |   test('TC_AUTH_022 - Header có notification bell', async ({ adminPage: page }) => {
  144 |     // Verify header area has interactive elements (notification area)
  145 |     const headerArea = page.locator('header');
  146 |     await expect(headerArea).toBeVisible({ timeout: 5000 });
  147 |   });
  148 | 
  149 |   test('TC_AUTH_023 - Header có avatar/user icon', async ({ adminPage: page }) => {
  150 |     await expect(page.locator('header .rounded-full, header .bg-blue-100').first()).toBeVisible();
  151 |   });
  152 | 
  153 |   test('TC_AUTH_024 - Header có language switcher', async ({ adminPage: page }) => {
  154 |     await expect(new HeaderBar(page).langSwitcher).toBeVisible();
  155 |   });
  156 | 
  157 |   test('TC_AUTH_025 - Header có thanh search', async ({ adminPage: page }) => {
  158 |     await expect(new HeaderBar(page).searchInput).toBeVisible();
  159 |   });
  160 | });
  161 | 
```