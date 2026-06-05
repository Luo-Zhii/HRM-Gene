/**
 * Gray-box Integration Tests — Reports Module
 *
 * GET /reports/payroll-summary, GET /reports/dashboard
 */
import {
  bootstrapGrayTest,
  teardownGrayTest,
  adminAgent,
  userAgent,
  agent,
} from "./test-helper";

describe("Reports Module (Gray-box)", () => {
  beforeAll(async () => {
    await bootstrapGrayTest();
  });

  afterAll(async () => {
    await teardownGrayTest();
  });

  describe("GET /reports/payroll-summary", () => {
    it("should return payroll summary for given month/year", async () => {
      const now = new Date();
      const res = await adminAgent()
        .get("/reports/payroll-summary")
        .query({ month: now.getMonth() + 1, year: now.getFullYear() })
        .expect(200);
      expect(res.body).toBeDefined();
    });

    it("should default to current month/year without params", async () => {
      const res = await adminAgent()
        .get("/reports/payroll-summary")
        .expect(200);
      expect(res.body).toBeDefined();
    });

    it("should return 401 without auth", async () => {
      await agent().get("/reports/payroll-summary").expect(401);
    });
  });

  describe("GET /reports/dashboard", () => {
    it("admin should get reports dashboard data", async () => {
      const res = await adminAgent().get("/reports/dashboard").expect(200);
      expect(res.body).toBeDefined();
    });

    it("standard user should get 403", async () => {
      await userAgent().get("/reports/dashboard").expect(403);
    });
  });
});
