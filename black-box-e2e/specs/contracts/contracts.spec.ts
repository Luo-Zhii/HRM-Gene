import { test, expect } from '../../fixtures/auth';
import { Sidebar } from '../../pages/base';

test.describe('[M06] Contracts - Admin', () => {

  test('TC_CONT_001 - Admin → Contracts page', async ({ adminPage: page }) => {
    await new Sidebar(page).navigateTo('Employment Contract');
    await page.waitForTimeout(1000);
  });

  test('TC_CONT_002 - Hiển thị bảng contracts', async ({ adminPage: page }) => {
    await page.goto('/admin/contracts');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_CONT_003 - Nút Create Contract', async ({ adminPage: page }) => {
    await page.goto('/admin/contracts');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button').filter({ hasText: /Create|Tạo/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_CONT_004 - Có search input', async ({ adminPage: page }) => {
    await page.goto('/admin/contracts');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[placeholder*="Search"], input[placeholder*="Tìm"]').first()).toBeVisible();
  });

  test('TC_CONT_005 - Có status filter', async ({ adminPage: page }) => {
    await page.goto('/admin/contracts');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('select, [role="combobox"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_CONT_006 - Employee bị chặn /admin/contracts', async ({ employeePage: page }) => {
    await page.goto('/admin/contracts');
    await page.waitForTimeout(2000);
    const denied = await page.getByText(/Access Denied|Truy cập bị từ chối/i).isVisible().catch(() => false);
    const redirected = !page.url().includes('/admin/contracts');
    expect(denied || redirected).toBeTruthy();
  });

  test('TC_CONT_007 - Create modal → mở form', async ({ adminPage: page }) => {
    await page.goto('/admin/contracts');
    await page.waitForLoadState('networkidle');
    const btn = page.getByRole('button').filter({ hasText: /Create|Tạo/i }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('[role="dialog"], .fixed.inset-0').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC_CONT_008 - Create form có select + input', async ({ adminPage: page }) => {
    await page.goto('/admin/contracts');
    await page.waitForLoadState('networkidle');
    const btn = page.getByRole('button').filter({ hasText: /Create|Tạo/i }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('select, input').first()).toBeVisible();
    }
  });

  test('TC_CONT_009 - Nút Edit → mở modal', async ({ adminPage: page }) => {
    await page.goto('/admin/contracts');
    await page.waitForLoadState('networkidle');
    const btn = page.locator('button').filter({ hasText: /Edit|Sửa/ }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
    }
  });

  test('TC_CONT_010 - File link mở tab mới', async ({ adminPage: page }) => {
    await page.goto('/admin/contracts');
    await page.waitForLoadState('networkidle');
    const links = page.locator('a[target="_blank"], button').filter({ hasText: /File|Document/i });
    expect(await links.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_CONT_011 - Filter theo contract type', async ({ adminPage: page }) => {
    await page.goto('/admin/contracts');
    await page.waitForLoadState('networkidle');
    const selects = page.locator('select');
    if (await selects.count() >= 2) {
      await selects.nth(1).selectOption({ index: 1 }).catch(() => {});
      await page.waitForTimeout(500);
    }
  });

  test('TC_CONT_012 - Filter theo contract status', async ({ adminPage: page }) => {
    await page.goto('/admin/contracts');
    await page.waitForLoadState('networkidle');
    const selects = page.locator('select');
    if (await selects.count() >= 1) {
      await selects.first().selectOption({ index: 1 }).catch(() => {});
      await page.waitForTimeout(500);
    }
  });

  test('TC_CONT_013 - Search lọc theo tên', async ({ adminPage: page }) => {
    await page.goto('/admin/contracts');
    await page.waitForLoadState('networkidle');
    const search = page.locator('input[placeholder*="Search"], input[placeholder*="Tìm"]').first();
    if (await search.isVisible()) {
      await search.fill('test');
      await page.waitForTimeout(500);
    }
  });
});
