import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the Employee Leave Dashboard (/dashboard/leave).
 *
 * UI Sections:
 *   1. Balance Cards     – "My Leave Balance" with per-type remaining days
 *   2. Request Form       – Leave Type select, Start/End DatePickers, Reason textarea, Submit + Clear
 *   3. History Table      – "My Request History" with View / Delete actions
 *   4. Detail Modal       – Request detail with ContextualChat
 *   5. Delete Confirmation – Confirmation dialog for deleting a pending request
 *   6. Toast Notifications – Success/Error toasts
 */
export class LeaveDashboardPage {
  // ─── Section 1: Balance Cards ───────────────────────────────────────────
  // CardTitle renders as <div> (not h3/h2) in shadcn/ui
  readonly balanceSection = this.page.locator('div').filter({ hasText: /My Leave Balance/i }).first();
  // Balance cards: each is a .rounded-2xl div inside the grid
  readonly balanceCards = this.page.locator('.rounded-2xl').filter({ hasText: /days left/i });
  readonly balanceCardByType = (leaveTypeName: string) =>
    this.balanceCards.filter({ hasText: leaveTypeName });
  readonly balanceDaysValue = (leaveTypeName: string) =>
    this.balanceCardByType(leaveTypeName).locator('span.text-4xl');

  // ─── Section 2: Request Form ────────────────────────────────────────────
  readonly formSection = this.page.locator('div').filter({ hasText: /Submit New Request/i }).first();
  readonly leaveTypeSelect = this.page.getByRole('combobox');
  readonly leaveTypeSelectItems = this.page.locator('[role="option"]');
  readonly startDateInput = this.page.getByPlaceholder('Select start date');
  readonly endDateInput = this.page.getByPlaceholder('Select end date');
  readonly reasonTextarea = this.page.getByPlaceholder(/Briefly explain your reason/i);
  readonly submitButton = this.page.getByRole('button', { name: /Submit Request/i });
  readonly clearButton = this.page.getByRole('button', { name: /Clear/i });
  readonly durationBanner = this.page.locator('.bg-blue-50');

  // ─── Section 3: History Table ───────────────────────────────────────────
  readonly historySection = this.page.locator('div').filter({ hasText: /My Request History/i }).first();
  readonly historyTable = this.page.locator('table');
  readonly historyRows = this.page.locator('table tbody tr');
  readonly historyNoData = this.page.getByText(/No leave requests found/i);

  // ─── Section 4: Detail Modal ────────────────────────────────────────────
  readonly detailModal = this.page.locator('[role="dialog"]');
  readonly detailModalTitle = this.page.locator('[role="dialog"] h2');
  readonly detailModalStatus = this.page.locator('[role="dialog"] .bg-white\\/20');
  readonly detailModalStartDate = this.page.locator('[role="dialog"]').locator('.grid.grid-cols-3 > div').nth(0);
  readonly detailModalEndDate = this.page.locator('[role="dialog"]').locator('.grid.grid-cols-3 > div').nth(1);
  readonly detailModalDuration = this.page.locator('[role="dialog"]').locator('.grid.grid-cols-3 > div').nth(2);

  // ─── Section 4b: Chat inside Detail Modal ───────────────────────────────
  readonly chatContainer = this.page.locator('[role="dialog"] form').locator('..');
  readonly chatMessages = this.page.locator('[role="dialog"] .flex-1.overflow-y-auto > div');
  readonly chatEmptyState = this.page.getByText(/No messages yet/i);
  readonly chatInput = this.page.locator('[role="dialog"]').getByPlaceholder('Type your reply...');
  readonly chatSendButton = this.page.locator('[role="dialog"]').locator('button[type="submit"]');
  readonly chatBubble = (text: string) =>
    this.page.locator('[role="dialog"]').locator('.px-4.py-2\\.5.rounded-2xl').filter({ hasText: text }).first();

  // View / Delete action buttons within history rows
  readonly viewButtons = this.page.getByRole('button', { name: /View/i });
  readonly deleteButtons = this.page.getByRole('button', { name: /Delete/i });

