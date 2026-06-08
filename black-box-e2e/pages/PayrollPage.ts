import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Payroll pages:
 *   - /admin/payroll/adjustment  (Salary Adjustments)
 *   - /admin/payroll/generate    (Create Payroll)
 *   - /admin/payroll/config      (Salary Configuration)
 *   - /admin/payroll/issue       (Issue Payslips)
 */

// ─── Adjustments ──────────────────────────────────────────────────────────────
export class PayrollAdjustmentPage {
  readonly pageTitle = this.page.getByRole('heading', { name: /Salary Adjustments/i });
  readonly createForm = this.page.locator('form');
  readonly employeeSelect = this.createForm.locator('select').first();
  readonly typeBonusBtn = this.createForm.locator('button[type="button"]').filter({ hasText: /Bonus/i });
  readonly typePenaltyBtn = this.createForm.locator('button[type="button"]').filter({ hasText: /Penalty/i });
  readonly amountInput = this.createForm.locator('input[type="number"]');
  readonly monthInput = this.createForm.locator('input[type="month"]');
  readonly reasonTextarea = this.createForm.locator('textarea');
  readonly submitBtn = this.createForm.locator('button[type="submit"]');

  // Tab filters — scoped to the tab group container (not the form's type toggle)
  private readonly tabGroup = this.page.locator('.flex.items-center.gap-1.bg-gray-100');
  readonly tabAll = this.tabGroup.locator('button').filter({ hasText: /^All$/i });
  readonly tabBonus = this.tabGroup.locator('button').filter({ hasText: /^Bonus$/i });
  readonly tabPenalty = this.tabGroup.locator('button').filter({ hasText: /^Penalty$/i });

  readonly historyTable = this.page.locator('table');
  readonly historyRows = () => this.page.locator('table tbody tr');

  readonly adjustTypeBadge = (text: string) =>
    this.page.locator('span').filter({ hasText: new RegExp(`^${text}$`, 'i') });

  constructor(public readonly page: Page) {}

  async goto() { await this.page.goto('/admin/payroll/adjustment'); }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 });
  }

  async selectEmployee(label: string) {
    await this.employeeSelect.selectOption({ label });
  }

  async selectType(type: 'Bonus' | 'Penalty') {
    if (type === 'Bonus') await this.typeBonusBtn.click();
    else await this.typePenaltyBtn.click();
  }

  async fillAmount(amount: string) {
    await this.amountInput.fill(amount);
  }

  async fillMonth(value: string) {
    await this.monthInput.fill(value);
  }

  async fillReason(text: string) {
    await this.reasonTextarea.fill(text);
  }

  async submit() {
    await this.submitBtn.click();
  }

  async switchTab(tab: 'All' | 'Bonus' | 'Penalty') {
    if (tab === 'All') await this.tabAll.click();
    else if (tab === 'Bonus') await this.tabBonus.click();
    else await this.tabPenalty.click();
    await this.page.waitForTimeout(300);
  }

  async getHistoryRowCount(): Promise<number> {
    return this.historyRows().count();
  }

  /** Delete the first row in history by clicking its trash icon */
  async deleteFirstRow() {
    const firstDelete = this.historyRows().first().locator('svg.lucide-trash2, button').filter({ has: this.page.locator('svg.lucide-trash2') }).first();
    await firstDelete.click();
  }
}

// ─── Generate ─────────────────────────────────────────────────────────────────
export class PayrollGeneratePage {
  readonly pageTitle = this.page.getByRole('heading', { name: /Create Payroll/i });
  readonly monthSelect = this.page.locator('select').nth(0);
  readonly yearSelect = this.page.locator('select').nth(1);
  readonly generateBtn = this.page.getByRole('button', { name: /Automatic payroll calculation/i });
  readonly approveAllBtn = this.page.getByRole('button', { name: /Approve payroll/i });
  readonly payslipTable = this.page.locator('table');
  readonly payslipRows = () => this.page.locator('table tbody tr');
  readonly emptyState = this.page.getByText(/No payslips yet/i);

  // Summary cards
  readonly summaryCards = this.page.locator('.grid.grid-cols-2.lg\\:grid-cols-5, .grid.grid-cols-2');

  // Payslip detail modal (PayslipDetailModal)
  readonly detailModal = this.page.locator('.fixed.inset-0.z-\\[9999\\]');
  readonly detailPrintArea = this.page.locator('#payslip-print-area');
  readonly detailCloseBtn = this.detailModal.locator('button').filter({ hasText: /Close/i }).first();

