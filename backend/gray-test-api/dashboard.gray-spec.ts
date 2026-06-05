/**
 * Gray-box Integration Tests — Dashboard Module
 *
 * GET /dashboard/employee, GET /dashboard/admin, GET /dashboard/holidays
 */
import {
  bootstrapGrayTest,
  teardownGrayTest,
  adminAgent,
  userAgent,
  agent,
} from "./test-helper";

describe("Dashboard Module (Gray-box)", () => {
  beforeAll(async () => {
    await bootstrapGrayTest();
  });

  afterAll(async () => {
    await teardownGrayTest();
  });

  describe("GET /dashboard/employee", () => {
    it("should return employee dashboard data", async () => {
      const res = await userAgent().get("/dashboard/employee").expect(200);
      expect(res.body).toBeDefined();
    });

    it("should return 401 without auth", async () => {
      await agent().get("/dashboard/employee").expect(401);
    });
  });

  describe("GET /dashboard/admin", () => {
    it("admin (Director) should get admin dashboard data", async () => {
      const res = await adminAgent().get("/dashboard/admin").expect(200);
      expect(res.body).toBeDefined();
    });

    it("standard user should get 403", async () => {
      await userAgent().get("/dashboard/admin").expect(403);
    });
  });

  describe("GET /dashboard/holidays", () => {
    it("should return holiday list", async () => {
      const res = await userAgent().get("/dashboard/holidays").expect(200);
      expect(res.body).toBeDefined();
    });
  });
});
