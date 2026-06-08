import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the Admin Leave Approvals page (/admin/leave-approvals).
 *
 * UI Sections:
 *   1. Header            – Title + subtitle + status message toast
 *   2. Stats Cards       – Total / Pending / Approved / Rejected counts
 *   3. Filter Bar        – Employee search, From/To Date, Clear Filters
 *   4. View Toggle       – Split view vs List view
 *   5. Tab Filters       – Pending / Approved / Rejected tabs
 *   6. Request List      – Employee cards (split) or table rows (list)
 *   7. Detail Panel      – Employee info, leave info, discussion chat
 *   8. Actions Footer    – Approve / Reject / Revoke buttons
 *   9. Confirm Modal     – Confirmation dialog with optional note
 *  10. Access Denied     – Shown when user lacks permission
 */
export class LeaveApprovalPage {
  // ─── Section 1: Header ──────────────────────────────────────────────────
  readonly pageTitle = this.page.getByRole('heading', { name: /Leave Approvals/i });
  readonly pageSubtitle = this.page.getByText(/Review and manage employee leave requests/i);
  readonly accessDenied = this.page.getByText(/Access Denied/i);
  readonly noPermission = this.page.getByText(/do not have permission/i);

  // ─── Section 2: Stats Cards ─────────────────────────────────────────────
  private readonly statsGrid = this.page.locator('.grid.grid-cols-1.md\\:grid-cols-4');
  readonly statsTotalCard = this.statsGrid.locator('> div').nth(0);
  readonly statsPendingCard = this.statsGrid.locator('> div').nth(1);
  readonly statsApprovedCard = this.statsGrid.locator('> div').nth(2);
  readonly statsRejectedCard = this.statsGrid.locator('> div').nth(3);

  // ─── Section 3: Filter Bar ──────────────────────────────────────────────
  readonly searchEmployeeInput = this.page.locator('#search-emp');
  readonly filterFromDate = this.page.locator('[placeholder="From Date..."]');
  readonly filterToDate = this.page.locator('[placeholder="To Date..."]');
  readonly clearFiltersButton = this.page.getByRole('button', { name: /Clear Filters/i });

  // ─── Section 4: View Toggle ─────────────────────────────────────────────
  readonly splitViewButton = this.page.getByRole('button', { name: /Split/i });
  readonly listViewButton = this.page.getByRole('button', { name: /List/i });

  // ─── Section 5: Tab Filters ─────────────────────────────────────────────
  readonly pendingTab = this.page.locator('button').filter({ hasText: /^Pending$/i });
  readonly approvedTab = this.page.locator('button').filter({ hasText: /^Approved$/i });
  readonly rejectedTab = this.page.locator('button').filter({ hasText: /^Rejected$/i });

  // ─── Section 6: Split View Request List ─────────────────────────────────
  readonly splitListItems = () =>
    this.page.locator('.lg\\:col-span-1 .divide-y.divide-gray-100 > div.cursor-pointer');
  readonly splitListContainer = this.page.locator('.lg\\:col-span-1 .overflow-y-auto');

  // ─── Section 6b: List/Table View ────────────────────────────────────────
  readonly requestTable = this.page.locator('table');
  readonly tableDataRows = () =>
    this.page.locator('table tbody tr:not(:has(td[colspan]))');

  // ─── Section 7: Detail Panel (Split View) ───────────────────────────────
  readonly detailPanel = this.page.locator('.lg\\:col-span-2');
  readonly detailPlaceholder = this.detailPanel.getByText(/Click on any leave request/i);
  readonly detailTitle = this.detailPanel.getByRole('heading', { name: /Request Details/i });
  readonly detailLeaveTypeValue = () =>
    this.detailPanel.locator('.grid.grid-cols-2.md\\:grid-cols-5 > div').nth(0).locator('.font-semibold');
  readonly detailRemainingBalanceValue = () =>
    this.detailPanel.locator('.grid.grid-cols-2.md\\:grid-cols-5 > div').nth(1).locator('.font-semibold');
  readonly detailFromDateValue = () =>
    this.detailPanel.locator('.grid.grid-cols-2.md\\:grid-cols-5 > div').nth(2).locator('.font-semibold');
  readonly detailToDateValue = () =>
    this.detailPanel.locator('.grid.grid-cols-2.md\\:grid-cols-5 > div').nth(3).locator('.font-semibold');
  readonly detailDurationValue = () =>
    this.detailPanel.locator('.grid.grid-cols-2.md\\:grid-cols-5 > div').nth(4).locator('.font-semibold');
  readonly detailReason = this.detailPanel.locator('.bg-gray-50.p-4.rounded-lg');

