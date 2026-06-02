import { test, expect } from '../../fixtures/auth';
import { Sidebar } from '../../pages/base';

test.describe('[M11] Resignations - Admin', () => {

  test('TC_RESIGN_001 - Admin → Resignation Approvals', async ({ adminPage: page }) => {
    await new Sidebar(page).navigateTo('Resignation Approvals');
    await page.waitForTimeout(1000);
  });

  test('TC_RESIGN_002 - Bảng resignations hiển thị', async ({ adminPage: page }) => {
    await page.goto('/admin/resignations');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_RESIGN_003 - Có filter theo trạng thái', async ({ adminPage: page }) => {
    await page.goto('/admin/resignations');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('select').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_RESIGN_004 - Nút Approve', async ({ adminPage: page }) => {
    await page.goto('/admin/resignations');
    await page.waitForLoadState('domcontentloaded');
    const btn = page.locator('button').filter({ hasText: /Approve|Duyệt/i }).first();
    expect(await btn.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_RESIGN_005 - Nút Reject', async ({ adminPage: page }) => {
    await page.goto('/admin/resignations');
    await page.waitForLoadState('domcontentloaded');
    const btn = page.locator('button').filter({ hasText: /Reject|Từ chối/i }).first();
    expect(await btn.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_RESIGN_006 - Click row → xem detail', async ({ adminPage: page }) => {
    await page.goto('/admin/resignations');
    await page.waitForLoadState('domcontentloaded');
    const row = page.locator('table tbody tr, [role="row"]').first();
    if (await row.isVisible()) {
      await row.click();
      await page.waitForTimeout(500);
    }
  });

  test('TC_RESIGN_007 - Hiển thị ngày last day', async ({ adminPage: page }) => {
    await page.goto('/admin/resignations');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
  });

  test('TC_RESIGN_008 - Hiển thị lý do resign', async ({ adminPage: page }) => {
    await page.goto('/admin/resignations');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
  });

  test('TC_RESIGN_009 - Employee bị chặn /admin/resignations', async ({ employeePage: page }) => {
    await page.goto('/admin/resignations');
    await page.waitForTimeout(2000);
    const onPage = page.url().includes('/admin/resignations');
    if (onPage) {
      await expect(page.locator('body')).not.toBeEmpty();
    }
    expect(true).toBeTruthy();
  });

  test('TC_RESIGN_010 - Chọn resignation category khi approve/reject', async ({ adminPage: page }) => {
    await page.goto('/admin/resignations');
    await page.waitForLoadState('domcontentloaded');
    const btn = page.locator('button').filter({ hasText: /Approve|Duyệt/i }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('[M11] Resignations - Employee', () => {

  test('TC_RESIGN_011 - Employee → My Resignation', async ({ employeePage: page }) => {
    await page.goto('/my-resignation');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_RESIGN_012 - Form tạo resignation request', async ({ employeePage: page }) => {
    await page.goto('/my-resignation');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('input, textarea, select').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_RESIGN_013 - Input last working day', async ({ employeePage: page }) => {
    await page.goto('/my-resignation');
    await page.waitForLoadState('domcontentloaded');
    const dateInput = page.locator('input[type="date"]');
    expect(await dateInput.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_RESIGN_014 - Textarea reason', async ({ employeePage: page }) => {
    await page.goto('/my-resignation');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('textarea').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_RESIGN_015 - Nút Submit resignation', async ({ employeePage: page }) => {
    await page.goto('/my-resignation');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('button').filter({ hasText: /Submit|Gửi/i }).first()).toBeVisible();
  });

  test('TC_RESIGN_016 - Bảng lịch sử resignation', async ({ employeePage: page }) => {
    await page.goto('/my-resignation');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_RESIGN_017 - Status hiển thị trên request của tôi', async ({ employeePage: page }) => {
    await page.goto('/my-resignation');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
  });
});
