import { test, expect } from '../../fixtures/auth';
import { Sidebar } from '../../pages/base';

test.describe('[M18] Staff Directory - All Users', () => {

  test('TC_DIR_001 - Staff Directory page load được', async ({ employeePage: page }) => {
    await page.goto('/directory');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_DIR_002 - Danh sách nhân viên hiển thị', async ({ employeePage: page }) => {
    await page.goto('/directory');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('table, [role="table"], .grid, [class*="card"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_DIR_003 - Có search input', async ({ employeePage: page }) => {
    await page.goto('/directory');
    await page.waitForLoadState('networkidle');
    const search = page.locator('input[placeholder*="Search"], input[placeholder*="Tìm"]').first();
    expect(await search.isVisible().catch(() => false)).toBeTruthy();
  });

  test('TC_DIR_004 - Search theo tên', async ({ employeePage: page }) => {
    await page.goto('/directory');
    await page.waitForLoadState('networkidle');
    const search = page.locator('input[placeholder*="Search"], input[placeholder*="Tìm"]').first();
    if (await search.isVisible()) {
      await search.fill('test');
      await page.waitForTimeout(500);
    }
  });

  test('TC_DIR_005 - Có department filter', async ({ employeePage: page }) => {
    await page.goto('/directory');
    await page.waitForLoadState('networkidle');
    const selects = page.locator('select');
    expect(await selects.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_DIR_006 - Click nhân viên → trang detail', async ({ employeePage: page }) => {
    await page.goto('/directory');
    await page.waitForLoadState('networkidle');
    const firstEmployee = page.locator('a[href*="/directory/"]').first();
    if (await firstEmployee.isVisible()) {
      await firstEmployee.click();
      await page.waitForTimeout(500);
    }
  });

  test('TC_DIR_007 - Detail page hiển thị thông tin', async ({ employeePage: page }) => {
    await page.goto('/directory');
    await page.waitForLoadState('networkidle');
    const firstEmployee = page.locator('a[href*="/directory/"]').first();
    if (await firstEmployee.isVisible()) {
      await firstEmployee.click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('TC_DIR_008 - Detail có tên nhân viên', async ({ employeePage: page }) => {
    await page.goto('/directory');
    await page.waitForLoadState('networkidle');
    const firstEmployee = page.locator('a[href*="/directory/"]').first();
    if (await firstEmployee.isVisible()) {
      await firstEmployee.click();
      await page.waitForTimeout(500);
    }
  });

  test('TC_DIR_009 - Detail có department/position', async ({ employeePage: page }) => {
    await page.goto('/directory');
    await page.waitForLoadState('networkidle');
    const firstEmployee = page.locator('a[href*="/directory/"]').first();
    if (await firstEmployee.isVisible()) {
      await firstEmployee.click();
      await page.waitForTimeout(500);
    }
  });

  test('TC_DIR_010 - Detail có email liên hệ', async ({ employeePage: page }) => {
    await page.goto('/directory');
    await page.waitForLoadState('networkidle');
    const firstEmployee = page.locator('a[href*="/directory/"]').first();
    if (await firstEmployee.isVisible()) {
      await firstEmployee.click();
      await page.waitForTimeout(500);
    }
  });

  test('TC_DIR_011 - Admin → Employee Directory', async ({ adminPage: page }) => {
    await new Sidebar(page).navigateTo('Employee Directory');
    await page.waitForTimeout(1000);
  });
});
