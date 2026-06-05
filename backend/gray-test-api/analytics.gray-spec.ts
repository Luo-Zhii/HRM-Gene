/**
 * Gray-box Integration Tests — Analytics Module
 *
 * GET /analytics/dashboard, GET /analytics/activities
 */
import {
  bootstrapGrayTest,
  teardownGrayTest,
  adminAgent,
  userAgent,
  agent,
} from "./test-helper";

describe("Analytics Module (Gray-box)", () => {
  beforeAll(async () => {
    await bootstrapGrayTest();
  });

  afterAll(async () => {
    await teardownGrayTest();
  });

  describe("GET /analytics/dashboard", () => {
    it("should return dashboard data for authenticated user", async () => {
      const res = await adminAgent().get("/analytics/dashboard").expect(200);
      expect(res.body).toBeDefined();
    });

    it("should return 401 without auth", async () => {
      await agent().get("/analytics/dashboard").expect(401);
    });
  });

  describe("GET /analytics/activities", () => {
    it("should return activities list", async () => {
      const res = await userAgent().get("/analytics/activities").expect(200);
      expect(res.body).toBeDefined();
    });

    it("should support date range filtering", async () => {
      const res = await adminAgent()
        .get("/analytics/activities")
        .query({ startDate: "2026-01-01", endDate: "2026-12-31", type: "leave" })
        .expect(200);
      expect(res.body).toBeDefined();
    });
  });
});
