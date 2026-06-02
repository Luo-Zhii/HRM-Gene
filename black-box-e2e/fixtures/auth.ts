import { test as base, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export const CREDENTIALS = {
  admin:    { email: 'admin@example.com',    password: 'Admin@123' },
  hr:       { email: 'hr@example.com',        password: 'Hr@123' },
  employee: { email: 'employee@example.com',  password: 'Employee@123' },
};

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);
}

export interface E2EFixtures {
  adminPage: Page;
  employeePage: Page;
  hrPage: Page;
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
  hrPage: async ({ browser }, use) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loginAs(page, CREDENTIALS.hr.email, CREDENTIALS.hr.password);
    await use(page);
    await ctx.close();
  },
});

export { expect, BASE_URL };
