/**
 * Gray-box Integration Tests — Departments Module
 *
 * Black-box:  Supertest hits /departments/* and /admin/departments/* endpoints.
 * White-box:  Direct TypeORM queries verify DB state after CRUD operations.
 *
 * Seed data: 5 departments — Engineering, Sales, HR, Marketing, Finance.
 */
import {
  bootstrapGrayTest,
  teardownGrayTest,
  adminAgent,
  userAgent,
  agent,
  getDepartmentRepo,
  SEED,
} from "./test-helper";

describe("Departments Module (Gray-box)", () => {
  beforeAll(async () => {
    await bootstrapGrayTest();
  });

  afterAll(async () => {
    await teardownGrayTest();
  });

  // ─── GET /departments ──────────────────────────────────────────
  describe("GET /departments", () => {
    it("should return all 5 seeded departments (no auth needed)", async () => {
      const res = await agent().get("/departments").expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(5);

      const names = res.body.map((d: any) => d.department_name);
      for (const expected of SEED.DEPARTMENTS) {
        expect(names).toContain(expected);
      }
    });

    it("should return each department with department_id and department_name", async () => {
      const res = await agent().get("/departments").expect(200);

      for (const dept of res.body) {
        expect(dept.department_id).toBeDefined();
        expect(typeof dept.department_id).toBe("number");
        expect(dept.department_name).toBeDefined();
        expect(typeof dept.department_name).toBe("string");
      }
    });
  });

  // ─── GET /departments/:id ──────────────────────────────────────
  describe("GET /departments/:id", () => {
    it("should return a single department by id", async () => {
      const deptRepo = getDepartmentRepo();
      const allDepts = await deptRepo.find();
      const hrDept = allDepts.find((d) => d.department_name === "HR");

      const res = await agent()
        .get(`/departments/${hrDept!.department_id}`)
        .expect(200);

      expect(res.body.department_id).toBe(hrDept!.department_id);
      expect(res.body.department_name).toBe("HR");
    });

    it("should return 400 for invalid id", async () => {
      await agent().get("/departments/abc").expect(400);
    });
  });

  // ─── POST /departments (unprotected create) ────────────────────
  describe("POST /departments — Create Department", () => {
    const newDeptName = `TestDept_${Date.now()}`;
    let createdId: number;

    afterAll(async () => {
      if (createdId) {
        await getDepartmentRepo().delete({ department_id: createdId });
      }
    });

    it("should create a new department and persist in DB", async () => {
      const res = await agent()
        .post("/departments")
        .send({ department_name: newDeptName })
        .expect(201);

      expect(res.body.department_name).toBe(newDeptName);
      expect(res.body.department_id).toBeDefined();
      createdId = res.body.department_id;

      // White-box: verify DB persistence
      const deptRepo = getDepartmentRepo();
      const dbDept = await deptRepo.findOne({ where: { department_id: createdId } });
      expect(dbDept).toBeDefined();
      expect(dbDept!.department_name).toBe(newDeptName);
    });
  });

  // ─── PATCH /departments/:id — Update Department ────────────────
  describe("PATCH /departments/:id — Update Department", () => {
    it("should update department name and persist in DB", async () => {
      const deptRepo = getDepartmentRepo();
      const allDepts = await deptRepo.find();
      const salesDept = allDepts.find((d) => d.department_name === "Sales");
      const originalName = salesDept!.department_name;
      const updatedName = "Sales & BD";

      const res = await agent()
        .patch(`/departments/${salesDept!.department_id}`)
        .send({ department_name: updatedName })
        .expect(200);

      expect(res.body.department_name).toBe(updatedName);

      // White-box: verify in DB
      const dbDept = await deptRepo.findOne({
        where: { department_id: salesDept!.department_id },
      });
      expect(dbDept!.department_name).toBe(updatedName);

      // Restore original name
      await deptRepo.update(
        { department_id: salesDept!.department_id },
        { department_name: originalName as string },
      );
    });
  });

  // ─── DELETE /departments/:id (requires auth + manage:system) ───
  describe("DELETE /departments/:id", () => {
    it("should return 401 when deleting without auth", async () => {
      await agent().delete("/departments/1").expect(401);
    });

    it("should return 403 when a standard user tries to delete", async () => {
      await userAgent().delete("/departments/1").expect(403);
    });

    it("admin should be able to delete a department", async () => {
      // First create a temp department to delete
      const tempName = `ToDelete_${Date.now()}`;
      const deptRepo = getDepartmentRepo();
      const created = await deptRepo.save(
        deptRepo.create({ department_name: tempName }),
      );

      const res = await adminAgent()
        .delete(`/departments/${created.department_id}`)
        .expect(200);

      expect(res.body).toBeDefined();

      // White-box: verify it's gone from DB
      const dbDept = await deptRepo.findOne({
        where: { department_id: created.department_id },
      });
      expect(dbDept).toBeNull();
    });
  });

  // ─── GET /admin/departments ────────────────────────────────────
  describe("GET /admin/departments", () => {
    it("admin should get all departments via admin route", async () => {
      const res = await adminAgent().get("/admin/departments").expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(5);
    });
  });
});
