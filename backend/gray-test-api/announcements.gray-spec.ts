/**
 * Gray-box Integration Tests — Announcements Module
 *
 * GET /announcements, GET /announcements/feed, POST, PATCH, DELETE
 * White-box: DB verify create/update/delete.
 *
 * Seed data: 3 announcements (Welcome, Townhall, Leave Policy).
 */
import {
  bootstrapGrayTest,
  teardownGrayTest,
  adminAgent,
  userAgent,
  agent,
  getAnnouncementRepo,
} from "./test-helper";

describe("Announcements Module (Gray-box)", () => {
  beforeAll(async () => {
    await bootstrapGrayTest();
  });

  afterAll(async () => {
    await teardownGrayTest();
  });

  describe("GET /announcements", () => {
    it("should return all announcements for authenticated user", async () => {
      const res = await userAgent().get("/announcements").expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should return 401 without auth", async () => {
      await agent().get("/announcements").expect(401);
    });
  });

  describe("GET /announcements/feed", () => {
    it("should return user-specific feed", async () => {
      const res = await userAgent().get("/announcements/feed").expect(200);
      expect(res.body).toBeDefined();
    });
  });

  describe("POST /announcements — Create Announcement", () => {
    let createdId: number;

    afterAll(async () => {
      if (createdId) await getAnnouncementRepo().delete({ id: createdId });
    });

    it("admin should create an announcement and persist in DB", async () => {
      const res = await adminAgent()
        .post("/announcements")
        .send({
          title: "Gray Test Announcement",
          content: "This is a test announcement from gray-box suite.",
          type: "General",
          target_audience: "all",
          priority: "Normal",
          status: "Active",
          delivery_methods: ["in_app"],
        })
        .expect(201);

      expect(res.body).toBeDefined();
      createdId = res.body.id || res.body.announcement_id;

      const repo = getAnnouncementRepo();
      const dbItem = await repo.findOne({ where: { id: createdId } });
      expect(dbItem).toBeDefined();
      expect(dbItem!.title).toBe("Gray Test Announcement");
    });

    it("standard user should get 403", async () => {
      await userAgent()
        .post("/announcements")
        .send({ title: "Nope", content: "Nope", type: "General", target_audience: "all", priority: "Normal", status: "Active", delivery_methods: ["in_app"] })
        .expect(403);
    });
  });

  describe("PATCH /announcements/:id — Update Announcement", () => {
    it("should update announcement title", async () => {
      const repo = getAnnouncementRepo();
      const created = await repo.save(
        repo.create({ title: "Temp", content: "Temp", type: "General", target_audience: "all", priority: "Normal", status: "Active", delivery_methods: ["in_app"] })
      );

      await adminAgent()
        .patch(`/announcements/${created.id}`)
        .send({ title: "Updated Title" })
        .expect(200);

      const dbItem = await repo.findOne({ where: { id: created.id } });
      expect(dbItem!.title).toBe("Updated Title");

      await repo.delete({ id: created.id });
    });
  });

  describe("DELETE /announcements/:id", () => {
    it("admin should delete an announcement and remove from DB", async () => {
      const repo = getAnnouncementRepo();
      const created = await repo.save(
        repo.create({ title: "ToDelete", content: "x", type: "General", target_audience: "all", priority: "Normal", status: "Active", delivery_methods: ["in_app"] })
      );

      await adminAgent().delete(`/announcements/${created.id}`).expect(200);

      const dbItem = await repo.findOne({ where: { id: created.id } });
      expect(dbItem).toBeNull();
    });
  });
});
