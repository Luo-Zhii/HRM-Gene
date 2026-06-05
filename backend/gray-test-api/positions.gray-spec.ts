/**
 * Gray-box Integration Tests — Positions Module
 *
 * Black-box:  Supertest hits /positions/* and /admin/positions/* endpoints.
 * White-box:  Direct TypeORM queries verify DB state after CRUD operations.
 *
 * Seed data: 4 positions — Director, Manager, Staff, Intern.
 */
import {
  bootstrapGrayTest,
  teardownGrayTest,
  adminAgent,
  userAgent,
  agent,
  getPositionRepo,
  SEED,
} from "./test-helper";

describe("Positions Module (Gray-box)", () => {
  beforeAll(async () => {
    await bootstrapGrayTest();
  });

  afterAll(async () => {
    await teardownGrayTest();
  });

  // ─── GET /positions ────────────────────────────────────────────
  describe("GET /positions", () => {
    it("should return all 4 seeded positions", async () => {
      const res = await agent().get("/positions").expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(4);

      const names = res.body.map((p: any) => p.position_name);
      for (const expected of SEED.POSITIONS) {
        expect(names).toContain(expected);
      }
    });

    it("should return each position with position_id and position_name", async () => {
      const res = await agent().get("/positions").expect(200);

      for (const pos of res.body) {
        expect(pos.position_id).toBeDefined();
        expect(typeof pos.position_id).toBe("number");
        expect(pos.position_name).toBeDefined();
        expect(typeof pos.position_name).toBe("string");
      }
    });
  });

  // ─── GET /positions/:id ────────────────────────────────────────
  describe("GET /positions/:id", () => {
    it("should return a single position by id", async () => {
      const posRepo = getPositionRepo();
      const allPos = await posRepo.find();
      const dirPos = allPos.find((p) => p.position_name === "Director");

      const res = await agent()
        .get(`/positions/${dirPos!.position_id}`)
        .expect(200);

      expect(res.body.position_id).toBe(dirPos!.position_id);
      expect(res.body.position_name).toBe("Director");
    });

    it("should return 400 for invalid id", async () => {
      await agent().get("/positions/xyz").expect(400);
    });
  });

  // ─── POST /positions — Create Position ─────────────────────────
  describe("POST /positions — Create Position", () => {
    const newPosName = `TestRole_${Date.now()}`;
    let createdId: number;

    afterAll(async () => {
      if (createdId) {
        await getPositionRepo().delete({ position_id: createdId });
      }
    });

    it("should create a new position and persist in DB", async () => {
      const res = await agent()
        .post("/positions")
        .send({ position_name: newPosName })
        .expect(201);

      expect(res.body.position_name).toBe(newPosName);
      expect(res.body.position_id).toBeDefined();
      createdId = res.body.position_id;

      // White-box: verify DB persistence
      const posRepo = getPositionRepo();
      const dbPos = await posRepo.findOne({ where: { position_id: createdId } });
      expect(dbPos).toBeDefined();
      expect(dbPos!.position_name).toBe(newPosName);
    });
  });

  // ─── PATCH /positions/:id — Update Position ────────────────────
  describe("PATCH /positions/:id — Update Position", () => {
    it("should update position name and persist in DB", async () => {
      const posRepo = getPositionRepo();
      const allPos = await posRepo.find();
      const internPos = allPos.find((p) => p.position_name === "Intern");
      const originalName = internPos!.position_name;
      const updatedName = "Trainee";

      const res = await agent()
        .patch(`/positions/${internPos!.position_id}`)
        .send({ position_name: updatedName })
        .expect(200);

      expect(res.body.position_name).toBe(updatedName);

      // White-box: verify DB
      const dbPos = await posRepo.findOne({
        where: { position_id: internPos!.position_id },
      });
      expect(dbPos!.position_name).toBe(updatedName);

      // Restore
      await posRepo.update(
        { position_id: internPos!.position_id },
        { position_name: originalName as string },
      );
    });
  });

  // ─── DELETE /positions/:id (requires auth + manage:system) ─────
  describe("DELETE /positions/:id", () => {
    it("should return 401 when deleting without auth", async () => {
      await agent().delete("/positions/1").expect(401);
    });

    it("should return 403 when standard user tries to delete", async () => {
      await userAgent().delete("/positions/1").expect(403);
    });

    it("admin (Director) should be able to delete a position", async () => {
      const tempName = `ToDeletePos_${Date.now()}`;
      const posRepo = getPositionRepo();
      const created = await posRepo.save(
        posRepo.create({ position_name: tempName }),
      );

      const res = await adminAgent()
        .delete(`/positions/${created.position_id}`)
        .expect(200);

      expect(res.body).toBeDefined();

      // White-box: verify deleted from DB
      const dbPos = await posRepo.findOne({
        where: { position_id: created.position_id },
      });
      expect(dbPos).toBeNull();
    });
  });

  // ─── GET /admin/positions ──────────────────────────────────────
  describe("GET /admin/positions", () => {
    it("admin should get all positions via admin route", async () => {
      const res = await adminAgent().get("/admin/positions").expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(4);
    });
  });
});
