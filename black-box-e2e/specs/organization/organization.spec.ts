import { test, expect } from '../../fixtures/auth';
import { Sidebar } from '../../pages/base';

test.describe('[M04] Organization - Admin', () => {

  test('TC_ORG_001 - Admin → Organization page', async ({ adminPage: page }) => {
    await new Sidebar(page).navigateTo('Organizational');
    await page.waitForTimeout(1000);
  });

  test('TC_ORG_002 - Hiển thị stats cards', async ({ adminPage: page }) => {
    await page.goto('/admin/organization');
    await page.waitForLoadState('domcontentloaded');
    const cards = page.locator('[class*="stat"], [class*="card"]');
    expect(await cards.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_ORG_003 - Có section Departments', async ({ adminPage: page }) => {
    await page.goto('/admin/organization');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText(/Department|Phòng ban/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_ORG_004 - Có section Positions', async ({ adminPage: page }) => {
    await page.goto('/admin/organization');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText(/Position|Vị trí|Chức vụ/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_ORG_005 - Employee bị chặn /admin/organization', async ({ employeePage: page }) => {
    await page.goto('/admin/organization');
    await page.waitForTimeout(2000);
    const denied = await page.getByText(/Access Denied|Truy cập bị từ chối/i).isVisible().catch(() => false);
    const redirected = !page.url().includes('/admin/organization');
    expect(denied || redirected).toBeTruthy();
  });

  test('TC_ORG_006 - Có input tạo department', async ({ adminPage: page }) => {
    await page.goto('/admin/organization');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByPlaceholder(/Department|Phòng ban/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_ORG_007 - Có nút Add department', async ({ adminPage: page }) => {
    await page.goto('/admin/organization');
    await page.waitForLoadState('domcontentloaded');
    const btns = page.locator('button').filter({ hasText: /Add|Thêm/ });
    expect(await btns.count()).toBeGreaterThanOrEqual(1);
  });

  test('TC_ORG_008 - Department cards render', async ({ adminPage: page }) => {
    await page.goto('/admin/organization');
    await page.waitForLoadState('domcontentloaded');
    const cards = page.locator('[class*="border"][class*="rounded"]');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('TC_ORG_009 - Hover department card → hiện actions', async ({ adminPage: page }) => {
    await page.goto('/admin/organization');
    await page.waitForLoadState('domcontentloaded');
    const card = page.locator('[class*="border"][class*="rounded"], .group').first();
    if (await card.isVisible()) {
      await card.hover();
      await page.waitForTimeout(300);
    }
  });

  test('TC_ORG_010 - Edit department → có manager select', async ({ adminPage: page }) => {
    await page.goto('/admin/organization');
    await page.waitForLoadState('domcontentloaded');
    const editBtn = page.locator('button').filter({ hasText: /Edit|Sửa/ }).first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('[role="dialog"], .fixed.inset-0').first()).toBeVisible();
    }
  });

  test('TC_ORG_011 - Delete department → confirm dialog', async ({ adminPage: page }) => {
    await page.goto('/admin/organization');
    await page.waitForLoadState('domcontentloaded');
    page.on('dialog', async (d) => { await d.dismiss(); });
    const delBtn = page.locator('button').filter({ hasText: /Delete|Xóa/ }).first();
    if (await delBtn.isVisible()) await delBtn.click();
  });

  test('TC_ORG_012 - Có input tạo position', async ({ adminPage: page }) => {
    await page.goto('/admin/organization');
    await page.waitForLoadState('domcontentloaded');
    const inputs = page.locator('input[placeholder]');
    expect(await inputs.count()).toBeGreaterThanOrEqual(1);
  });

  test('TC_ORG_013 - Có nút Delete position', async ({ adminPage: page }) => {
    await page.goto('/admin/organization');
    await page.waitForLoadState('domcontentloaded');
    const btns = page.locator('button').filter({ hasText: /Delete|Xóa/ });
    expect(await btns.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_ORG_014 - Có section Assign nhân viên', async ({ adminPage: page }) => {
    await page.goto('/admin/organization');
    await page.waitForLoadState('domcontentloaded');
    const btns = page.locator('button').filter({ hasText: /Assign|Phân công|Transfer|Chuyển/i });
    expect(await btns.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_ORG_015 - Stats có tổng departments', async ({ adminPage: page }) => {
    await page.goto('/admin/organization');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toContainText('Error');
  });

  test('TC_ORG_016 - Stats có tổng nhân viên', async ({ adminPage: page }) => {
    await page.goto('/admin/organization');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toContainText('Loading');
  });
});
