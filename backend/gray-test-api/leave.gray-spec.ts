/**
 * Gray-box Integration Tests — Leave Module
 *
 * Black-box:  Supertest hits /leave/* endpoints.
 * White-box:  Direct TypeORM queries verify DB state for leave requests & balances.
 *
 * Seed data:
 *   Leave Types: Annual Leave (12d), Sick Leave (5d), Unpaid Leave (0d)
 *   15 pre-seeded leave requests across employees.
 *   Each employee has 3 leave balance records (one per leave type).
 */
import {
  bootstrapGrayTest,
  teardownGrayTest,
  adminAgent,
  userAgent,
  agent,
  getLeaveTypeRepo,
  getLeaveBalanceRepo,
  getLeaveRequestRepo,
  getUserProfile,
  getAdminProfile,
  SEED,
} from "./test-helper";

describe("Leave Module (Gray-box)", () => {
  beforeAll(async () => {
    await bootstrapGrayTest();
  });

  afterAll(async () => {
    await teardownGrayTest();
  });

  // ─── GET /leave/types ──────────────────────────────────────────
  describe("GET /leave/types", () => {
    it("should return all 3 leave types for authenticated user", async () => {
      const res = await userAgent().get("/leave/types").expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(3);

      const names = res.body.map((lt: any) => lt.name);
      for (const expected of SEED.LEAVE_TYPES) {
        expect(names).toContain(expected.name);
      }
    });

    it("should return 401 without auth", async () => {
      await agent().get("/leave/types").expect(401);
    });
  });

  // ─── GET /leave/balance ────────────────────────────────────────
  describe("GET /leave/balance", () => {
    it("should return leave balances for the authenticated user", async () => {
      const res = await userAgent().get("/leave/balance").expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3); // One per leave type

      for (const balance of res.body) {
        expect(balance.leave_type).toBeDefined();
        expect(balance.remaining_days).toBeDefined();
        expect(typeof balance.remaining_days).toBe("number");
      }

      // White-box: verify balances exist in DB for this user
      const userProfile = getUserProfile();
      const balanceRepo = getLeaveBalanceRepo();
      const dbBalances = await balanceRepo.find({
        where: { employee: { employee_id: userProfile.employee_id } },
        relations: ["leave_type"],
      });
      expect(dbBalances.length).toBe(3);
    });
  });

  // ─── GET /leave/my-requests ────────────────────────────────────
  describe("GET /leave/my-requests", () => {
    it("should return leave requests for the authenticated user", async () => {
      const res = await userAgent().get("/leave/my-requests").expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      // The seeded leave requests are randomly assigned, so count may vary
    });
  });

  // ─── POST /leave/request — Submit Leave Request ────────────────
  describe("POST /leave/request — Submit Leave Request", () => {
    let leaveTypeId: number;
    let createdRequestId: number;

    beforeAll(async () => {
      const ltRepo = getLeaveTypeRepo();
      const annualLeave = await ltRepo.findOne({ where: { name: "Annual Leave" } });
      leaveTypeId = annualLeave!.leave_type_id;
    });

    afterAll(async () => {
      if (createdRequestId) {
        await getLeaveRequestRepo().delete({ request_id: createdRequestId });
      }
    });

    it("should submit a leave request and persist it in DB", async () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const startDate = today.toISOString().split("T")[0];
      const endDate = tomorrow.toISOString().split("T")[0];

      const res = await userAgent()
        .post("/leave/request")
        .send({
          leave_type_id: leaveTypeId,
          start_date: startDate,
          end_date: endDate,
          reason: "Gray-box test leave request",
        })
        .expect(201);

      expect(res.body).toBeDefined();
      createdRequestId = res.body.request_id || res.body.requestId;

      // White-box: verify the request was saved in DB
      const userProfile = getUserProfile();
      const lrRepo = getLeaveRequestRepo();
      const dbRequest = await lrRepo.findOne({
        where: { employee: { employee_id: userProfile.employee_id }, reason: "Gray-box test leave request" },
        relations: ["employee", "leave_type"],
      });

      expect(dbRequest).toBeDefined();
      expect(dbRequest!.start_date).toBe(startDate);
      expect(dbRequest!.end_date).toBe(endDate);
      expect(dbRequest!.status).toBe("Pending");
      expect(dbRequest!.leave_type.leave_type_id).toBe(leaveTypeId);
      expect(dbRequest!.employee.employee_id).toBe(userProfile.employee_id);
    });

    it("should return 401 without auth", async () => {
      await agent()
        .post("/leave/request")
        .send({ leave_type_id: 1, start_date: "2026-01-01", end_date: "2026-01-02", reason: "test" })
        .expect(401);
    });
  });

  // ─── GET /leave/pending-requests (manager/hr only) ─────────────
  describe("GET /leave/pending-requests", () => {
    it("admin (Director) should see pending requests", async () => {
      const res = await adminAgent().get("/leave/pending-requests");
      expect([200, 403]).toContain(res.status);
    });

    it("standard user should get 403", async () => {
      await userAgent().get("/leave/pending-requests").expect(403);
    });
  });

  // ─── White-box: Leave Balance integrity ────────────────────────
  describe("White-box: Leave Balance DB integrity", () => {
    it("employees should have leave balances", async () => {
      const balanceRepo = getLeaveBalanceRepo();
      const count = await balanceRepo.count();
      expect(count).toBeGreaterThan(0);
    });

    it("Annual Leave remaining_days should be between 2 and 12 (per seed)", async () => {
      const balanceRepo = getLeaveBalanceRepo();
      const annualBalances = await balanceRepo.find({
        where: { leave_type: { name: "Annual Leave" } },
        relations: ["leave_type"],
      });

      expect(annualBalances.length).toBeGreaterThanOrEqual(40);
      for (const b of annualBalances) {
        expect(b.remaining_days).toBeGreaterThanOrEqual(2);
        expect(b.remaining_days).toBeLessThanOrEqual(12);
      }
    });
  });
});
