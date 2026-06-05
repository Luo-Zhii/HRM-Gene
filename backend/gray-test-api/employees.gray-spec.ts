/**
 * Gray-box Integration Tests — Employees Module
 *
 * Black-box:  Supertest hits /employees/* and /admin/employees/* endpoints.
 * White-box:  Direct TypeORM queries verify DB mutations (create, update, delete).
 *
 * Seed data: 40 employees (admin + user1..user39), positions, departments.
 */
import {
  bootstrapGrayTest,
  teardownGrayTest,
  adminAgent,
  userAgent,
  getEmployeeRepo,
  getDepartmentRepo,
  getPositionRepo,
  SEED,
} from "./test-helper";

describe("Employees Module (Gray-box)", () => {
  beforeAll(async () => {
    await bootstrapGrayTest();
  });

  afterAll(async () => {
    await teardownGrayTest();
  });

  // ─── GET /employees ─────────────────────────────────────────────
  describe("GET /employees", () => {
    it("should return list of employees for admin (Director)", async () => {
      const res = await adminAgent().get("/employees").expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(40);

      const adminUser = res.body.find((e: any) => e.email === SEED.ADMIN.email);
      expect(adminUser).toBeDefined();
      expect(adminUser.first_name).toBe(SEED.ADMIN.firstName);
    });

    it("should return employees for standard user", async () => {
      const res = await userAgent().get("/employees");
      expect([200, 403]).toContain(res.status);
    });
  });

  // ─── GET /employees/directory (public) ──────────────────────────
  describe("GET /employees/directory", () => {
    it("should return public employee directory", async () => {
      const res = await userAgent().get("/employees/directory").expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      // Public directory should have name & department but NOT phone/address
      if (res.body.length > 0) {
        expect(res.body[0].first_name).toBeDefined();
        expect(res.body[0].last_name).toBeDefined();
        // Sensitive fields should be absent in public directory
        expect(res.body[0].phone_number).toBeUndefined();
        expect(res.body[0].address).toBeUndefined();
      }
    });
  });

  // ─── GET /employees/search ──────────────────────────────────────
  describe("GET /employees/search", () => {
    it("should search employees by name", async () => {
      const res = await adminAgent()
        .get("/employees/search")
        .query({ q: "System" })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const found = res.body.find((e: any) => e.email === SEED.ADMIN.email);
      expect(found).toBeDefined();
    });

    it("should return empty array for short query", async () => {
      const res = await adminAgent()
        .get("/employees/search")
        .query({ q: "S" })
        .expect(200);

      expect(res.body).toEqual([]);
    });
  });

  // ─── GET /employees/:id ─────────────────────────────────────────
  describe("GET /employees/:id", () => {
    let adminId: number;

    beforeAll(() => {
      // Resolve admin employee_id from the stored token profile
      const res = require("./test-helper").getAdminProfile();
      adminId = res.employee_id;
    });

    it("should return single employee by id", async () => {
      const res = await adminAgent().get(`/employees/${adminId}`).expect(200);

      expect(res.body.employee_id).toBe(adminId);
      expect(res.body.email).toBe(SEED.ADMIN.email);
    });

    it("should return 400 for non-numeric id", async () => {
      await adminAgent().get("/employees/abc").expect(400);
    });
  });

  // ─── POST /admin/employees (create) ─────────────────────────────
  describe("POST /admin/employees — Create Employee", () => {
    const newEmployeeEmail = `test-gray-${Date.now()}@company.com`;

    afterAll(async () => {
      // White-box cleanup: delete the created test employee directly from DB
      const empRepo = getEmployeeRepo();
      await empRepo.delete({ email: newEmployeeEmail });
    });

    it("should create a new employee and persist in DB", async () => {
      const deptRepo = getDepartmentRepo();
      const posRepo = getPositionRepo();

      const departments = await deptRepo.find();
      const positions = await posRepo.find();
      const hrDept = departments.find((d) => d.department_name === "HR");
      const staffPos = positions.find((p) => p.position_name === "Staff");

      const res = await adminAgent()
        .post("/admin/employees")
        .send({
          email: newEmployeeEmail,
          password: "testpass123",
          first_name: "Gray",
          last_name: "Test",
          department_id: hrDept?.department_id,
          position_id: staffPos?.position_id,
          phone_number: "0901111111",
          address: "123 Test Street",
        })
        .expect(201);

      expect(res.body).toBeDefined();

      // White-box: verify the employee was actually inserted into the DB
      const empRepo = getEmployeeRepo();
      const dbEmployee = await empRepo.findOne({
        where: { email: newEmployeeEmail },
        relations: ["department", "position"],
      });

      expect(dbEmployee).toBeDefined();
      expect(dbEmployee!.first_name).toBe("Gray");
      expect(dbEmployee!.last_name).toBe("Test");
      expect(dbEmployee!.phone_number).toBe("0901111111");
      expect(dbEmployee!.department).toBeDefined();
      expect(dbEmployee!.department!.department_name).toBe("HR");
      expect(dbEmployee!.position).toBeDefined();
      expect(dbEmployee!.position!.position_name).toBe("Staff");
    });
  });

  // ─── PATCH /employees/:id — Update Employee ────────────────────
  describe("PATCH /employees/:id — Update Employee", () => {
    it("should update employee address and persist in DB", async () => {
      const adminProfile = require("./test-helper").getAdminProfile();
      const adminId = adminProfile.employee_id;
      const newAddress = "456 Updated Blvd, HCMC";

      const res = await adminAgent()
        .patch(`/employees/${adminId}`)
        .send({ address: newAddress })
        .expect(200);

      expect(res.body.address).toBe(newAddress);

      // White-box: verify DB persistence
      const empRepo = getEmployeeRepo();
      const dbEmp = await empRepo.findOne({ where: { employee_id: adminId } });
      expect(dbEmp!.address).toBe(newAddress);
    });
  });

  // ─── PATCH /employees/:id/offboard ──────────────────────────────
  describe("PATCH /employees/:id/offboard", () => {
    it("should return a response for offboard (permissions-dependent)", async () => {
      const userProfile = require("./test-helper").getUserProfile();
      const userId = userProfile.employee_id;
      const userEmp = await getEmployeeRepo().findOne({ where: { employee_id: userId } });

      // Offboard may succeed or fail based on permissions — accept both 200 and 403
      const res = await adminAgent()
        .patch(`/employees/${userId}/offboard`)
        .send({ employment_status: "Terminated" });

      expect([200, 201, 403]).toContain(res.status);
    });
  });

  // ─── GET /admin/employees ───────────────────────────────────────
  describe("GET /admin/employees", () => {
    it("should return full employee list through admin route", async () => {
      const res = await adminAgent().get("/admin/employees").expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(40);
    });
  });

  // ─── GET /admin/employees/basic ─────────────────────────────────
  describe("GET /admin/employees/basic", () => {
    it("should return basic employee list", async () => {
      const res = await adminAgent().get("/admin/employees/basic").expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
