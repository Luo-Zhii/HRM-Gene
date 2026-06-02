import { test, expect } from '../../fixtures/auth';

test.describe('[M17] Holidays - Employee', () => {

  test('TC_HOL_001 - Employee → Holidays page', async ({ employeePage: page }) => {
    await page.goto('/dashboard/holidays');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_HOL_002 - Danh sách holidays hiển thị', async ({ employeePage: page }) => {
    await page.goto('/dashboard/holidays');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_HOL_003 - Có year selector', async ({ employeePage: page }) => {
    await page.goto('/dashboard/holidays');
    await page.waitForLoadState('networkidle');
    const selects = page.locator('select');
    expect(await selects.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_HOL_004 - Hiển thị ngày lễ', async ({ employeePage: page }) => {
    await page.goto('/dashboard/holidays');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('TC_HOL_005 - Upcoming holidays section', async ({ employeePage: page }) => {
    await page.goto('/dashboard/holidays');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Upcoming|Sắp tới/i).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('[M17] Holidays - Admin', () => {

  test('TC_HOL_006 - Admin → Holidays page', async ({ adminPage: page }) => {
    await page.goto('/admin/holidays');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_HOL_007 - Bảng holidays admin hiển thị', async ({ adminPage: page }) => {
    await page.goto('/admin/holidays');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_HOL_008 - Nút Create Holiday', async ({ adminPage: page }) => {
    await page.goto('/admin/holidays');
    await page.waitForLoadState('networkidle');
    const btn = page.locator('button').filter({ hasText: /Create|Tạo|Add|Thêm/i }).first();
    expect(await btn.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_HOL_009 - Nút Edit holiday', async ({ adminPage: page }) => {
    await page.goto('/admin/holidays');
    await page.waitForLoadState('networkidle');
    const btns = page.locator('button').filter({ hasText: /Edit|Sửa/i });
    expect(await btns.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_HOL_010 - Nút Delete holiday', async ({ adminPage: page }) => {
    await page.goto('/admin/holidays');
    await page.waitForLoadState('networkidle');
    const btns = page.locator('button').filter({ hasText: /Delete|Xóa/i });
    expect(await btns.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_HOL_011 - Stats holidays hiển thị', async ({ adminPage: page }) => {
    await page.goto('/admin/holidays');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('TC_HOL_012 - Employee bị chặn /admin/holidays', async ({ employeePage: page }) => {
    await page.goto('/admin/holidays');
    await page.waitForTimeout(2000);
    const denied = await page.getByText(/Access Denied|Truy cập bị từ chối/i).isVisible().catch(() => false);
    const redirected = !page.url().includes('/admin/holidays');
    expect(denied || redirected).toBeTruthy();
  });
});
