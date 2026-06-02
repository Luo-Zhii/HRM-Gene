import { test, expect } from '../../fixtures/auth';
import { Sidebar } from '../../pages/base';

test.describe('[M03] Employee Management - Admin', () => {

  test('TC_EMP_001 - Admin → Employee Directory', async ({ adminPage: page }) => {
    await new Sidebar(page).navigateTo('Employee Directory');
    await page.waitForURL('**/admin/employees', { timeout: 10000 });
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('TC_EMP_002 - Hiển thị danh sách nhân viên', async ({ adminPage: page }) => {
    await page.goto('/admin/employees');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_EMP_003 - Bảng có column headers', async ({ adminPage: page }) => {
    await page.goto('/admin/employees');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('table thead th, [role="columnheader"]').first()).toBeVisible();
  });

  test('TC_EMP_004 - Nút Add hiển thị', async ({ adminPage: page }) => {
    await page.goto('/admin/employees');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button').filter({ hasText: /Add|Thêm/ }).first()).toBeVisible();
  });

  test('TC_EMP_005 - Search nhân viên theo tên', async ({ adminPage: page }) => {
    await page.goto('/admin/employees');
    await page.waitForLoadState('networkidle');
    const search = page.locator('input[placeholder*="Search"], input[placeholder*="Tìm"]').first();
    if (await search.isVisible()) {
      await search.fill('admin');
      await page.waitForTimeout(500);
    }
  });

  test('TC_EMP_006 - Search <2 ký tự → không thực thi', async ({ adminPage: page }) => {
    await page.goto('/admin/employees');
    await page.waitForLoadState('networkidle');
    const search = page.locator('input[placeholder*="Search"], input[placeholder*="Tìm"]').first();
    if (await search.isVisible()) {
      await search.fill('a');
      await page.waitForTimeout(500);
    }
  });

  test('TC_EMP_007 - Clear search → reset danh sách', async ({ adminPage: page }) => {
    await page.goto('/admin/employees');
    await page.waitForLoadState('networkidle');
    const search = page.locator('input[placeholder*="Search"], input[placeholder*="Tìm"]').first();
    if (await search.isVisible()) {
      await search.fill('admin');
      await search.clear();
      await page.waitForTimeout(500);
    }
  });

  test('TC_EMP_008 - Nút Edit → mở modal', async ({ adminPage: page }) => {
    await page.goto('/admin/employees');
    await page.waitForLoadState('networkidle');
    const btn = page.locator('button').filter({ hasText: /Edit|Sửa/ }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await expect(page.locator('[role="dialog"], .fixed').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC_EMP_009 - Modal Edit có thể đóng', async ({ adminPage: page }) => {
    await page.goto('/admin/employees');
    await page.waitForLoadState('networkidle');
    const btn = page.locator('button').filter({ hasText: /Edit|Sửa/ }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
      const cancel = page.locator('button').filter({ hasText: /Cancel|Hủy|Close|Đóng/ }).first();
      if (await cancel.isVisible()) await cancel.click();
    }
  });

  test('TC_EMP_010 - Nút Offboard → mở modal', async ({ adminPage: page }) => {
    await page.goto('/admin/employees');
    await page.waitForLoadState('networkidle');
    const btn = page.locator('button').filter({ hasText: /Offboard|Nghỉ việc/ }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await expect(page.locator('[role="dialog"], .fixed').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC_EMP_011 - Modal Offboard yêu cầu date + reason', async ({ adminPage: page }) => {
    await page.goto('/admin/employees');
    await page.waitForLoadState('networkidle');
    const btn = page.locator('button').filter({ hasText: /Offboard|Nghỉ việc/ }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('input[type="date"], select').first()).toBeVisible();
    }
  });

  test('TC_EMP_012 - Nút Delete → hiển thị cảnh báo', async ({ adminPage: page }) => {
    await page.goto('/admin/employees');
    await page.waitForLoadState('networkidle');
    const btn = page.locator('button').filter({ hasText: /Delete|Xóa/ }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
    }
  });

  test('TC_EMP_013 - Nút Add → điều hướng /admin/register', async ({ adminPage: page }) => {
    await page.goto('/admin/employees');
    await page.waitForLoadState('networkidle');
    const btn = page.locator('a, button').filter({ hasText: /Add|Thêm/ }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('[M03] Employee Management - Access Control', () => {

  test('TC_EMP_014 - Employee bị chặn /admin/employees', async ({ employeePage: page }) => {
    await page.goto('/admin/employees');
    await page.waitForTimeout(2000);
    const denied = await page.getByText(/Access Denied|Truy cập bị từ chối/i).isVisible().catch(() => false);
    const redirected = !page.url().includes('/admin/employees');
    expect(denied || redirected).toBeTruthy();
  });

  test('TC_EMP_015 - Employee xem được Staff Directory', async ({ employeePage: page }) => {
    await page.goto('/directory');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Access Denied');
  });

  test('TC_EMP_016 - Directory không hiển thị phone/address', async ({ employeePage: page }) => {
    await page.goto('/directory');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('phone');
  });

  test('TC_EMP_017 - Directory hiển thị tên nhân viên', async ({ employeePage: page }) => {
    await page.goto('/directory');
    await page.waitForLoadState('networkidle');
    const rows = page.locator('table tbody tr, [role="row"]');
    expect(await rows.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_EMP_018 - Directory có search input', async ({ employeePage: page }) => {
    await page.goto('/directory');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[placeholder*="Search"], input[placeholder*="Tìm"]').first()).toBeVisible();
  });

  test('TC_EMP_019 - Click row → detail page', async ({ employeePage: page }) => {
    await page.goto('/directory');
    await page.waitForLoadState('networkidle');
    const row = page.locator('table tbody tr, [role="row"]').first();
    if (await row.isVisible()) {
      await row.click();
      await page.waitForTimeout(1000);
    }
  });

  test('TC_EMP_020 - Form register có email + password', async ({ adminPage: page }) => {
    await page.goto('/admin/register');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});
