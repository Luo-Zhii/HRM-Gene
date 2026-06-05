/**
 * Gray-box Integration Tests — Holiday Module
 *
 * Black-box:  Supertest hits /admin/holidays/* endpoints.
 * White-box:  Direct TypeORM queries verify PublicHoliday records in DB.
 */
import {
  bootstrapGrayTest,
  teardownGrayTest,
  adminAgent,
  userAgent,
  agent,
  getPublicHolidayRepo,
} from "./test-helper";

describe("Holiday Module (Gray-box)", () => {
  beforeAll(async () => {
    await bootstrapGrayTest();
  });

  afterAll(async () => {
    await teardownGrayTest();
  });

  describe("GET /admin/holidays", () => {
    it("admin should get all holidays", async () => {
      const res = await adminAgent().get("/admin/holidays").expect(200);
      expect(res.body).toBeDefined();
    });

    it("should support year query param", async () => {
      const res = await adminAgent()
        .get("/admin/holidays")
        .query({ year: 2026 })
        .expect(200);
      expect(res.body).toBeDefined();
    });

    it("standard user should get 403", async () => {
      await userAgent().get("/admin/holidays").expect(403);
    });

    it("should return 401 without auth", async () => {
      await agent().get("/admin/holidays").expect(401);
    });
  });

  describe("GET /admin/holidays/upcoming", () => {
    it("admin should get upcoming holidays", async () => {
      const res = await adminAgent().get("/admin/holidays/upcoming").expect(200);
      expect(res.body).toBeDefined();
    });
  });

  describe("GET /admin/holidays/stats", () => {
    it("admin should get holiday stats", async () => {
      const res = await adminAgent().get("/admin/holidays/stats").expect(200);
      expect(res.body).toBeDefined();
    });
  });

  describe("POST /admin/holidays — Create Holiday", () => {
    let createdId: number;

    afterAll(async () => {
      if (createdId) {
        await getPublicHolidayRepo().delete({ id: createdId });
      }
    });

    it("should create a holiday and persist in DB", async () => {
      const res = await adminAgent()
        .post("/admin/holidays")
        .send({
          name: "Gray Test Holiday",
          date: "2026-12-25",
          type: "company",
          description: "Created by gray-box test",
          is_recurring: false,
          year: 2026,
        })
        .expect(201);

      expect(res.body).toBeDefined();
      createdId = res.body.id;

      // White-box: verify DB
      const repo = getPublicHolidayRepo();
      const dbHoliday = await repo.findOne({ where: { id: createdId } });
      expect(dbHoliday).toBeDefined();
      expect(dbHoliday!.name).toBe("Gray Test Holiday");
      expect(dbHoliday!.date).toBe("2026-12-25");
    });
  });

  describe("PUT /admin/holidays/:id — Update Holiday", () => {
    it("should update a holiday name", async () => {
      const repo = getPublicHolidayRepo();
      // Create temp
      const created = await repo.save(
        repo.create({ name: "Temp", date: "2026-07-01", type: "company", year: 2026 })
      );

      const res = await adminAgent()
        .put(`/admin/holidays/${created.id}`)
        .send({ name: "Updated Holiday Name" })
        .expect(200);

      expect(res.body).toBeDefined();

      const dbHoliday = await repo.findOne({ where: { id: created.id } });
      expect(dbHoliday!.name).toBe("Updated Holiday Name");

      await repo.delete({ id: created.id });
    });
  });

  describe("DELETE /admin/holidays/:id", () => {
    it("should delete a holiday and remove from DB", async () => {
      const repo = getPublicHolidayRepo();
      const created = await repo.save(
        repo.create({ name: "ToDelete", date: "2026-08-01", type: "company", year: 2026 })
      );

      await adminAgent().delete(`/admin/holidays/${created.id}`).expect(200);

      const dbHoliday = await repo.findOne({ where: { id: created.id } });
      expect(dbHoliday).toBeNull();
    });
  });
});
