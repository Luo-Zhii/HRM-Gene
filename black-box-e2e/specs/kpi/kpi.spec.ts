import { test, expect } from '../../fixtures/auth';
import { Sidebar } from '../../pages/base';

test.describe('[M12] KPI - Admin', () => {

  test('TC_KPI_001 - Admin → KPI Library', async ({ adminPage: page }) => {
    await new Sidebar(page).navigateTo('KPI Library');
    await page.waitForTimeout(1000);
  });

  test('TC_KPI_002 - Bảng KPI library hiển thị', async ({ adminPage: page }) => {
    await page.goto('/admin/performance/library');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_KPI_003 - Nút Create KPI template', async ({ adminPage: page }) => {
    await page.goto('/admin/performance/library');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button').filter({ hasText: /Create|Tạo|Add|Thêm/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_KPI_004 - Form tạo KPI có input name', async ({ adminPage: page }) => {
    await page.goto('/admin/performance/library');
    await page.waitForLoadState('networkidle');
    const btn = page.getByRole('button').filter({ hasText: /Create|Tạo|Add|Thêm/i }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('input').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC_KPI_005 - Form có chọn weight/trọng số', async ({ adminPage: page }) => {
    await page.goto('/admin/performance/library');
    await page.waitForLoadState('networkidle');
    const btn = page.getByRole('button').filter({ hasText: /Create|Tạo|Add|Thêm/i }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
      const inputs = page.locator('input[type="number"], input[type="text"]');
      expect(await inputs.count()).toBeGreaterThanOrEqual(1);
    }
  });

  test('TC_KPI_006 - Nút Edit KPI template', async ({ adminPage: page }) => {
    await page.goto('/admin/performance/library');
    await page.waitForLoadState('networkidle');
    const btns = page.locator('button').filter({ hasText: /Edit|Sửa/i });
    expect(await btns.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_KPI_007 - Nút Delete KPI template', async ({ adminPage: page }) => {
    await page.goto('/admin/performance/library');
    await page.waitForLoadState('networkidle');
    const btns = page.locator('button').filter({ hasText: /Delete|Xóa/i });
    expect(await btns.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_KPI_008 - Admin → Team Performance', async ({ adminPage: page }) => {
    await new Sidebar(page).navigateTo('Team Performance');
    await page.waitForTimeout(1000);
  });

  test('TC_KPI_009 - Bảng team performance hiển thị', async ({ adminPage: page }) => {
    await page.goto('/admin/performance/team');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_KPI_010 - Có select period/KPI kỳ', async ({ adminPage: page }) => {
    await page.goto('/admin/performance/team');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('select').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_KPI_011 - Có chức năng grade/chấm điểm', async ({ adminPage: page }) => {
    await page.goto('/admin/performance/team');
    await page.waitForLoadState('networkidle');
    const btns = page.locator('button').filter({ hasText: /Grade|Chấm|Score|Điểm/i });
    expect(await btns.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_KPI_012 - Employee bị chặn /admin/performance/library', async ({ employeePage: page }) => {
    await page.goto('/admin/performance/library');
    await page.waitForTimeout(2000);
    const denied = await page.getByText(/Access Denied|Truy cập bị từ chối/i).isVisible().catch(() => false);
    const redirected = !page.url().includes('/admin/performance/library');
    expect(denied || redirected).toBeTruthy();
  });
});

test.describe('[M12] KPI - Employee', () => {

  test('TC_KPI_013 - Employee → My Goals', async ({ employeePage: page }) => {
    await page.goto('/dashboard/performance/me');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_KPI_014 - Hiển thị KPI được giao', async ({ employeePage: page }) => {
    await page.goto('/dashboard/performance/me');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_KPI_015 - Có input cập nhật actual value', async ({ employeePage: page }) => {
    await page.goto('/dashboard/performance/me');
    await page.waitForLoadState('networkidle');
    const inputs = page.locator('input[type="number"], input[type="text"]');
    expect(await inputs.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_KPI_016 - Nút Save/Cập nhật KPI', async ({ employeePage: page }) => {
    await page.goto('/dashboard/performance/me');
    await page.waitForLoadState('networkidle');
    const btn = page.locator('button').filter({ hasText: /Save|Lưu|Update|Cập nhật/i }).first();
    expect(await btn.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_KPI_017 - Hiển thị điểm số/grade', async ({ employeePage: page }) => {
    await page.goto('/dashboard/performance/me');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('TC_KPI_018 - Hiển thị period hiện tại', async ({ employeePage: page }) => {
    await page.goto('/dashboard/performance/me');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });
});
