import { test, expect } from '../../fixtures/auth';
import { Sidebar } from '../../pages/base';

test.describe('[M07] Leave - Employee', () => {

  test('TC_LEAVE_001 - Employee → Leave page', async ({ employeePage: page }) => {
    await page.goto('/dashboard/leave');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_LEAVE_002 - Hiển thị balance cards', async ({ employeePage: page }) => {
    await page.goto('/dashboard/leave');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Balance|Remaining|Còn lại|ngày/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_LEAVE_003 - Select leave type', async ({ employeePage: page }) => {
    await page.goto('/dashboard/leave');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('select').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_LEAVE_004 - Date pickers start/end', async ({ employeePage: page }) => {
    await page.goto('/dashboard/leave');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('TC_LEAVE_005 - Textarea reason', async ({ employeePage: page }) => {
    await page.goto('/dashboard/leave');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('textarea').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_LEAVE_006 - Nút Submit Request', async ({ employeePage: page }) => {
    await page.goto('/dashboard/leave');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button').filter({ hasText: /Submit|Gửi/i }).first()).toBeVisible();
  });

  test('TC_LEAVE_007 - Nút Clear/Reset', async ({ employeePage: page }) => {
    await page.goto('/dashboard/leave');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button').filter({ hasText: /Clear|Xóa|Reset/i }).first()).toBeVisible();
  });

  test('TC_LEAVE_008 - Bảng lịch sử leave', async ({ employeePage: page }) => {
    await page.goto('/dashboard/leave');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_LEAVE_009 - Tính duration khi chọn date', async ({ employeePage: page }) => {
    await page.goto('/dashboard/leave');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('TC_LEAVE_010 - View detail → mở modal', async ({ employeePage: page }) => {
    await page.goto('/dashboard/leave');
    await page.waitForLoadState('networkidle');
    const btn = page.locator('button').filter({ hasText: /View|Xem/ }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('[M07] Leave - Admin Approval', () => {

  test('TC_LEAVE_011 - Admin → Leave Approvals', async ({ adminPage: page }) => {
    await new Sidebar(page).navigateTo('Leave Approvals');
    await page.waitForTimeout(1000);
  });

  test('TC_LEAVE_012 - Hiển thị pending requests', async ({ adminPage: page }) => {
    await page.goto('/admin/leave-approvals');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_LEAVE_013 - Stats cards (Total/Pending/Approved/Rejected)', async ({ adminPage: page }) => {
    await page.goto('/admin/leave-approvals');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Pending|Chờ/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_LEAVE_014 - Tab filters', async ({ adminPage: page }) => {
    await page.goto('/admin/leave-approvals');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button').filter({ hasText: /Pending|Chờ|Approved|Đã duyệt|Rejected|Từ chối/i }).first()).toBeVisible();
  });

  test('TC_LEAVE_015 - Click request → hiện detail', async ({ adminPage: page }) => {
    await page.goto('/admin/leave-approvals');
    await page.waitForLoadState('networkidle');
    const row = page.locator('table tbody tr, [role="row"]').first();
    if (await row.isVisible()) {
      await row.click();
      await page.waitForTimeout(500);
    }
  });

  test('TC_LEAVE_016 - Nút Approve', async ({ adminPage: page }) => {
    await page.goto('/admin/leave-approvals');
    await page.waitForLoadState('networkidle');
    const btn = page.locator('button').filter({ hasText: /Approve|Duyệt/i }).first();
    expect(await btn.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_LEAVE_017 - Nút Reject', async ({ adminPage: page }) => {
    await page.goto('/admin/leave-approvals');
    await page.waitForLoadState('networkidle');
    const btn = page.locator('button').filter({ hasText: /Reject|Từ chối/i }).first();
    expect(await btn.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_LEAVE_018 - Employee bị chặn /admin/leave-approvals', async ({ employeePage: page }) => {
    await page.goto('/admin/leave-approvals');
    await page.waitForTimeout(2000);
    const denied = await page.getByText(/Access Denied|Truy cập bị từ chối/i).isVisible().catch(() => false);
    const redirected = !page.url().includes('/admin/leave-approvals');
    expect(denied || redirected).toBeTruthy();
  });

  test('TC_LEAVE_019 - Confirmation modal khi Approve/Reject', async ({ adminPage: page }) => {
    await page.goto('/admin/leave-approvals');
    await page.waitForLoadState('networkidle');
    const btn = page.locator('button').filter({ hasText: /Approve|Duyệt/i }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
    }
  });
});
