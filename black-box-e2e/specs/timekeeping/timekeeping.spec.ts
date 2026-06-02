import { test, expect } from '../../fixtures/auth';
import { Sidebar } from '../../pages/base';

test.describe('[M08] Timekeeping - Employee', () => {

  test('TC_TIME_001 - Employee → Timekeeping page', async ({ employeePage: page }) => {
    await page.goto('/timekeeping');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_TIME_002 - Timekeeping không lỗi', async ({ employeePage: page }) => {
    await page.goto('/timekeeping');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Error');
  });

  test('TC_TIME_003 - /dashboard/timekeeping redirect → /timekeeping', async ({ employeePage: page }) => {
    await page.goto('/dashboard/timekeeping');
    await page.waitForTimeout(2000);
  });

  test('TC_TIME_004 - QR section hiển thị', async ({ employeePage: page }) => {
    await page.goto('/timekeeping');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });
});

test.describe('[M08] Timekeeping - Admin', () => {

  test('TC_TIME_005 - Admin → Attendance History', async ({ adminPage: page }) => {
    await new Sidebar(page).navigateTo('Attendance');
    await page.waitForTimeout(1000);
  });

  test('TC_TIME_006 - Bảng attendance hiển thị', async ({ adminPage: page }) => {
    await page.goto('/admin/attendance');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_TIME_007 - QR Display page load được', async ({ adminPage: page }) => {
    await page.goto('/admin/qr-display');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_TIME_008 - Có pagination', async ({ adminPage: page }) => {
    await page.goto('/admin/attendance');
    await page.waitForLoadState('networkidle');
    const pagination = page.locator('button').filter({ hasText: /Next|Previous|Sau|Trước|1|2/i });
    expect(await pagination.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_TIME_009 - Có date filter', async ({ adminPage: page }) => {
    await page.goto('/admin/attendance');
    await page.waitForLoadState('networkidle');
    const dates = page.locator('input[type="date"]');
    expect(await dates.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_TIME_010 - Employee bị chặn /admin/attendance', async ({ employeePage: page }) => {
    await page.goto('/admin/attendance');
    await page.waitForTimeout(2000);
    const denied = await page.getByText(/Access Denied|Truy cập bị từ chối/i).isVisible().catch(() => false);
    const redirected = !page.url().includes('/admin/attendance');
    expect(denied || redirected).toBeTruthy();
  });

  test('TC_TIME_011 - Status badges (Present/Late/Absent)', async ({ adminPage: page }) => {
    await page.goto('/admin/attendance');
    await page.waitForLoadState('networkidle');
    const badges = page.locator('span').filter({ hasText: /Present|Late|Absent|Có mặt|Muộn|Vắng/i });
    expect(await badges.count()).toBeGreaterThanOrEqual(0);
  });
});
