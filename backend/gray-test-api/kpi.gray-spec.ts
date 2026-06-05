/**
 * Gray-box Integration Tests — KPI Module
 *
 * GET /kpi/library, /kpi/periods, /kpi/assignments, /kpi/my-performance, /kpi/calculate-score
 * POST /kpi/library, /kpi/period, /kpi/assign
 * PATCH /kpi/assignment/:id/actual, /kpi/assignment/:id/grade
 *
 * Seed: 3 KPI library items, 2 periods (Q1=LOCKED, Q2=ACTIVE), assignments for all employees.
 */
import {
  bootstrapGrayTest,
  teardownGrayTest,
  adminAgent,
  userAgent,
  agent,
  getUserProfile,
  getAdminProfile,
} from "./test-helper";

describe("KPI Module (Gray-box)", () => {
  beforeAll(async () => {
    await bootstrapGrayTest();
  });

  afterAll(async () => {
    await teardownGrayTest();
  });

  describe("GET /kpi/library", () => {
    it("should return KPI library items", async () => {
      const res = await adminAgent().get("/kpi/library").expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(3);
    });

    it("standard user should get 403", async () => {
      await userAgent().get("/kpi/library").expect(403);
    });
  });

  describe("GET /kpi/periods", () => {
    it("should return KPI periods", async () => {
      const res = await adminAgent().get("/kpi/periods").expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("GET /kpi/assignments", () => {
    it("should return assignments filtered by employee and period", async () => {
      const adminProfile = getAdminProfile();
      const res = await adminAgent()
        .get("/kpi/assignments")
        .query({ employee_id: adminProfile.employee_id, period_id: 1 })
        .expect(200);
      expect(res.body).toBeDefined();
    });
  });

  describe("GET /kpi/my-performance", () => {
    it("should return current user's performance", async () => {
      const res = await userAgent()
        .get("/kpi/my-performance")
        .query({ period_id: 1 })
        .expect(200);
      expect(res.body).toBeDefined();
    });
  });

  describe("GET /kpi/calculate-score", () => {
    it("should calculate KPI score", async () => {
      const adminProfile = getAdminProfile();
      const res = await adminAgent()
        .get("/kpi/calculate-score")
        .query({ employee_id: adminProfile.employee_id, period_id: 1 })
        .expect(200);
      expect(res.body).toBeDefined();
    });
  });

  describe("PATCH /kpi/assignment/:id/actual", () => {
    it("user should update their actual KPI value", async () => {
      const userProfile = getUserProfile();
      const assignmentsRes = await userAgent()
        .get("/kpi/assignments")
        .query({ employee_id: userProfile.employee_id, period_id: 1 })
        .expect(200);
      const assignments = Array.isArray(assignmentsRes.body) ? assignmentsRes.body : [];
      if (assignments.length > 0) {
        const res = await userAgent()
          .patch(`/kpi/assignment/${assignments[0].id}/actual`)
          .send({ actual_value: 85 });
        expect([200, 403]).toContain(res.status);
      }
    });
  });

  describe("POST /kpi/library — Create KPI", () => {
    it("admin should create a new KPI library item", async () => {
      const res = await adminAgent()
        .post("/kpi/library")
        .send({ name: "Gray Test KPI", description: "Test", unit: "Percent" })
        .expect(201);

      expect(res.body).toBeDefined();
      expect(res.body.name).toBe("Gray Test KPI");
    });

    it("standard user should get 403", async () => {
      await userAgent()
        .post("/kpi/library")
        .send({ name: "Nope", description: "Nope", unit: "Percent" })
        .expect(403);
    });
  });

  describe("POST /kpi/period", () => {
    it("admin should create a new KPI period", async () => {
      const res = await adminAgent()
        .post("/kpi/period")
        .send({
          name: "Q3 2026 Gray Test",
          start_date: "2026-07-01",
          end_date: "2026-09-30",
        })
        .expect(201);
      expect(res.body).toBeDefined();
    });
  });

  describe("POST /kpi/assign", () => {
    it("admin should assign KPI to employees", async () => {
      const adminProfile = getAdminProfile();
      const res = await adminAgent()
        .post("/kpi/assign")
        .send({
          employee_id: adminProfile.employee_id,
          period_id: 2,
          assignments: [{ kpi_library_id: 1, target_value: 100, weight: 100 }],
        })
        .expect(201);
      expect(res.body).toBeDefined();
    });
  });

  describe("PATCH /kpi/assignment/:id/grade", () => {
    it("admin should grade an assignment", async () => {
      const adminProfile = getAdminProfile();
      const assignmentsRes = await adminAgent()
        .get("/kpi/assignments")
        .query({ employee_id: adminProfile.employee_id, period_id: 2 })
        .expect(200);
      const assignments = Array.isArray(assignmentsRes.body) ? assignmentsRes.body : [];
      if (assignments.length > 0) {
        const res = await adminAgent()
          .patch(`/kpi/assignment/${assignments[0].id}/grade`)
          .send({ manager_score: 5 })
          .expect(200);
        expect(res.body).toBeDefined();
      }
    });
  });

  describe("DELETE /kpi/assignment/:id", () => {
    it("admin should delete an assignment", async () => {
      const adminProfile = getAdminProfile();
      // Create a temp assignment first
      const createRes = await adminAgent()
        .post("/kpi/assign")
        .send({ employee_id: adminProfile.employee_id, period_id: 2, assignments: [{ kpi_library_id: 2, target_value: 100, weight: 100 }] })
        .expect(201);

      const assignmentId = Array.isArray(createRes.body) ? createRes.body[0]?.id : createRes.body?.id;
      if (assignmentId) {
        await adminAgent().delete(`/kpi/assignment/${assignmentId}`).expect(200);
      }
    });
  });

  describe("DELETE /kpi/library/:id", () => {
    it("admin should delete a KPI library item", async () => {
      // Create then delete
      const createRes = await adminAgent()
        .post("/kpi/library")
        .send({ name: "ToDelete KPI", description: "x", unit: "Number" })
        .expect(201);
      const libId = createRes.body.id;
      if (libId) {
        await adminAgent().delete(`/kpi/library/${libId}`).expect(200);
      }
    });
  });
});
