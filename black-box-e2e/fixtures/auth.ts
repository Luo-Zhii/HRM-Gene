import { test as base, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Credentials matching seed data from backend/scripts/seed.ts:
 *   Admin:  admin@example.com  / admin
 *   Users:  user1@company.com  / password123  (through user39)
 */
export const CREDENTIALS = {
  admin:    { email: 'admin@example.com',   password: 'admin' },
  // Intern position — minimal permissions, ideal for RBAC enforcement tests
  employee: { email: 'user1@company.com',   password: 'password123' },
};

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  // Login form uses shadcn Input: id="email" type="email", id="password" type="password"
  await page.waitForSelector('#email', { timeout: 10000 });
  await page.fill('#email', email);
  await page.fill('#password', password);
  // Press Enter to submit — avoids the <text> element overlapping the submit button
  await page.press('#password', 'Enter');
  // On success the app sets window.location.href = "/dashboard"
  await page.waitForURL('**/dashboard', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);
}

export interface E2EFixtures {
  adminPage: Page;
  employeePage: Page;
}

export const test = base.extend<E2EFixtures>({
  adminPage: async ({ browser }, use) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
    await use(page);
    await ctx.close();
  },
  employeePage: async ({ browser }, use) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loginAs(page, CREDENTIALS.employee.email, CREDENTIALS.employee.password);
    await use(page);
    await ctx.close();
  },
});

export { expect, BASE_URL };
