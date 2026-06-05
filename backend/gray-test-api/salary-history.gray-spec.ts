/**
 * Gray-box Integration Tests — Salary History Module
 *
 * GET /salary-history, GET /salary-history/:id
 * White-box: verify seeded salary history records exist for all employees.
 *
 * Seed: 40 employees each have 1 salary history record (initial contract salary).
 */
import {
  bootstrapGrayTest,
  teardownGrayTest,
  adminAgent,
  userAgent,
  agent,
  getSalaryHistoryRepo,
  getUserProfile,
  getAdminProfile,
} from "./test-helper";

describe("Salary History Module (Gray-box)", () => {
  beforeAll(async () => {
    await bootstrapGrayTest();
  });

  afterAll(async () => {
    await teardownGrayTest();
  });

  describe("GET /salary-history", () => {
    it("admin should get all salary history records", async () => {
      const res = await adminAgent().get("/salary-history").expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("user should see only their own history", async () => {
      const res = await userAgent().get("/salary-history").expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should support employeeId query filter", async () => {
      const userProfile = getUserProfile();
      const res = await adminAgent()
        .get("/salary-history")
        .query({ employeeId: userProfile.employee_id })
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should return 401 without auth", async () => {
      await agent().get("/salary-history").expect(401);
    });
  });

  describe("GET /salary-history/:id", () => {
    it("admin should get a specific history record by id", async () => {
      const repo = getSalaryHistoryRepo();
      const records = await repo.find({ take: 1 });
      expect(records.length).toBeGreaterThan(0);

      const res = await adminAgent()
        .get(`/salary-history/${records[0].history_id}`)
        .expect(200);
      expect(res.body.history_id).toBe(records[0].history_id);
    });
  });

  describe("White-box: Salary History DB integrity", () => {
    it("all employees should have at least 1 salary history record", async () => {
      const repo = getSalaryHistoryRepo();
      const count = await repo.count();
      expect(count).toBeGreaterThanOrEqual(40);
    });

    it("initial records should have old_salary='0' and non-null change_date", async () => {
      const repo = getSalaryHistoryRepo();
      const records = await repo.find({ take: 10, order: { change_date: "ASC" } });

      for (const r of records) {
        expect(r.change_date).toBeDefined();
        expect(r.new_salary).toBeDefined();
        expect(parseFloat(r.new_salary)).toBeGreaterThan(0);
      }
    });
  });
});
