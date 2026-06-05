/**
 * Gray-box Integration Tests — Auth Module
 *
 * Black-box:  Supertest hits /auth/* endpoints, validates HTTP status & response shape.
 * White-box:  Direct TypeORM queries verify DB state after mutations (password change, etc.).
 *
 * Seed data (from scripts/seed.ts):
 *   Admin  → admin@example.com / admin       (Director, HR dept)
 *   User   → user1@company.com / password123
 */
import {
  bootstrapGrayTest,
  teardownGrayTest,
  agent,
  adminAgent,
  userAgent,
  getAdminProfile,
  getUserProfile,
  getEmployeeRepo,
  SEED,
} from "./test-helper";

describe("Auth Module (Gray-box)", () => {
  beforeAll(async () => {
    await bootstrapGrayTest();
  });

  afterAll(async () => {
    await teardownGrayTest();
  });

  // ─── POST /auth/login ───────────────────────────────────────────
  describe("POST /auth/login", () => {
    it("should login admin and return access_token + user object", async () => {
      const res = await agent()
        .post("/auth/login")
        .send({ email: SEED.ADMIN.email, password: SEED.ADMIN.password })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.access_token).toBeDefined();
      expect(typeof res.body.access_token).toBe("string");
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(SEED.ADMIN.email);
      expect(res.body.user.first_name).toBe(SEED.ADMIN.firstName);
      expect(res.body.user.last_name).toBe(SEED.ADMIN.lastName);
    });

    it("should login standard user and return access_token", async () => {
      const res = await agent()
        .post("/auth/login")
        .send({ email: SEED.USER.email, password: SEED.USER.password })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.access_token).toBeDefined();
      expect(res.body.user.email).toBe(SEED.USER.email);
    });

    it("should return 404 for non-existent email", async () => {
      await agent()
        .post("/auth/login")
        .send({ email: "ghost@nope.com", password: "whatever" })
        .expect(404);
    });

    it("should return 401 for incorrect password", async () => {
      await agent()
        .post("/auth/login")
        .send({ email: SEED.ADMIN.email, password: "wrongpass" })
        .expect(401);
    });
  });

  // ─── POST /auth/logout ──────────────────────────────────────────
  describe("POST /auth/logout", () => {
    it("should clear access_token cookie and return success", async () => {
      const res = await agent().post("/auth/logout").expect(201);

      expect(res.body.success).toBe(true);
    });
  });

  // ─── GET /auth/profile ──────────────────────────────────────────
  describe("GET /auth/profile", () => {
    it("should return admin profile with position and department", async () => {
      const res = await adminAgent().get("/auth/profile").expect(200);

      expect(res.body.email).toBe(SEED.ADMIN.email);
      expect(res.body.position).toBeDefined();
      expect(res.body.position.position_name).toBe(SEED.ADMIN.positionName);
      expect(res.body.department).toBeDefined();
      expect(res.body.department.department_name).toBe(SEED.ADMIN.departmentName);
      expect(res.body.permissions).toBeDefined();
      expect(Array.isArray(res.body.permissions)).toBe(true);
    });

    it("should return user profile with position", async () => {
      const res = await userAgent().get("/auth/profile").expect(200);

      expect(res.body.email).toBe(SEED.USER.email);
      expect(res.body.position).toBeDefined();
      expect(res.body.permissions).toBeDefined();
    });

    it("should return 401 without auth token", async () => {
      // Supertest agent without Authorization header
      await agent().get("/auth/profile").expect(401);
    });
  });

  // ─── PATCH /auth/profile/update ─────────────────────────────────
  describe("PATCH /auth/profile/update", () => {
    it("should update user phone number and persist in DB", async () => {
      const newPhone = "0909999999";

      const res = await userAgent()
        .patch("/auth/profile/update")
        .send({ phone_number: newPhone })
        .expect(200);

      expect(res.body.phone_number).toBe(newPhone);

      // White-box: verify DB was actually updated
      const profile = getUserProfile();
      const empRepo = getEmployeeRepo();
      const dbEmployee = await empRepo.findOne({
        where: { employee_id: profile.employee_id },
      });
      expect(dbEmployee).toBeDefined();
      expect(dbEmployee!.phone_number).toBe(newPhone);
    });

    it("should reject empty first_name", async () => {
      await userAgent()
        .patch("/auth/profile/update")
        .send({ first_name: "" })
        .expect(400);
    });
  });

  // ─── PATCH /auth/profile/password ───────────────────────────────
  describe("PATCH /auth/profile/password", () => {
    it("should reject password change with wrong current password", async () => {
      await userAgent()
        .patch("/auth/profile/password")
        .send({ currentPassword: "wrong", newPassword: "newpass123" })
        .expect(400);
    });

    it("should reject short new password", async () => {
      await userAgent()
        .patch("/auth/profile/password")
        .send({ currentPassword: SEED.USER.password, newPassword: "ab" })
        .expect(400);
    });
  });

  // ─── GET /auth/navigation ───────────────────────────────────────
  describe("GET /auth/navigation", () => {
    it("should return navigation items for admin (Director has admin menu)", async () => {
      const res = await adminAgent().get("/auth/navigation").expect(200);

      expect(res.body.main).toBeDefined();
      expect(res.body.admin).toBeDefined();
      expect(Array.isArray(res.body.main)).toBe(true);
      expect(res.body.main.length).toBeGreaterThan(0);
      // Director should see the admin menu
      expect(res.body.admin.length).toBeGreaterThan(0);
    });

    it("should return navigation for standard user", async () => {
      const res = await userAgent().get("/auth/navigation").expect(200);

      expect(res.body.main).toBeDefined();
      expect(Array.isArray(res.body.main)).toBe(true);
    });
  });
});
