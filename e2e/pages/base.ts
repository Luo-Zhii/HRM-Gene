import { Page, Locator, expect as playwrightExpect } from '@playwright/test';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitBtn: Locator;
  readonly errorMsg: Locator;

  constructor(readonly page: Page) {
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitBtn = page.locator('button[type="submit"]');
    this.errorMsg = page.locator('[role="alert"], .text-red-500, .text-red-600').first();
  }

  async goto() { await this.page.goto('/login'); }
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitBtn.click();
  }
}

export class Sidebar {
  constructor(readonly page: Page) {}

  async navigateTo(label: string) {
    await this.page.locator('button[aria-label="Open menu"], button.md\\:hidden').first().click().catch(() => {});
    await this.page.locator('a, button').filter({ hasText: label }).first().click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }
}

export class HeaderBar {
  constructor(readonly page: Page) {}

  get notificationBell() { return this.page.locator('header button').filter({ has: this.page.locator('svg.lucide-bell') }); }
  get searchInput() { return this.page.locator('header input[placeholder]'); }
  get langSwitcher() { return this.page.locator('header button').filter({ hasText: /EN|VI|Tiếng/ }).first(); }

  async openUserMenu() {
    await this.page.locator('header button').filter({ has: this.page.locator('svg') }).last().click();
  }
  async logout() {
    await this.openUserMenu();
    await this.page.locator('button').filter({ hasText: /Log Out|Đăng xuất/ }).click();
  }
  async gotoProfile() {
    await this.openUserMenu();
    await this.page.locator('a, button').filter({ hasText: /My Profile|Hồ sơ/ }).first().click();
  }
  async search(term: string) {
    await this.searchInput.fill(term);
    await this.page.waitForTimeout(500);
  }
}

export function expectLoaded(page: Page) {
  return playwrightExpect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10000 });
}
