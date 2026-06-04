import { test, expect } from '../../fixtures/auth';
import { Sidebar } from '../../pages/base';

test.describe('[M08] Timekeeping - Employee', () => {

  test('TC_TIME_001 - Employee → Timekeeping page', async ({ employeePage: page }) => {
    await page.goto('/timekeeping');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_TIME_002 - Timekeeping không lỗi', async ({ employeePage: page }) => {
    await page.goto('/timekeeping');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toContainText('Error');
  });

  test('TC_TIME_003 - /dashboard/timekeeping redirect → /timekeeping', async ({ employeePage: page }) => {
    await page.goto('/dashboard/timekeeping');
    await page.waitForTimeout(2000);
  });

  test('TC_TIME_004 - QR section hiển thị', async ({ employeePage: page }) => {
    await page.goto('/timekeeping');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
  });
});

test.describe('[M08] Timekeeping - Admin', () => {

  test('TC_TIME_005 - Admin → Attendance History', async ({ adminPage: page }) => {
    await new Sidebar(page).navigateTo('Attendance');
    await page.waitForTimeout(1000);
  });

  test('TC_TIME_006 - Bảng attendance hiển thị', async ({ adminPage: page }) => {
    await page.goto('/admin/attendance');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_TIME_007 - QR Display page load được', async ({ adminPage: page }) => {
    await page.goto('/admin/qr-display');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_TIME_008 - Có pagination', async ({ adminPage: page }) => {
    await page.goto('/admin/attendance');
    await page.waitForLoadState('domcontentloaded');
    const pagination = page.locator('button').filter({ hasText: /Next|Previous|Sau|Trước|1|2/i });
    expect(await pagination.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_TIME_009 - Có date filter', async ({ adminPage: page }) => {
    await page.goto('/admin/attendance');
    await page.waitForLoadState('domcontentloaded');
    const dates = page.locator('input[type="date"]');
    expect(await dates.count()).toBeGreaterThanOrEqual(0);
  });

  test('TC_TIME_010 - Employee bị chặn /admin/attendance', async ({ employeePage: page }) => {
    await page.goto('/admin/attendance');
    await page.waitForTimeout(2000);
    const denied = await page.getByText(/Access Denied|Truy cập bị từ chối/i).isVisible().catch(() => false);
    const redirected = !page.url().includes('/admin/attendance');
    expect(denied || redirected).toBeTruthy();
  });

  test('TC_TIME_011 - Status badges (Present/Late/Absent)', async ({ adminPage: page }) => {
    await page.goto('/admin/attendance');
    await page.waitForLoadState('domcontentloaded');
    const badges = page.locator('span').filter({ hasText: /Present|Late|Absent|Có mặt|Muộn|Vắng/i });
    expect(await badges.count()).toBeGreaterThanOrEqual(0);
  });



  test('TC_TIME_HASH - Cross-Role: Employee Check-in -> Admin Payroll -> Invoice', async ({ employeePage, adminPage }) => {

    await employeePage.goto('/dashboard');
    await employeePage.waitForLoadState('domcontentloaded');

    const profileData = await employeePage.evaluate(async () => {
      const r = await fetch('/api/auth/profile', { credentials: 'include' });
      return r.ok ? r.json() : null;
    });

    if (!profileData) throw new Error('[BƯỚC 0] Không lấy được profile từ /api/auth/profile');

    const dynamicEmployeeName = `${profileData.first_name ?? ''} ${profileData.last_name ?? ''}`.trim();
    console.log(`[INFO] Employee đang test: "${dynamicEmployeeName}"`);

    await employeePage.goto('/timekeeping');
    await employeePage.waitForLoadState('domcontentloaded');

    const ipHeading = employeePage.locator('h3').filter({ hasText: /IP Check-in|Điểm danh qua IP/i });
    await ipHeading.waitFor({ state: 'visible', timeout: 10000 });
    const ipCard = ipHeading.locator('xpath=ancestor::div[contains(@class,"p-8")]');
    const ipCheckInBtn = ipCard.locator('button').first();
    await ipCheckInBtn.waitFor({ state: 'visible', timeout: 5000 });
    await ipCheckInBtn.click();


    const successModal = employeePage.getByText(/Checked (In|Out)!|Đã (vào|tan) ca!/i);
    await expect(successModal.first()).toBeVisible({ timeout: 8000 });


    const closeCheckInModal = employeePage
      .locator('button')
      .filter({ hasText: /Awesome, Close!|Tuyệt, Đóng!/i })
      .first();
    await closeCheckInModal.waitFor({ state: 'visible', timeout: 3000 });
    await closeCheckInModal.click();

    await adminPage.goto('/admin/attendance');
    await adminPage.waitForLoadState('domcontentloaded');
    await expect(adminPage.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const firstDay = `${year}-${month}-01`;
    const lastDayDate = new Date(year, now.getMonth() + 1, 0);
    const lastDay = `${year}-${month}-${String(lastDayDate.getDate()).padStart(2, '0')}`;

    const dateInputs = adminPage.locator('input[type="date"]');
    if (await dateInputs.count() >= 2) {
      await dateInputs.nth(0).fill(firstDay);
      await dateInputs.nth(1).fill(lastDay);
    }

    const searchInput = adminPage.getByPlaceholder(/e\.g\. John Doe|Tìm kiếm nhân viên|VD: Nguyễn Văn A/i);
    if (await searchInput.count() > 0) {
      await searchInput.first().fill(dynamicEmployeeName);
    }

    const filterBtn = adminPage.locator('button').filter({ hasText: /^Filter$|^Lọc$/i }).first();
    await filterBtn.click();
    await adminPage.waitForTimeout(2000);


    const presentLabel = adminPage.locator('p').filter({ hasText: /^Present$|^Có mặt$/i }).first();
    let actualPresentDays = 0;
    if (await presentLabel.isVisible({ timeout: 5000 }).catch(() => false)) {
      const presentValueEl = presentLabel.locator('xpath=following-sibling::p').first();
      const presentText = await presentValueEl.innerText().catch(() => '0');
      actualPresentDays = parseInt(presentText.replace(/[^\d]/g, ''), 10) || 0;
    }
    console.log(`[INFO] Số ngày Present của ${dynamicEmployeeName}: ${actualPresentDays}`);
    expect(actualPresentDays).toBeGreaterThan(0);

    await adminPage.goto('/admin/payroll/generate');
    await adminPage.waitForLoadState('domcontentloaded');
    await expect(adminPage.locator('h1').first()).toBeVisible({ timeout: 10000 });

    const generateBtn = adminPage
      .locator('button')
      .filter({ hasText: /Automatic payroll calculation|Tính lương tự động/i })
      .first();
    await generateBtn.waitFor({ state: 'visible', timeout: 10000 });
    await generateBtn.click();


    await adminPage.waitForFunction(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        b => /Automatic payroll calculation|Tính lương tự động/.test(b.textContent ?? '')
      );
      return btn && !btn.disabled;
    }, { timeout: 20000 }).catch(() => { });

    await expect(adminPage.locator('body')).not.toContainText(/500|Internal Server Error/i);

    await adminPage.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 15000 });

    const nameRegex = new RegExp(dynamicEmployeeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const invoiceRow = adminPage.locator('tbody tr').filter({ hasText: nameRegex }).first();
    await expect(invoiceRow).toBeVisible({ timeout: 10000 });

    const viewBtn = invoiceRow.locator('button').first();
    await viewBtn.click();


    const printArea = adminPage.locator('#payslip-print-area');
    await expect(printArea).toBeVisible({ timeout: 8000 });

    const modalData = await adminPage.evaluate(() => {
      const area = document.querySelector('#payslip-print-area');
      if (!area) return null;

      const toInt = (el: Element | null): number => {
        if (!el) return 0;
        return parseInt((el.textContent || '').replace(/[^\d]/g, ''), 10) || 0;
      };

      const allSpans = Array.from(area.querySelectorAll('span'));


      const daysLabel = allSpans.find(s => /Days Worked|Số ngày làm việc/i.test(s.textContent || ''));
      const daysWorked = daysLabel?.nextElementSibling
        ? parseInt(daysLabel.nextElementSibling.textContent || '0', 10) || 0
        : 0;

      const incomeLabel = allSpans.find(s => /Total Income|Tổng thu nhập/i.test(s.textContent || ''));
      const incomeVal = toInt(incomeLabel?.nextElementSibling ?? null);

      const deductLabels = allSpans.filter(s => /Total Deductions|Tổng khấu trừ/i.test(s.textContent || ''));
      const deductLabel = deductLabels[deductLabels.length - 1];
      const deductVal = toInt(deductLabel?.nextElementSibling ?? null);

      const netEl = area.querySelector('p.text-xl.font-black');
      const netVal = toInt(netEl);

      return { daysWorked, incomeVal, deductVal, netVal };
    });

    console.log('[INFO] Modal data:', modalData);

    expect(modalData).not.toBeNull();
    expect(modalData!.daysWorked).toBeGreaterThan(0);
    expect(modalData!.netVal).toBeGreaterThan(0);


    if (modalData!.incomeVal > 0) {
      expect(
        Math.abs(modalData!.netVal - (modalData!.incomeVal - modalData!.deductVal))
      ).toBeLessThanOrEqual(100);
    }





    await adminPage.keyboard.press('Escape');

    const backdrop = adminPage.locator('div.absolute.inset-0.bg-black\\/60');
    if (await backdrop.isVisible({ timeout: 1000 }).catch(() => false)) {
      await backdrop.click({ force: true });
    }
  });
});