  // ─── Section 5: Delete Confirmation Modal ───────────────────────────────
  readonly deleteConfirmModal = this.page.locator('[role="dialog"]').filter({ hasText: /Delete Request/i });
  readonly deleteCancelButton = this.deleteConfirmModal.getByRole('button', { name: /Cancel/i });
  readonly deleteConfirmButton = this.deleteConfirmModal.getByRole('button', { name: /^Delete$/i });

  // ─── Section 6: Toast Notifications ─────────────────────────────────────
  readonly successToast = this.page.locator('.bg-green-50');
  readonly errorToast = this.page.locator('.bg-red-50');
  readonly toastTitle = (type: 'success' | 'error') =>
    (type === 'success' ? this.successToast : this.errorToast).locator('h3');
  readonly toastDescription = (type: 'success' | 'error') =>
    (type === 'success' ? this.successToast : this.errorToast).locator('p');

  constructor(public readonly page: Page) {}

  // ─── Navigation ─────────────────────────────────────────────────────────
  async goto() {
    await this.page.goto('/dashboard/leave');
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page.getByRole('heading', { name: /Leave Management/i })).toBeVisible({ timeout: 10000 });
  }

  async reloadPage() {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  // ─── Balance Actions ────────────────────────────────────────────────────
  async getBalanceCardsCount(): Promise<number> {
    await expect(this.balanceCards.first()).toBeVisible({ timeout: 5000 });
    return this.balanceCards.count();
  }

  async getBalanceForType(leaveTypeName: string): Promise<number | null> {
    const daysEl = this.balanceDaysValue(leaveTypeName);
    if ((await daysEl.count()) === 0) return null;
    const text = await daysEl.innerText();
    return parseFloat(text.trim());
  }

  async getAllBalances(): Promise<Record<string, number>> {
    const cards = this.balanceCards;
    const count = await cards.count();
    const balances: Record<string, number> = {};
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const typeText = await card.locator('.text-sm.text-gray-500.font-bold.uppercase').innerText();
      const daysText = await card.locator('span.text-4xl').innerText();
      balances[typeText.trim()] = parseFloat(daysText.trim());
    }
    return balances;
  }

  // ─── Form Actions ───────────────────────────────────────────────────────
  async selectLeaveType(typeName: string) {
    await this.leaveTypeSelect.click();
    await expect(this.leaveTypeSelectItems.first()).toBeVisible({ timeout: 3000 });
    const option = this.page.getByRole('option', { name: new RegExp(typeName) });
    await option.click();
  }

  /**
   * Pick a date by filling the react-datepicker input directly.
   * Format: DD/MM/YYYY.  Tab out to trigger onChange.
   */
  async setStartDate(date: Date) {
    await this.startDateInput.click();
    await this.startDateInput.fill(this.formatDate(date));
    await this.startDateInput.press('Tab');
  }

  async setEndDate(date: Date) {
    await this.endDateInput.click();
    await this.endDateInput.fill(this.formatDate(date));
    await this.endDateInput.press('Tab');
  }

  async fillReason(reason: string) {
    await this.reasonTextarea.fill(reason);
  }

  async clearReason() {
    await this.reasonTextarea.clear();
  }

  async submitRequest() {
    await this.submitButton.click();
  }

  async clearForm() {
    await this.clearButton.click();
    // After clearing, form fields should be reset
    await expect(this.leaveTypeSelect).toBeVisible({ timeout: 3000 });
  }

  async isSubmitDisabled(): Promise<boolean> {
    return this.submitButton.isDisabled();
  }

  async getDurationBannerDays(): Promise<number | null> {
    const banner = this.durationBanner;
    if ((await banner.count()) === 0) return null;
    const text = await banner.locator('.text-lg.font-bold').textContent();
    if (!text) return null;
    return parseInt(text, 10);
  }

  /**
   * Fill the complete form (leave type + dates + reason) for a quick submission.
   */
  async fillLeaveForm(leaveType: string, startDate: Date, endDate: Date, reason?: string) {
    await this.selectLeaveType(leaveType);
    await this.setStartDate(startDate);
    await this.setEndDate(endDate);
    if (reason) {
      await this.fillReason(reason);
    }
  }

  // ─── History Actions ────────────────────────────────────────────────────
  async getHistoryRowCount(): Promise<number> {
    // Count only rows that have data (not the "No leave requests" row)
    const rows = this.page.locator('table tbody tr:not(:has(td[colspan]))');
    return rows.count();
  }

  async getHistoryRowByIndex(index: number) {
    const rows = this.page.locator('table tbody tr:not(:has(td[colspan]))');
    const row = rows.nth(index);
    if ((await row.count()) === 0) return null;

    const cells = row.locator('td');
    return {
      type: (await cells.nth(0).textContent()) || '',
      period: (await cells.nth(1).textContent()) || '',
      days: (await cells.nth(2).textContent()) || '',
      status: (await cells.nth(3).textContent()) || '',
      reason: (await cells.nth(4).textContent()) || '',
    };
  }

  /**
   * Find the first row with a given status (case-insensitive) and return its index.
   * Returns -1 if not found.
   */
  async findRowByStatus(status: string): Promise<number> {
    const rows = this.page.locator('table tbody tr:not(:has(td[colspan]))');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const statusCell = rows.nth(i).locator('td').nth(3);
      const text = ((await statusCell.textContent()) || '').toLowerCase();
      if (text.includes(status.toLowerCase())) {
        return i;
      }
    }
    return -1;
  }

  async viewRequestByIndex(index: number) {
    const rows = this.page.locator('table tbody tr:not(:has(td[colspan]))');
    const row = rows.nth(index);
    const viewBtn = row.getByRole('button', { name: /View/i });
    await viewBtn.click();
    await expect(this.detailModal).toBeVisible({ timeout: 5000 });
  }

  async deleteRequestByIndex(index: number) {
    const rows = this.page.locator('table tbody tr:not(:has(td[colspan]))');
    const row = rows.nth(index);
    const deleteBtn = row.getByRole('button', { name: /Delete/i });
    await deleteBtn.click();
    await expect(this.deleteConfirmModal).toBeVisible({ timeout: 3000 });
  }

  async confirmDelete() {
    await this.deleteConfirmButton.click();
    await expect(this.deleteConfirmModal).not.toBeVisible({ timeout: 5000 });
  }

  async cancelDelete() {
    await this.deleteCancelButton.click();
    await expect(this.deleteConfirmModal).not.toBeVisible({ timeout: 3000 });
  }

  async closeDetailModal() {
    const closeBtn = this.detailModal.locator('button.rounded-full').first();
    if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await closeBtn.click();
    } else {
      await this.page.keyboard.press('Escape');
    }
    await expect(this.detailModal).not.toBeVisible({ timeout: 3000 });
  }

  // ─── Chat Actions ───────────────────────────────────────────────────────
  async sendChatMessage(message: string) {
    await this.chatInput.fill(message);
    await expect(this.chatSendButton).toBeEnabled({ timeout: 2000 });
    await this.chatSendButton.click();
  }

  async getChatMessageCount(): Promise<number> {
    return this.chatMessages.count();
  }

  async hasChatMessageContaining(text: string): Promise<boolean> {
    const bubble = this.chatBubble(text);
    return bubble.isVisible({ timeout: 5000 }).catch(() => false);
  }

  async isChatSendDisabled(): Promise<boolean> {
    return this.chatSendButton.isDisabled();
  }

  // ─── Network Helpers ────────────────────────────────────────────────────
  waitForSubmitResponse() {
    return this.page.waitForResponse(
      (resp) => resp.url().includes('/api/leave/request') && resp.request().method() === 'POST',
      { timeout: 15000 }
    );
  }

  waitForDeleteResponse() {
    return this.page.waitForResponse(
      (resp) => resp.url().includes('/api/leave/request/') && resp.request().method() === 'DELETE',
      { timeout: 15000 }
    );
  }

  // ─── Toast Helpers ──────────────────────────────────────────────────────
  async waitForSuccessToast(text?: string) {
    await expect(this.successToast.first()).toBeVisible({ timeout: 5000 });
    if (text) {
      await expect(this.successToast.filter({ hasText: text }).first()).toBeVisible({ timeout: 3000 });
    }
  }

  async waitForErrorToast(text?: string) {
    await expect(this.errorToast.first()).toBeVisible({ timeout: 5000 });
    if (text) {
      await expect(this.errorToast.filter({ hasText: text }).first()).toBeVisible({ timeout: 3000 });
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────
  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