  // Employee info section
  readonly detailEmployeeName = this.detailPanel.locator('p.font-semibold').filter({ hasText: /.+/ }).first();
  readonly detailEmployeeEmail = this.detailPanel.locator('p.font-medium').first();

  // ─── Section 8: Actions Footer ──────────────────────────────────────────
  // Only target buttons inside the detail panel footer (not the list view)
  readonly approveButton = this.detailPanel.locator('button.bg-green-600');
  readonly rejectRevokeButton = this.detailPanel.locator('button').filter({ hasText: /Reject|Revoke/i }).first();

  // ─── Section 9: Confirmation Modal ──────────────────────────────────────
  readonly confirmModal = this.page.locator('.fixed.inset-0.z-\\[9999\\]');
  readonly confirmModalTitle = this.confirmModal.locator('h3');
  readonly confirmModalNoteTextarea = this.confirmModal.locator('#action-reason');
  readonly confirmModalCancelButton = this.confirmModal.getByRole('button', { name: /Cancel/i });
  readonly confirmModalConfirmButton = this.confirmModal.getByRole('button', { name: /Confirm/i });

  // ─── Section 10: Chat in Detail Panel ───────────────────────────────────
  readonly chatInput = this.detailPanel.getByPlaceholder('Type your reply...');
  readonly chatSendButton = this.detailPanel.locator('button[type="submit"]');
  readonly chatMessages = this.detailPanel.locator('.flex-1.overflow-y-auto > div');
  readonly chatBubble = (text: string) =>
    this.detailPanel.locator('.px-4.py-2\\.5.rounded-2xl').filter({ hasText: text }).first();

  // ─── Toast ───────────────────────────────────────────────────────────────
  readonly successToast = this.page.locator('.bg-green-50');
  readonly errorToast = this.page.locator('.bg-red-50');

  // ─── Loading ────────────────────────────────────────────────────────────
  readonly loadingSpinner = this.page.locator('.animate-spin');

  constructor(public readonly page: Page) {}

  // ─── Navigation ─────────────────────────────────────────────────────────
  async goto() {
    await this.page.goto('/admin/leave-approvals');
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    // The page either shows main content or access-denied
    await expect(
      this.pageTitle.or(this.accessDenied).or(this.loadingSpinner)
    ).toBeVisible({ timeout: 10000 });
  }

  async isAccessDenied(): Promise<boolean> {
    return this.accessDenied.isVisible({ timeout: 3000 }).catch(() => false);
  }

  // ─── Stats ───────────────────────────────────────────────────────────────
  async getStatValue(cardIndex: 0 | 1 | 2 | 3): Promise<string> {
    const card = this.statsGrid.locator('> div').nth(cardIndex);
    const h3 = card.locator('h3');
    if ((await h3.count()) === 0) return '0';
    return (await h3.textContent()) || '0';
  }

  async getAllStats(): Promise<{ total: string; pending: string; approved: string; rejected: string }> {
    return {
      total: await this.getStatValue(0),
      pending: await this.getStatValue(1),
      approved: await this.getStatValue(2),
      rejected: await this.getStatValue(3),
    };
  }

  // ─── Filters ────────────────────────────────────────────────────────────
  async searchEmployee(term: string) {
    await this.searchEmployeeInput.fill(term);
    await this.page.waitForTimeout(300); // debounce
  }

  async setFilterFromDate(dateStr: string) {
    await this.filterFromDate.fill(dateStr);
    await this.filterFromDate.press('Enter');
  }

  async setFilterToDate(dateStr: string) {
    await this.filterToDate.fill(dateStr);
    await this.filterToDate.press('Enter');
  }

  async clearFilters() {
    await this.clearFiltersButton.click();
  }

  // ─── Tabs ───────────────────────────────────────────────────────────────
  async switchToTab(tab: 'Pending' | 'Approved' | 'Rejected') {
    const tabBtn = this.page.locator('button').filter({ hasText: new RegExp(`^${tab}$`, 'i') });
    await tabBtn.click();
    await this.page.waitForTimeout(300);
  }

  // ─── View Mode ──────────────────────────────────────────────────────────
  async switchToSplitView() {
    await this.splitViewButton.click();
    await this.page.waitForTimeout(200);
  }

  async switchToListView() {
    await this.listViewButton.click();
    await this.page.waitForTimeout(200);
  }

