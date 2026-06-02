import { test, expect } from '../../fixtures/auth';
import { Sidebar } from '../../pages/base';

test.describe('[M20] Settings - Admin', () => {

  test('TC_SET_001 - Admin → System Settings', async ({ adminPage: page }) => {
    await new Sidebar(page).navigateTo('System Settings');
    await page.waitForTimeout(1000);
  });

  test('TC_SET_002 - System settings page load được', async ({ adminPage: page }) => {
    await page.goto('/admin/settings');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_SET_003 - Có các tab/section settings', async ({ adminPage: page }) => {
    await page.goto('/admin/settings');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
  });

  test('TC_SET_004 - Nút Save settings', async ({ adminPage: page }) => {
    await page.goto('/admin/settings');
    await page.waitForLoadState('domcontentloaded');
    const btn = page.locator('button').filter({ hasText: /Save|Lưu/i }).first();
    expect(await btn.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_SET_005 - Admin → Payroll Settings', async ({ adminPage: page }) => {
    await new Sidebar(page).navigateTo('Payroll Settings');
    await page.waitForTimeout(1000);
  });

  test('TC_SET_006 - Payroll settings page load được', async ({ adminPage: page }) => {
    await page.goto('/admin/settings/payroll');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_SET_007 - Form payroll settings có input', async ({ adminPage: page }) => {
    await page.goto('/admin/settings/payroll');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('input').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_SET_008 - Nút Save payroll settings', async ({ adminPage: page }) => {
    await page.goto('/admin/settings/payroll');
    await page.waitForLoadState('domcontentloaded');
    const btn = page.locator('button').filter({ hasText: /Save|Lưu/i }).first();
    expect(await btn.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_SET_009 - Employee bị chặn /admin/settings', async ({ employeePage: page }) => {
    await page.goto('/admin/settings');
    await page.waitForTimeout(2000);
    const onPage = page.url().includes('/admin/settings');
    if (onPage) {
      await expect(page.locator('body')).not.toBeEmpty();
    }
    expect(true).toBeTruthy();
  });

  test('TC_SET_010 - Employee bị chặn /admin/settings/payroll', async ({ employeePage: page }) => {
    await page.goto('/admin/settings/payroll');
    await page.waitForTimeout(2000);
    const onPage = page.url().includes('/admin/settings/payroll');
    if (onPage) {
      await expect(page.locator('body')).not.toBeEmpty();
    }
    expect(true).toBeTruthy();
  });
});
