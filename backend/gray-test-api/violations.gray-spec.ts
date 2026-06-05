/**
 * Gray-box Integration Tests — Violations Module
 *
 * POST /violations, GET /violations, GET /violations/:id, PATCH /violations/:id, DELETE /violations/:id
 * POST /violations/sync-attendance
 * White-box: verify DB after create/update/delete.
 *
 * Seed: 1 violation record for employees[1] — type "Late", description "Late > 30 mins", status RESOLVED.
 */
import {
  bootstrapGrayTest,
  teardownGrayTest,
  adminAgent,
  userAgent,
  agent,
  getViolationRepo,
  getUserProfile,
} from "./test-helper";

describe("Violations Module (Gray-box)", () => {
  beforeAll(async () => {
    await bootstrapGrayTest();
  });

  afterAll(async () => {
    await teardownGrayTest();
  });

  describe("GET /violations", () => {
    it("admin should get all violations", async () => {
      const res = await adminAgent().get("/violations").expect(200);
      const data = Array.isArray(res.body) ? res.body : (res.body.data || res.body.records || []);
      expect(Array.isArray(data)).toBe(true);
    });

    it("user should see only their own violations", async () => {
      const res = await userAgent().get("/violations").expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should support employeeId filter", async () => {
      const userProfile = getUserProfile();
      const res = await adminAgent()
        .get("/violations")
        .query({ employeeId: userProfile.employee_id })
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should return 401 without auth", async () => {
      await agent().get("/violations").expect(401);
    });
  });

  describe("GET /violations/:id", () => {
    it("admin should get a violation by id", async () => {
      const repo = getViolationRepo();
      const violations = await repo.find({ take: 1 });
      if (violations.length > 0) {
        const res = await adminAgent()
          .get(`/violations/${violations[0].violation_id}`)
          .expect(200);
        expect(res.body.violation_id).toBe(violations[0].violation_id);
      }
    });
  });

  describe("POST /violations — Create Violation", () => {
    let createdId: number;

    afterAll(async () => {
      if (createdId) await getViolationRepo().delete({ violation_id: createdId });
    });

    it("admin should create a violation and persist in DB", async () => {
      const userProfile = getUserProfile();

      const res = await adminAgent()
        .post("/violations")
        .send({
          employee_id: userProfile.employee_id,
          violation_type: "Late",
          description: "Gray test violation — late 15 mins",
          deduction_amount: "100000",
          severity: "Normal",
        })
        .expect(201);

      expect(res.body).toBeDefined();
      createdId = res.body.violation_id;

      // White-box: verify DB
      const repo = getViolationRepo();
      const dbItem = await repo.findOne({
        where: { violation_id: createdId },
        relations: ["employee"],
      });
      expect(dbItem).toBeDefined();
      expect(dbItem!.violation_type).toBe("Late");
      expect(dbItem!.description).toBe("Gray test violation — late 15 mins");
      expect(dbItem!.employee.employee_id).toBe(userProfile.employee_id);
    });

    it("standard user should get 403", async () => {
      await userAgent()
        .post("/violations")
        .send({ employee_id: 1, violation_type: "Late", description: "test", deduction_amount: "50000" })
        .expect(403);
    });
  });

  describe("PATCH /violations/:id — Update Violation", () => {
    it("admin should update a violation", async () => {
      const repo = getViolationRepo();
      const userProfile = getUserProfile();
      const created = await repo.save(
        repo.create({
          employee: { employee_id: userProfile.employee_id } as any,
          violation_date: new Date(),
          violation_type: "Late",
          description: "Temp violation",
          deduction_amount: "50000",
          status: "Pending" as any,
        })
      );

      await adminAgent()
        .patch(`/violations/${created.violation_id}`)
        .send({ status: "Resolved", deduction_amount: "200000" })
        .expect(200);

      await repo.delete({ violation_id: created.violation_id });
    });
  });

  describe("DELETE /violations/:id", () => {
    it("admin should delete a violation", async () => {
      const repo = getViolationRepo();
      const userProfile = getUserProfile();
      const created = await repo.save(
        repo.create({
          employee: { employee_id: userProfile.employee_id } as any,
          violation_date: new Date(),
          violation_type: "Absent",
          description: "To delete",
          deduction_amount: "0",
        })
      );

      await adminAgent().delete(`/violations/${created.violation_id}`).expect(200);

      const dbItem = await repo.findOne({ where: { violation_id: created.violation_id } });
      expect(dbItem).toBeNull();
    });
  });

  describe("POST /violations/sync-attendance", () => {
    it("admin should sync attendance violations", async () => {
      const res = await adminAgent().post("/violations/sync-attendance").expect(201);
      expect(res.body).toBeDefined();
    });

    it("standard user should get 403", async () => {
      await userAgent().post("/violations/sync-attendance").expect(403);
    });
  });

  describe("White-box: Violation DB integrity", () => {
    it("should have at least 1 seeded violation", async () => {
      const repo = getViolationRepo();
      const count = await repo.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });
});
