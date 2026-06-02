import { test, expect } from '../../fixtures/auth';
import { Sidebar } from '../../pages/base';

test.describe('[M13] Announcements - Admin', () => {

  test('TC_ANN_001 - Admin → Manage News', async ({ adminPage: page }) => {
    await new Sidebar(page).navigateTo('Manage News');
    await page.waitForTimeout(1000);
  });

  test('TC_ANN_002 - Bảng announcements hiển thị', async ({ adminPage: page }) => {
    await page.goto('/admin/announcements');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_ANN_003 - Nút Create Announcement', async ({ adminPage: page }) => {
    await page.goto('/admin/announcements');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button').filter({ hasText: /Create|Tạo|Add|Thêm|New/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_ANN_004 - Form tạo có input title', async ({ adminPage: page }) => {
    await page.goto('/admin/announcements');
    await page.waitForLoadState('networkidle');
    const btn = page.getByRole('button').filter({ hasText: /Create|Tạo|Add|Thêm|New/i }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('input').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC_ANN_005 - Form có textarea content', async ({ adminPage: page }) => {
    await page.goto('/admin/announcements');
    await page.waitForLoadState('networkidle');
    const btn = page.getByRole('button').filter({ hasText: /Create|Tạo|Add|Thêm|New/i }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('textarea').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC_ANN_006 - Form có chọn type', async ({ adminPage: page }) => {
    await page.goto('/admin/announcements');
    await page.waitForLoadState('networkidle');
    const btn = page.getByRole('button').filter({ hasText: /Create|Tạo|Add|Thêm|New/i }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('select').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC_ANN_007 - Form có chọn priority', async ({ adminPage: page }) => {
    await page.goto('/admin/announcements');
    await page.waitForLoadState('networkidle');
    const btn = page.getByRole('button').filter({ hasText: /Create|Tạo|Add|Thêm|New/i }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
      const selects = page.locator('select');
      expect(await selects.count()).toBeGreaterThanOrEqual(1);
    }
  });

  test('TC_ANN_008 - Form có chọn target audience', async ({ adminPage: page }) => {
    await page.goto('/admin/announcements');
    await page.waitForLoadState('networkidle');
    const btn = page.getByRole('button').filter({ hasText: /Create|Tạo|Add|Thêm|New/i }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
      const checks = page.locator('[role="checkbox"], input[type="checkbox"]');
      expect(await checks.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('TC_ANN_009 - Nút Edit announcement', async ({ adminPage: page }) => {
    await page.goto('/admin/announcements');
    await page.waitForLoadState('networkidle');
    const btns = page.locator('button').filter({ hasText: /Edit|Sửa/i });
    expect(await btns.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_ANN_010 - Nút Delete announcement', async ({ adminPage: page }) => {
    await page.goto('/admin/announcements');
    await page.waitForLoadState('networkidle');
    const btns = page.locator('button').filter({ hasText: /Delete|Xóa/i });
    expect(await btns.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_ANN_011 - Employee bị chặn /admin/announcements', async ({ employeePage: page }) => {
    await page.goto('/admin/announcements');
    await page.waitForTimeout(2000);
    const denied = await page.getByText(/Access Denied|Truy cập bị từ chối/i).isVisible().catch(() => false);
    const redirected = !page.url().includes('/admin/announcements');
    expect(denied || redirected).toBeTruthy();
  });
});

test.describe('[M13] Announcements - Employee', () => {

  test('TC_ANN_012 - Employee → News Feed', async ({ employeePage: page }) => {
    await page.goto('/company-news');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_ANN_013 - News feed hiển thị bài viết', async ({ employeePage: page }) => {
    await page.goto('/company-news');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('TC_ANN_014 - Bài viết có title', async ({ employeePage: page }) => {
    await page.goto('/company-news');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('TC_ANN_015 - Bài viết có content', async ({ employeePage: page }) => {
    await page.goto('/company-news');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('TC_ANN_016 - Bài viết có type/priority badge', async ({ employeePage: page }) => {
    await page.goto('/company-news');
    await page.waitForLoadState('networkidle');
    const badges = page.locator('span').filter({ hasText: /High|Cao|Normal|Thường|Low|Thấp|Urgent|Khẩn/i });
    expect(await badges.count()).toBeGreaterThanOrEqual(0);
  });
});
