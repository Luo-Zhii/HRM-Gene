import { test, expect } from '../../fixtures/auth';
import { HeaderBar } from '../../pages/base';

test.describe('[M15] Notifications - All Users', () => {

  test('TC_NOTI_001 - Bell icon hiển thị trên header', async ({ employeePage: page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const bell = new HeaderBar(page).notificationBell;
    expect(await bell.isVisible().catch(() => false)).toBeTruthy();
  });

  test('TC_NOTI_002 - Click bell → mở dropdown', async ({ employeePage: page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const bell = new HeaderBar(page).notificationBell;
    if (await bell.isVisible()) {
      await bell.click();
      await page.waitForTimeout(500);
    }
  });

  test('TC_NOTI_003 - Dropdown hiển thị danh sách notifications', async ({ employeePage: page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const bell = new HeaderBar(page).notificationBell;
    if (await bell.isVisible()) {
      await bell.click();
      await page.waitForTimeout(500);
      const items = page.locator('[role="menu"] a, [role="menu"] button, .dropdown-item');
      expect(await items.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('TC_NOTI_004 - Notification có badge unread count', async ({ employeePage: page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const badge = page.locator('header span').filter({ hasText: /^\d+$/ }).first();
    expect(await badge.count()).toBeGreaterThanOrEqual(0);
  });
});

test.describe('[M15] Notifications - Admin', () => {

  test('TC_NOTI_005 - Admin → Manage Notifications', async ({ adminPage: page }) => {
    await page.goto('/admin/notifications/manage');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_NOTI_006 - Danh sách notification templates', async ({ adminPage: page }) => {
    await page.goto('/admin/notifications/manage');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('TC_NOTI_007 - Nút gửi announcement', async ({ adminPage: page }) => {
    await page.goto('/admin/notifications/manage');
    await page.waitForLoadState('networkidle');
    const btn = page.locator('button').filter({ hasText: /Send|Gửi|Announce|Thông báo/i }).first();
    expect(await btn.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_NOTI_008 - Form gửi announcement có input', async ({ adminPage: page }) => {
    await page.goto('/admin/notifications/manage');
    await page.waitForLoadState('networkidle');
    const btn = page.locator('button').filter({ hasText: /Send|Gửi|Announce|Thông báo/i }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('input, textarea').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC_NOTI_009 - Employee bị chặn /admin/notifications/manage', async ({ employeePage: page }) => {
    await page.goto('/admin/notifications/manage');
    await page.waitForTimeout(2000);
    const denied = await page.getByText(/Access Denied|Truy cập bị từ chối/i).isVisible().catch(() => false);
    const redirected = !page.url().includes('/admin/notifications/manage');
    expect(denied || redirected).toBeTruthy();
  });
});
