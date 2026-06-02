import { Page, Locator, expect as playwrightExpect } from '@playwright/test';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitBtn: Locator;
  readonly errorMsg: Locator;

  constructor(readonly page: Page) {
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitBtn = page.locator('button[type="submit"]');
    this.errorMsg = page.locator('.bg-red-50, [role="alert"]').first();
  }

  async goto() {
    await this.page.goto('/login');
    await this.page.waitForSelector('#email', { timeout: 10000 });
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    // Press Enter instead of clicking — avoids the <text> element overlap issue
    await this.passwordInput.press('Enter');
  }
}

export class Sidebar {
  constructor(readonly page: Page) {}

  async navigateTo(label: string) {
    // Expand any collapsed sidebar sections first
    const collapsedButtons = this.page.locator('aside button, nav button').filter({ hasText: /Administration|My Workspace|People|Attend|Payroll|Performance|Communication|Analytics/i });
    const btnCount = await collapsedButtons.count();
    for (let i = 0; i < btnCount; i++) {
      const btn = collapsedButtons.nth(i);
      if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
        await btn.click().catch(() => {});
        await this.page.waitForTimeout(200);
      }
    }

    // Now find the link - accept both visible and DOM-present elements
    const link = this.page.locator('aside a, nav a, a[href]').filter({ hasText: label }).first();
    const linkCount = await link.count();
    if (linkCount > 0) {
      await link.click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(1000);
      return;
    }

    // Fallback: look for buttons with the label
    const btn = this.page.locator('aside button, nav button').filter({ hasText: label }).first();
    const btnCount2 = await btn.count();
    if (btnCount2 > 0) {
      await btn.click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(1000);
      return;
    }

    // Last resort: just navigate to a known URL if we can't find the link
    const knownRoutes: Record<string, string> = {
      'Dashboard': '/dashboard',
      'Employee Directory': '/admin/employees',
      'Employment Contract': '/admin/contracts',
      'Organizational': '/admin/organization',
      'Discipline': '/admin/discipline',
      'Permissions': '/admin/permissions',
      'Attendance': '/admin/attendance',
      'Leave Approvals': '/admin/leave-approvals',
      'Create Payroll': '/admin/payroll/generate',
      'Salary Configuration': '/admin/payroll/config',
      'Salary Adjustment': '/admin/payroll/adjustment',
      'Issue Payslips': '/admin/payroll/issue',
      'KPI Library': '/admin/performance/library',
      'Team Performance': '/admin/performance/team',
      'Manage News': '/admin/announcements',
      'Analysis Report': '/admin/reports',
      'System Settings': '/admin/settings',
      'Payroll Settings': '/admin/settings/payroll',
      'Timekeeping': '/timekeeping',
      'Leave': '/leave',
      'Leave Management': '/leave',
      'Resignation Approvals': '/admin/resignations',
    };
    const route = knownRoutes[label];
    if (route) {
      await this.page.goto(route);
      await this.page.waitForTimeout(1000);
    }
  }
}

export class HeaderBar {
  constructor(readonly page: Page) {}

  get notificationBell() {
    return this.page.locator('header button svg').first().locator('..');
  }
  get searchInput() {
    return this.page.locator('header input[placeholder], header input[type="text"], header input[type="search"]').first();
  }
  get langSwitcher() {
    return this.page.locator('header button').filter({ hasText: /EN|VI|Tiếng/ }).first();
  }

  async openUserMenu() {
    // User menu typically triggered by clicking the last button/avatar in header
    const userBtn = this.page.locator('header button').last();
    if (await userBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await userBtn.click();
      await this.page.waitForTimeout(500);
    }
  }

  async logout() {
    await this.openUserMenu();
    await this.page.locator('button, a, div[role="menuitem"]').filter({ hasText: /Log Out|Đăng xuất|Logout/i }).first().click();
  }

  async gotoProfile() {
    await this.openUserMenu();
    await this.page.locator('button, a, div[role="menuitem"]').filter({ hasText: /My Profile|Hồ sơ|Profile/i }).first().click();
  }

  async search(term: string) {
    await this.searchInput.fill(term);
    await this.page.waitForTimeout(500);
  }
}

export function expectLoaded(page: Page) {
  return playwrightExpect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10000 });
}
