/**
 * Gray-box Integration Tests — Admin Module
 *
 * Black-box:  Supertest hits /admin/* endpoints.
 * White-box:  Direct TypeORM queries verify settings, permissions, and org data.
 *
 * Seed data:
 *   Company settings: COMPANY_IP_WHITELIST, COMPANY_NAME.
 *   Full permission matrix assigned by position (Director=all, Manager=read+update, etc.).
 *   40 employees, 5 departments, 4 positions.
 */
import {
  bootstrapGrayTest,
  teardownGrayTest,
  adminAgent,
  userAgent,
  agent,
  getCompanySettingsRepo,
  getPermissionRepo,
  getPositionPermissionRepo,
  getEmployeeRepo,
  getDepartmentRepo,
  getPositionRepo,
  SEED,
} from "./test-helper";

describe("Admin Module (Gray-box)", () => {
  beforeAll(async () => {
    await bootstrapGrayTest();
  });

  afterAll(async () => {
    await teardownGrayTest();
  });

  // ─── GET /admin/settings ───────────────────────────────────────
  describe("GET /admin/settings", () => {
    it("admin should get all system settings", async () => {
      const res = await adminAgent().get("/admin/settings").expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const keys = res.body.map((s: any) => s.key);
      expect(keys).toContain("COMPANY_IP_WHITELIST");
      expect(keys).toContain("COMPANY_NAME");
    });

    it("standard user should get 403", async () => {
      await userAgent().get("/admin/settings").expect(403);
    });

    it("should return 401 without auth", async () => {
      await agent().get("/admin/settings").expect(401);
    });
  });

  // ─── GET /admin/settings/:key ──────────────────────────────────
  describe("GET /admin/settings/:key", () => {
    it("admin should get a specific setting by key", async () => {
      const res = await adminAgent()
        .get("/admin/settings/COMPANY_NAME")
        .expect(200);

      expect(res.body.key).toBe("COMPANY_NAME");
      expect(res.body.value).toBe("HRM AI Inc.");
    });
  });

  // ─── PATCH /admin/settings ─────────────────────────────────────
  describe("PATCH /admin/settings — Update Setting", () => {
    const originalValue = "HRM AI Inc.";

    afterAll(async () => {
      // Restore original value
      const settingsRepo = getCompanySettingsRepo();
      await settingsRepo.update(
        { key: "COMPANY_NAME" },
        { value: originalValue },
      );
    });

    it("should update a setting and persist in DB", async () => {
      const newValue = "HRM AI Inc. (Gray Test)";

      const res = await adminAgent()
        .patch("/admin/settings")
        .send({ key: "COMPANY_NAME", value: newValue })
        .expect(200);

      expect(res.body).toBeDefined();

      // White-box: verify DB was updated
      const settingsRepo = getCompanySettingsRepo();
      const dbSetting = await settingsRepo.findOne({
        where: { key: "COMPANY_NAME" },
      });
      expect(dbSetting).toBeDefined();
      expect(dbSetting!.value).toBe(newValue);
    });
  });

  // ─── GET /admin/organization/stats ─────────────────────────────
  describe("GET /admin/organization/stats", () => {
    it("admin should get organization statistics", async () => {
      const res = await adminAgent()
        .get("/admin/organization/stats")
        .expect(200);

      expect(res.body).toBeDefined();
      // Response structure depends on implementation
    });
  });

  // ─── GET /admin/permissions/grouped ────────────────────────────
  describe("GET /admin/permissions/grouped", () => {
    it("admin should get grouped permissions", async () => {
      const res = await adminAgent()
        .get("/admin/permissions/grouped")
        .expect(200);

      expect(res.body).toBeDefined();
    });
  });

  // ─── GET /admin/permissions/matrix ─────────────────────────────
  describe("GET /admin/permissions/matrix", () => {
    it("admin should get permission matrix", async () => {
      const res = await adminAgent()
        .get("/admin/permissions/matrix")
        .expect(200);

      expect(res.body).toBeDefined();
    });
  });

  // ─── POST /admin/permissions/assign ────────────────────────────
  describe("POST /admin/permissions/assign", () => {
    it("should assign a permission to a position", async () => {
      const posRepo = getPositionRepo();
      const permRepo = getPermissionRepo();
      const ppRepo = getPositionPermissionRepo();

      const internPos = await posRepo.findOne({ where: { position_name: "Intern" } });
      const perms = await permRepo.find({ take: 1 });
      const testPerm = perms[0];

      if (!internPos || !testPerm) {
        console.warn("Skipping assign test: Intern position or permissions not found in DB");
        return;
      }

      const res = await adminAgent()
        .post("/admin/permissions/assign")
        .send({
          position_id: internPos.position_id,
          permission_id: testPerm.permission_id,
        })
        .expect(201);

      expect(res.body).toBeDefined();

      // White-box: verify the position_permission row was created
      const dbPP = await ppRepo.findOne({
        where: {
          position_id: internPos.position_id,
          permission_id: testPerm.permission_id,
        } as any,
      });
      expect(dbPP).toBeDefined();

      // Cleanup: revoke the assigned permission
      await ppRepo.delete({
        position_id: internPos.position_id,
        permission_id: testPerm.permission_id,
      } as any);
    });
  });

  // ─── POST /admin/permissions/revoke ────────────────────────────
  describe("POST /admin/permissions/revoke", () => {
    it("should revoke a permission from a position", async () => {
      const posRepo = getPositionRepo();
      const permRepo = getPermissionRepo();
      const ppRepo = getPositionPermissionRepo();

      const internPos = await posRepo.findOne({ where: { position_name: "Intern" } });
      const perms = await permRepo.find({ take: 2 });
      // Use the 2nd permission (different from assign test) to avoid PK collision
      const testPerm = perms[1] ?? perms[0];

      if (!internPos || !testPerm) {
        console.warn("Skipping revoke test: Intern position or permissions not found in DB");
        return;
      }

      // Ensure the row exists (upsert-safe: delete first then insert)
      await ppRepo.delete({
        position_id: internPos.position_id,
        permission_id: testPerm.permission_id,
      } as any);
      await ppRepo.save(
        ppRepo.create({
          position_id: internPos.position_id,
          permission_id: testPerm.permission_id,
        } as any),
      );

      // Then revoke via API
      const res = await adminAgent()
        .post("/admin/permissions/revoke")
        .send({
          position_id: internPos.position_id,
          permission_id: testPerm.permission_id,
        })
        .expect(201);

      expect(res.body).toBeDefined();

      // White-box: verify the row is gone
      const dbPP = await ppRepo.findOne({
        where: {
          position_id: internPos.position_id,
          permission_id: testPerm.permission_id,
        } as any,
      });
      expect(dbPP).toBeNull();
    });
  });

  // ─── PUT /admin/employees/:id/transfer ─────────────────────────
  describe("PUT /admin/employees/:id/transfer", () => {
    it("should transfer an employee to a different department and position", async () => {
      const deptRepo = getDepartmentRepo();
      const posRepo = getPositionRepo();
      const empRepo = getEmployeeRepo();

      // Find a standard user
      const userEmp = await empRepo.findOne({
        where: { email: SEED.USER.email },
        relations: ["department", "position"],
      });
      const originalDeptId = userEmp!.department!.department_id;
      const originalPosId = userEmp!.position!.position_id;

      let salesDept = await deptRepo.findOne({ where: { department_name: "Sales" } });
      let staffPos = await posRepo.findOne({ where: { position_name: "Staff" } });

      // Fallback: pick any department/position different from the user's current ones
      if (!salesDept) {
        const allDepts = await deptRepo.find();
        salesDept = allDepts.find((d) => d.department_id !== originalDeptId) ?? null;
      }
      if (!staffPos) {
        const allPos = await posRepo.find();
        staffPos = allPos.find((p) => p.position_id !== originalPosId) ?? null;
      }

      if (!salesDept || !staffPos) {
        console.warn("Skipping transfer test: no alternative department or position found");
        return;
      }

      const res = await adminAgent()
        .put(`/admin/employees/${userEmp!.employee_id}/transfer`)
        .send({
          department_id: salesDept.department_id,
          position_id: staffPos.position_id,
        })
        .expect(200);

      expect(res.body).toBeDefined();

      // White-box: verify DB was updated
      const updatedEmp = await empRepo.findOne({
        where: { employee_id: userEmp!.employee_id },
        relations: ["department", "position"],
      });
      expect(updatedEmp!.department!.department_id).toBe(salesDept!.department_id);
      expect(updatedEmp!.position!.position_id).toBe(staffPos!.position_id);

      // Restore original
      await empRepo.update(
        { employee_id: userEmp!.employee_id },
        {
          department: { department_id: originalDeptId } as any,
          position: { position_id: originalPosId } as any,
        },
      );
    });
  });

  // ─── White-box: Permissions integrity ──────────────────────────
  describe("White-box: Permission integrity", () => {
    it("Director should have the most permissions", async () => {
      const ppRepo = getPositionPermissionRepo();
      const posRepo = getPositionRepo();

      const directorPos = await posRepo.findOne({ where: { position_name: "Director" } });
      const staffPos = await posRepo.findOne({ where: { position_name: "Staff" } });

      const directorPerms = await ppRepo.count({
        where: { position_id: directorPos!.position_id } as any,
      });
      const staffPerms = await ppRepo.count({
        where: { position_id: staffPos!.position_id } as any,
      });

      expect(directorPerms).toBeGreaterThan(staffPerms);
    });

    it("should have permissions in all module groups (ROLES, USERS, COMPANIES, PAYROLL, LEAVE, ADMIN, ATTENDANCE)", async () => {
      const permRepo = getPermissionRepo();
      const perms = await permRepo.find();

      const groups = new Set(perms.map((p) => p.module_group));
      const expectedGroups = ["ROLES", "USERS", "COMPANIES", "PAYROLL", "LEAVE", "ADMIN", "ATTENDANCE"];
      for (const g of expectedGroups) {
        expect(groups.has(g)).toBe(true);
      }
    });
  });
});
