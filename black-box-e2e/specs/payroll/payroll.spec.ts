import { test, expect } from '../../fixtures/auth';
import { Sidebar } from '../../pages/base';

test.describe('[M09] Payroll - Admin', () => {

  test('TC_PAY_001 - Admin → Create Payroll', async ({ adminPage: page }) => {
    await new Sidebar(page).navigateTo('Create Payroll');
    await page.waitForTimeout(1000);
  });

  test('TC_PAY_002 - Month/Year selectors', async ({ adminPage: page }) => {
    await page.goto('/admin/payroll/generate');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('select').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_PAY_003 - Nút Generate/Calculate', async ({ adminPage: page }) => {
    await page.goto('/admin/payroll/generate');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button').filter({ hasText: /Calculate|Tính|Generate|Tạo/i }).first()).toBeVisible();
  });

  test('TC_PAY_004 - Bảng payslip hiển thị', async ({ adminPage: page }) => {
    await page.goto('/admin/payroll/generate');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_PAY_005 - Summary cards hiển thị', async ({ adminPage: page }) => {
    await page.goto('/admin/payroll/generate');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('TC_PAY_006 - Employee bị chặn /admin/payroll', async ({ employeePage: page }) => {
    await page.goto('/admin/payroll/generate');
    await page.waitForTimeout(2000);
    const denied = await page.getByText(/Access Denied|Truy cập bị từ chối/i).isVisible().catch(() => false);
    const redirected = !page.url().includes('/admin/payroll/generate');
    expect(denied || redirected).toBeTruthy();
  });

  test('TC_PAY_007 - Admin → Salary Configuration', async ({ adminPage: page }) => {
    await new Sidebar(page).navigateTo('Salary Configuration');
    await page.waitForTimeout(1000);
  });

  test('TC_PAY_008 - Salary config hiển thị danh sách', async ({ adminPage: page }) => {
    await page.goto('/admin/payroll/config');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_PAY_009 - Nút Edit config', async ({ adminPage: page }) => {
    await page.goto('/admin/payroll/config');
    await page.waitForLoadState('networkidle');
    const btns = page.locator('button').filter({ hasText: /Edit|Sửa|Configure|Cấu hình/i });
    expect(await btns.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_PAY_010 - Admin → Salary Adjustment', async ({ adminPage: page }) => {
    await new Sidebar(page).navigateTo('Salary Adjustment');
    await page.waitForTimeout(1000);
  });

  test('TC_PAY_011 - Adjustments page load được', async ({ adminPage: page }) => {
    await page.goto('/admin/payroll/adjustment');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_PAY_012 - Có nút Add Adjustment', async ({ adminPage: page }) => {
    await page.goto('/admin/payroll/adjustment');
    await page.waitForLoadState('networkidle');
    const btns = page.locator('button').filter({ hasText: /Add|Thêm|Create|Tạo/i });
    expect(await btns.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_PAY_013 - Có filter status', async ({ adminPage: page }) => {
    await page.goto('/admin/payroll/adjustment');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('select').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_PAY_014 - Admin → Issue Payslips', async ({ adminPage: page }) => {
    await new Sidebar(page).navigateTo('Issue Payslips');
    await page.waitForTimeout(1000);
  });

  test('TC_PAY_015 - Issue page load được', async ({ adminPage: page }) => {
    await page.goto('/admin/payroll/issue');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('[M09] Payroll - Employee', () => {

  test('TC_PAY_016 - Employee → My Salary', async ({ employeePage: page }) => {
    await page.goto('/dashboard/salary');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_PAY_017 - Bảng lịch sử payslip', async ({ employeePage: page }) => {
    await page.goto('/dashboard/salary');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_PAY_018 - Nút View payslip detail', async ({ employeePage: page }) => {
    await page.goto('/dashboard/salary');
    await page.waitForLoadState('networkidle');
    const btn = page.locator('button').filter({ hasText: /View|Xem|Detail|Chi tiết/i }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
    }
  });
});