  // ─── Request Selection (Split View) ─────────────────────────────────────
  async getSplitListItemCount(): Promise<number> {
    return this.splitListItems().count();
  }

  async selectRequestByIndex(index: number) {
    const items = this.splitListItems();
    const item = items.nth(index);
    await item.click();
    await expect(this.detailTitle).toBeVisible({ timeout: 5000 });
  }

  async selectFirstRequest() {
    const items = this.splitListItems();
    const count = await items.count();
    if (count > 0) {
      await items.first().click();
      await expect(this.detailTitle).toBeVisible({ timeout: 5000 });
    }
  }

  /**
   * Find and click a request in the split list by matching employee name.
   */
  async selectRequestByEmployeeName(name: string) {
    const items = this.splitListItems();
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const itemText = (await items.nth(i).textContent()) || '';
      if (itemText.toLowerCase().includes(name.toLowerCase())) {
        await items.nth(i).click();
        await expect(this.detailTitle).toBeVisible({ timeout: 5000 });
        return true;
      }
    }
    return false;
  }

  // ─── Table View ─────────────────────────────────────────────────────────
  async getTableRowCount(): Promise<number> {
    return this.tableDataRows().count();
  }

  /**
   * Click the Approve button on the first table row.
   */
  async clickFirstTableApprove() {
    const btn = this.tableDataRows().first().locator('button').filter({ hasText: /Approve/i });
    if ((await btn.count()) > 0) {
      await btn.click();
      await expect(this.confirmModal).toBeVisible({ timeout: 3000 });
    }
  }

  // ─── Detail Panel ───────────────────────────────────────────────────────
  async getDetailLeaveType(): Promise<string> {
    return (await this.detailLeaveTypeValue().textContent()) || '';
  }

  async getDetailFromDate(): Promise<string> {
    return (await this.detailFromDateValue().textContent()) || '';
  }

  async getDetailToDate(): Promise<string> {
    return (await this.detailToDateValue().textContent()) || '';
  }

  async getDetailDuration(): Promise<string> {
    return (await this.detailDurationValue().textContent()) || '';
  }

  async getDetailRemainingBalance(): Promise<string> {
    return (await this.detailRemainingBalanceValue().textContent()) || '';
  }

  async getDetailReason(): Promise<string> {
    return (await this.detailReason.textContent()) || '';
  }

  async getDetailEmployeeName(): Promise<string> {
    // Find the employee name in the employee info section
    const section = this.detailPanel.locator('section').first();
    const nameEl = section.locator('.font-semibold.text-gray-900').first();
    return (await nameEl.textContent()) || '';
  }

  // ─── Actions ────────────────────────────────────────────────────────────
  async clickApprove() {
    await this.approveButton.click();
    await expect(this.confirmModal).toBeVisible({ timeout: 3000 });
  }

  async clickReject() {
    await this.rejectRevokeButton.first().click();
    await expect(this.confirmModal).toBeVisible({ timeout: 3000 });
  }

  async clickRevoke() {
    // Revoke button appears on approved requests
    const revokeBtn = this.page.locator('button').filter({ hasText: /Revoke/i }).first();
    await revokeBtn.click();
    await expect(this.confirmModal).toBeVisible({ timeout: 3000 });
  }

  async fillConfirmNote(note: string) {
    await this.confirmModalNoteTextarea.fill(note);
  }

  async confirmAction() {
    await this.confirmModalConfirmButton.click();
    await expect(this.confirmModal).not.toBeVisible({ timeout: 8000 });
  }

  async cancelAction() {
    await this.confirmModalCancelButton.click();
    await expect(this.confirmModal).not.toBeVisible({ timeout: 3000 });
  }

  // ─── Chat Actions ───────────────────────────────────────────────────────
  async sendChatMessage(message: string) {
    await this.chatInput.fill(message);
    await expect(this.chatSendButton).toBeEnabled({ timeout: 2000 });
    await this.chatSendButton.click();
  }

  async hasChatMessageContaining(text: string): Promise<boolean> {
    return this.chatBubble(text).isVisible({ timeout: 5000 }).catch(() => false);
  }

  async getChatMessageCount(): Promise<number> {
    return this.chatMessages.count();
  }

  // ─── Network Helpers ────────────────────────────────────────────────────
  waitForApprovalResponse() {
    return this.page.waitForResponse(
      (resp) => resp.url().includes('/api/leave/request/') && resp.url().includes('/approve') && resp.request().method() === 'PATCH',
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

  // ─── Helpers ────────────────────────────────────────────────────────────
  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
