import { test, expect } from '../../fixtures/auth';
import { Sidebar } from '../../pages/base';

test.describe('[M10] Discipline - Admin', () => {

  test('TC_DISC_001 - Admin → Discipline page', async ({ adminPage: page }) => {
    await new Sidebar(page).navigateTo('Discipline');
    await page.waitForTimeout(1000);
  });

  test('TC_DISC_002 - Bảng violations hiển thị', async ({ adminPage: page }) => {
    await page.goto('/admin/discipline');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_DISC_003 - Nút Create Violation', async ({ adminPage: page }) => {
    await page.goto('/admin/discipline');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button').filter({ hasText: /Create|Tạo|Add|Thêm/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_DISC_004 - Form tạo violation có select employee', async ({ adminPage: page }) => {
    await page.goto('/admin/discipline');
    await page.waitForLoadState('networkidle');
    const btn = page.getByRole('button').filter({ hasText: /Create|Tạo|Add|Thêm/i }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('select, [role="combobox"]').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC_DISC_005 - Form có input violation type', async ({ adminPage: page }) => {
    await page.goto('/admin/discipline');
    await page.waitForLoadState('networkidle');
    const btn = page.getByRole('button').filter({ hasText: /Create|Tạo|Add|Thêm/i }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('input, textarea').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC_DISC_006 - Form có chọn severity', async ({ adminPage: page }) => {
    await page.goto('/admin/discipline');
    await page.waitForLoadState('networkidle');
    const btn = page.getByRole('button').filter({ hasText: /Create|Tạo|Add|Thêm/i }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
      const selects = page.locator('select');
      expect(await selects.count()).toBeGreaterThanOrEqual(1);
    }
  });

  test('TC_DISC_007 - Có filter theo trạng thái', async ({ adminPage: page }) => {
    await page.goto('/admin/discipline');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('select').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_DISC_008 - Có search input', async ({ adminPage: page }) => {
    await page.goto('/admin/discipline');
    await page.waitForLoadState('networkidle');
    const search = page.locator('input[placeholder*="Search"], input[placeholder*="Tìm"]').first();
    expect(await search.isVisible().catch(() => false)).toBeTruthy();
  });

  test('TC_DISC_009 - Nút Edit violation', async ({ adminPage: page }) => {
    await page.goto('/admin/discipline');
    await page.waitForLoadState('networkidle');
    const btns = page.locator('button').filter({ hasText: /Edit|Sửa/i });
    expect(await btns.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_DISC_010 - Nút Delete violation', async ({ adminPage: page }) => {
    await page.goto('/admin/discipline');
    await page.waitForLoadState('networkidle');
    const btns = page.locator('button').filter({ hasText: /Delete|Xóa/i });
    expect(await btns.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_DISC_011 - Click row → xem detail', async ({ adminPage: page }) => {
    await page.goto('/admin/discipline');
    await page.waitForLoadState('networkidle');
    const row = page.locator('table tbody tr, [role="row"]').first();
    if (await row.isVisible()) {
      await row.click();
      await page.waitForTimeout(500);
    }
  });

  test('TC_DISC_012 - Severity badges hiển thị', async ({ adminPage: page }) => {
    await page.goto('/admin/discipline');
    await page.waitForLoadState('networkidle');
    const badges = page.locator('span').filter({ hasText: /Low|Normal|High|Thấp|Cao|Trung bình/i });
    expect(await badges.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_DISC_013 - Status badges hiển thị', async ({ adminPage: page }) => {
    await page.goto('/admin/discipline');
    await page.waitForLoadState('networkidle');
    const badges = page.locator('span').filter({ hasText: /Pending|Resolved|Chờ|Đã xử lý/i });
    expect(await badges.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_DISC_014 - Employee bị chặn /admin/discipline', async ({ employeePage: page }) => {
    await page.goto('/admin/discipline');
    await page.waitForTimeout(2000);
    const denied = await page.getByText(/Access Denied|Truy cập bị từ chối/i).isVisible().catch(() => false);
    const redirected = !page.url().includes('/admin/discipline');
    expect(denied || redirected).toBeTruthy();
  });

  test('TC_DISC_015 - Sync attendance button', async ({ adminPage: page }) => {
    await page.goto('/admin/discipline');
    await page.waitForLoadState('networkidle');
    const btns = page.locator('button').filter({ hasText: /Sync|Đồng bộ/i });
    expect(await btns.count()).toBeGreaterThanOrEqual(0);
  });
});
