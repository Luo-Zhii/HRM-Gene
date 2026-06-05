/**
 * Gray-box Integration Tests — Notifications Module
 *
 * GET /notifications, PATCH /notifications/:id/read, DELETE /notifications/:id, POST /notifications/announce
 * White-box: verify notification state in DB.
 *
 * Seed: 40 welcome notifications (one per employee).
 */
import {
  bootstrapGrayTest,
  teardownGrayTest,
  adminAgent,
  userAgent,
  agent,
  getNotificationRepo,
  getUserProfile,
} from "./test-helper";

describe("Notifications Module (Gray-box)", () => {
  beforeAll(async () => {
    await bootstrapGrayTest();
  });

  afterAll(async () => {
    await teardownGrayTest();
  });

  describe("GET /notifications", () => {
    it("should return notifications for authenticated user", async () => {
      const res = await userAgent().get("/notifications").expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should return 401 without auth", async () => {
      await agent().get("/notifications").expect(401);
    });
  });

  describe("PATCH /notifications/:id/read", () => {
    it("should mark a notification as read and persist in DB", async () => {
      const userProfile = getUserProfile();
      const repo = getNotificationRepo();
      const notifications = await repo.find({
        where: { userId: userProfile.employee_id, isRead: false },
        take: 1,
      });

      if (notifications.length > 0) {
        const notifId = notifications[0].id;
        const res = await userAgent()
          .patch(`/notifications/${notifId}/read`)
          .expect(200);
        expect(res.body).toBeDefined();

        // White-box: verify DB updated
        const dbNotif = await repo.findOne({ where: { id: notifId } });
        expect(dbNotif!.isRead).toBe(true);
      }
    });
  });

  describe("DELETE /notifications/:id", () => {
    it("should delete a notification", async () => {
      const userProfile = getUserProfile();
      const repo = getNotificationRepo();
      // Create a fresh notification for the user to delete
      const created = await repo.save(
        repo.create({
          userId: userProfile.employee_id,
          user: { employee_id: userProfile.employee_id } as any,
          title: "To Delete",
          message: "Delete me",
          type: "announcement" as any,
        })
      );

      await userAgent().delete(`/notifications/${created.id}`).expect(200);

      const dbNotif = await repo.findOne({ where: { id: created.id } });
      expect(dbNotif).toBeNull();
    });
  });

  describe("POST /notifications/announce", () => {
    it("admin should send announcement to all users", async () => {
      const res = await adminAgent()
        .post("/notifications/announce")
        .send({ title: "Gray Test Announce", message: "Hello everyone from gray test" })
        .expect(201);

      expect(res.body).toBeDefined();
    });

    it("standard user should get 403", async () => {
      await userAgent()
        .post("/notifications/announce")
        .send({ title: "Nope", message: "Nope" })
        .expect(403);
    });
  });

  describe("White-box: Notification DB integrity", () => {
    it("should have at least 40 seeded welcome notifications", async () => {
      const repo = getNotificationRepo();
      const count = await repo.count({
        where: { title: "Welcome to the team!" },
      });
      expect(count).toBeGreaterThanOrEqual(40);
    });
  });
});