  constructor(public readonly page: Page) {}

  async goto() { await this.page.goto('/admin/payroll/generate'); }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.pageTitle.or(this.page.locator('h1').first())).toBeVisible({ timeout: 10000 });
  }

  async selectMonth(month: string) {
    await this.monthSelect.selectOption(month);
  }

  async selectYear(year: string) {
    await this.yearSelect.selectOption(year);
  }

  async clickGenerate() {
    await this.generateBtn.click();
  }

  async getPayslipRowCount(): Promise<number> {
    return this.payslipRows().count();
  }

  /** Click the first Eye (view) button in the payslip table */
  async viewFirstPayslip() {
    const viewBtn = this.payslipRows().first().locator('button').first();
    await viewBtn.click();
    await expect(this.detailPrintArea).toBeVisible({ timeout: 8000 });
  }

  /** Close the detail modal by clicking overlay backdrop or Escape */
  async closeDetailModal() {
    // Try Escape first
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(500);
    // If modal is still visible, click the overlay backdrop
    if (await this.detailModal.isVisible({ timeout: 1000 }).catch(() => false)) {
      // Click the overlay (blur + backdrop)
      await this.page.locator('.fixed.inset-0.z-\\[9999\\]').first().click({ position: { x: 10, y: 10 } });
      await this.page.waitForTimeout(500);
    }
    await expect(this.detailModal).not.toBeVisible({ timeout: 5000 });
  }

  waitForGenerateResponse() {
    return this.page.waitForResponse(
      (resp) => resp.url().includes('/api/payroll/generate') && resp.request().method() === 'POST',
      { timeout: 30000 }
    );
  }
}

// ─── Config ───────────────────────────────────────────────────────────────────
export class PayrollConfigPage {
  readonly pageTitle = this.page.getByRole('heading', { name: /Salary Configuration/i });
  readonly configTable = this.page.locator('table');
  readonly configRows = () => this.page.locator('table tbody tr');
  readonly editBtns = this.page.locator('button').filter({ hasText: /Edit/i });

  // Edit modal
  readonly editModal = this.page.locator('.fixed.inset-0.z-\\[100\\]');
  readonly baseSalaryInput = this.editModal.locator('input[type="number"]').nth(0);
  readonly transportInput = this.editModal.locator('input[type="number"]').nth(1);
  readonly lunchInput = this.editModal.locator('input[type="number"]').nth(2);
  readonly responsibilityInput = this.editModal.locator('input[type="number"]').nth(3);
  readonly kpiInput = this.editModal.locator('input[type="number"]').nth(4);
  readonly saveConfigBtn = this.editModal.getByRole('button', { name: /Save Configuration/i });
  readonly cancelBtn = this.editModal.getByRole('button', { name: /Cancel/i });

  constructor(public readonly page: Page) {}

  async goto() { await this.page.goto('/admin/payroll/config'); }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 });
  }

  async getRowCount(): Promise<number> {
    return this.configRows().count();
  }
}

// ─── Issue ────────────────────────────────────────────────────────────────────
export class PayrollIssuePage {
  readonly pageTitle = this.page.getByRole('heading', { name: /Issue Payslips/i });
  readonly monthSelect = this.page.locator('select').nth(0);
  readonly yearSelect = this.page.locator('select').nth(1);
  readonly deptSelect = this.page.locator('select').nth(2);
  readonly sendBulkBtn = this.page.getByRole('button', { name: /Send bulk/i });
  readonly payslipTable = this.page.locator('table');

  constructor(public readonly page: Page) {}

  async goto() { await this.page.goto('/admin/payroll/issue'); }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 });
  }
}

// ─── Employee Salary ──────────────────────────────────────────────────────────
export class EmployeeSalaryPage {
  readonly payslipTable = this.page.locator('table');
  readonly viewBtns = this.page.getByRole('button', { name: /View|Xem/i });

  // Detail modal (same PayslipDetailModal)
  readonly detailModal = this.page.locator('.fixed.inset-0.z-\\[9999\\]');
  readonly detailPrintArea = this.page.locator('#payslip-print-area');

  constructor(public readonly page: Page) {}

  async goto() { await this.page.goto('/dashboard/salary'); }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  }
}
