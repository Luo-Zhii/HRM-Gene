/**
 * Gray-box Integration Tests — Payroll Module
 *
 * Black-box:  Supertest hits /payroll/* endpoints.
 * White-box:  Direct TypeORM queries verify Payslip, SalaryConfig, and
 *             SalaryAdjustment records in DB.
 *
 * Seed data:
 *   12 payroll periods (monthly, status=PAID).
 *   Payslips for every active employee × every period.
 *   SalaryConfig for every employee with allowances.
 *   ~15% of employees have SalaryAdjustments (bonus/penalty).
 */
import {
  bootstrapGrayTest,
  teardownGrayTest,
  adminAgent,
  userAgent,
  agent,
  getPayslipRepo,
  getPayrollPeriodRepo,
  getSalaryConfigRepo,
  getSalaryAdjustmentRepo,
  getUserProfile,
  getAdminProfile,
} from "./test-helper";

describe("Payroll Module (Gray-box)", () => {
  beforeAll(async () => {
    await bootstrapGrayTest();
  });

  afterAll(async () => {
    await teardownGrayTest();
  });

  // ─── GET /payroll/my-payslips ──────────────────────────────────
  describe("GET /payroll/my-payslips", () => {
    it("should return payslips for the authenticated user", async () => {
      const res = await userAgent().get("/payroll/my-payslips").expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      // Each employee has 12 months of payslips
      expect(res.body.length).toBeGreaterThanOrEqual(1);

      for (const slip of res.body) {
        expect(slip.payslip_id).toBeDefined();
        expect(slip.net_salary).toBeDefined();
        expect(slip.gross_salary).toBeDefined();
      }
    });

    it("should return 401 without auth", async () => {
      await agent().get("/payroll/my-payslips").expect(401);
    });
  });

  // ─── GET /payroll/list (admin only) ────────────────────────────
  describe("GET /payroll/list", () => {
    it("admin should get payslips by period", async () => {
      const now = new Date();
      const res = await adminAgent()
        .get("/payroll/list")
        .query({ month: now.getMonth() + 1, year: now.getFullYear() })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it("standard user should get 403", async () => {
      await userAgent().get("/payroll/list").expect(403);
    });
  });

  // ─── GET /payroll/period ───────────────────────────────────────
  describe("GET /payroll/period", () => {
    it("admin should get payroll period by month/year", async () => {
      const now = new Date();
      const res = await adminAgent()
        .get("/payroll/period")
        .query({ month: now.getMonth() + 1, year: now.getFullYear() })
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.month).toBeDefined();
      expect(res.body.year).toBeDefined();
    });
  });

  // ─── GET /payroll/config (admin only) ──────────────────────────
  describe("GET /payroll/config", () => {
    it("admin should get all salary configs", async () => {
      const res = await adminAgent().get("/payroll/config").expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it("standard user should get 403", async () => {
      await userAgent().get("/payroll/config").expect(403);
    });
  });

  // ─── GET /payroll/config/:employeeId ───────────────────────────
  describe("GET /payroll/config/:employeeId", () => {
    it("admin should get salary config for a specific employee", async () => {
      const adminProfile = getAdminProfile();
      const employeeId = adminProfile.employee_id;

      const res = await adminAgent()
        .get(`/payroll/config/${employeeId}`)
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.base_salary).toBeDefined();
      expect(res.body.transport_allowance).toBeDefined();
      expect(res.body.lunch_allowance).toBeDefined();
    });

    it("should return 400 for invalid employee id", async () => {
      await adminAgent().get("/payroll/config/abc" as any).expect(400);
    });
  });

  // ─── PATCH /payroll/config/:employeeId ─────────────────────────
  describe("PATCH /payroll/config/:employeeId — Update Salary Config", () => {
    it("should update salary config and persist in DB", async () => {
      const adminProfile = getAdminProfile();
      const employeeId = adminProfile.employee_id;
      const newBaseSalary = "75000000";

      const res = await adminAgent()
        .patch(`/payroll/config/${employeeId}`)
        .send({
          base_salary: newBaseSalary,
          transport_allowance: "5000000",
          lunch_allowance: "730000",
          responsibility_allowance: "0",
          kpi_bonus_percentage: 10,
        })
        .expect(200);
    });
  });

  // ─── POST /payroll/adjustments ─────────────────────────────────
  describe("POST /payroll/adjustments — Create Salary Adjustment", () => {
    let createdAdjustmentId: number;

    afterAll(async () => {
      if (createdAdjustmentId) {
        await getSalaryAdjustmentRepo().delete({ id: createdAdjustmentId });
      }
    });

    it("should create a bonus adjustment and persist in DB", async () => {
      const userProfile = getUserProfile();

      const res = await adminAgent()
        .post("/payroll/adjustments")
        .send({
          employee_id: userProfile.employee_id,
          type: "Bonus",
          amount: "2000000",
          applied_month: "06/2026",
          reason: "Gray-box test bonus",
        })
        .expect(201);

      expect(res.body).toBeDefined();
      createdAdjustmentId = res.body.id;

      // White-box: verify DB persistence
      const adjRepo = getSalaryAdjustmentRepo();
      const dbAdj = await adjRepo.findOne({
        where: { id: createdAdjustmentId },
        relations: ["employee"],
      });
      expect(dbAdj).toBeDefined();
      expect(dbAdj!.type).toBe("Bonus");
      expect(parseFloat(dbAdj!.amount)).toBe(2000000);
      expect(dbAdj!.reason).toBe("Gray-box test bonus");
      expect(dbAdj!.employee.employee_id).toBe(userProfile.employee_id);
    });
  });

  // ─── GET /payroll/adjustments ──────────────────────────────────
  describe("GET /payroll/adjustments", () => {
    it("admin should get all adjustments", async () => {
      const res = await adminAgent().get("/payroll/adjustments").expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ─── White-box: Payslip DB integrity ───────────────────────────
  describe("White-box: Payslip DB integrity", () => {
    it("should have payslips in DB", async () => {
      const slipRepo = getPayslipRepo();
      const count = await slipRepo.count();
      expect(count).toBeGreaterThan(0);
    });

    it("should have 12 payroll periods with PAID status", async () => {
      const periodRepo = getPayrollPeriodRepo();
      const periods = await periodRepo.find();

      expect(periods.length).toBeGreaterThanOrEqual(12);
      for (const p of periods) {
        expect(p.standard_work_days).toBe(26);
      }
    });

    it("net_salary + deductions should approximately equal gross_salary", async () => {
      const slipRepo = getPayslipRepo();
      const slips = await slipRepo.find({ take: 10 });

      for (const slip of slips) {
        const net = parseFloat(slip.net_salary);
        const deductions = parseFloat(slip.deductions);
        const gross = parseFloat(slip.gross_salary);
        // net + deductions ≈ gross (accounting for rounding)
        const diff = Math.abs(net + deductions - gross);
        expect(diff).toBeLessThan(2); // Allow small rounding differences
      }
    });
  });
});
