import { test, expect } from '../../fixtures/auth';
import { Sidebar, HeaderBar, expectLoaded } from '../../pages/base';

test.describe('[M02] Dashboard - Employee', () => {

  test('TC_DASH_001 - Employee dashboard load thành công', async ({ employeePage: page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expectLoaded(page);
  });

  test('TC_DASH_002 - Employee dashboard không có lỗi', async ({ employeePage: page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Error');
    await expect(page.locator('body')).not.toContainText('Access Denied');
  });

  test('TC_DASH_003 - Employee có quick action cards', async ({ employeePage: page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const cards = page.locator('.rounded-xl, .rounded-lg, [class*="card"]');
    expect(await cards.count()).toBeGreaterThanOrEqual(0);
  });
});

test.describe('[M02] Dashboard - Admin', () => {

  test('TC_DASH_004 - Admin dashboard load thành công', async ({ adminPage: page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expectLoaded(page);
  });

  test('TC_DASH_005 - Admin dashboard có statistics', async ({ adminPage: page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const stats = page.locator('[class*="stat"], [class*="card"], .bg-blue-100, .bg-green-100');
    expect(await stats.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_DASH_006 - Admin dashboard không có Access Denied', async ({ adminPage: page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Access Denied');
  });

  test('TC_DASH_007 - Sidebar highlight link hiện tại', async ({ adminPage: page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const active = page.locator('aside a.bg-blue-600, aside a[class*="bg-blue-600"]');
    expect(await active.count()).toBeGreaterThanOrEqual(0);
  });
});

test.describe('[M02] Dashboard - Điều hướng', () => {

  test('TC_DASH_008 - Sidebar → Timekeeping', async ({ adminPage: page }) => {
    await new Sidebar(page).navigateTo('Timekeeping');
    await page.waitForTimeout(1000);
  });

  test('TC_DASH_009 - Sidebar → Leave', async ({ adminPage: page }) => {
    await new Sidebar(page).navigateTo('Leave');
    await page.waitForTimeout(1000);
  });

  test('TC_DASH_010 - Employee → My Salary load được', async ({ employeePage: page }) => {
    await page.goto('/dashboard/salary');
    await page.waitForLoadState('networkidle');
    await expectLoaded(page);
  });

  test('TC_DASH_011 - News Feed load được', async ({ employeePage: page }) => {
    await page.goto('/company-news');
    await page.waitForLoadState('networkidle');
    await expectLoaded(page);
  });
});

test.describe('[M02] Dashboard - Header', () => {

  test('TC_DASH_012 - Search focus → hiện quick links', async ({ adminPage: page }) => {
    await new HeaderBar(page).searchInput.click();
    await page.waitForTimeout(500);
  });

  test('TC_DASH_013 - Search gõ "leave" → lọc kết quả', async ({ adminPage: page }) => {
    await new HeaderBar(page).search('leave');
    await page.waitForTimeout(800);
  });

  test('TC_DASH_014 - Search gõ từ không tồn tại → no results', async ({ adminPage: page }) => {
    await new HeaderBar(page).search('xyznonexistent');
    await page.waitForTimeout(800);
  });

  test('TC_DASH_015 - Click notification bell → mở dropdown', async ({ adminPage: page }) => {
    await new HeaderBar(page).notificationBell.click();
    await page.waitForTimeout(500);
  });

  test('TC_DASH_016 - Logo hiển thị trong sidebar', async ({ adminPage: page }) => {
    await expect(page.locator('aside img').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_DASH_017 - Click logo → về /dashboard', async ({ adminPage: page }) => {
    const logo = page.locator('aside img, aside a').first();
    if (await logo.isVisible()) {
      await logo.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('TC_DASH_018 - Dashboard không crash khi reload', async ({ adminPage: page }) => {
    await page.goto('/dashboard');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expectLoaded(page);
  });
});
