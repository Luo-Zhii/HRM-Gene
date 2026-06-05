/**
 * Gray-box Integration Tests — Messages Module
 *
 * GET /messages/:otherUserId, POST /messages, PATCH /messages/:otherUserId/read, DELETE /messages/:id
 * White-box: verify message persistence in DB.
 */
import {
  bootstrapGrayTest,
  teardownGrayTest,
  adminAgent,
  userAgent,
  agent,
  getMessageRepo,
  getUserProfile,
  getAdminProfile,
} from "./test-helper";

describe("Messages Module (Gray-box)", () => {
  beforeAll(async () => {
    await bootstrapGrayTest();
  });

  afterAll(async () => {
    await teardownGrayTest();
  });

  describe("POST /messages", () => {
    it("should send a message to another user and persist in DB", async () => {
      const adminProfile = getAdminProfile();

      const res = await userAgent()
        .post("/messages")
        .send({ receiverId: adminProfile.employee_id, content: "Gray test message hello" })
        .expect(201);

      expect(res.body).toBeDefined();
      expect(res.body.content).toBe("Gray test message hello");

      // White-box: verify DB
      const repo = getMessageRepo();
      const dbMsg = await repo.findOne({
        where: { content: "Gray test message hello" },
        relations: ["sender", "receiver"],
      });
      expect(dbMsg).toBeDefined();
      expect(dbMsg!.receiver.employee_id).toBe(adminProfile.employee_id);
    });

    it("should return 401 without auth", async () => {
      await agent()
        .post("/messages")
        .send({ receiverId: 1, content: "test" })
        .expect(401);
    });
  });

  describe("GET /messages/:otherUserId", () => {
    it("should get messages with another user", async () => {
      const adminProfile = getAdminProfile();
      const res = await userAgent()
        .get(`/messages/${adminProfile.employee_id}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("PATCH /messages/:otherUserId/read", () => {
    it("should mark messages as read", async () => {
      const adminProfile = getAdminProfile();
      const res = await userAgent()
        .patch(`/messages/${adminProfile.employee_id}/read`)
        .expect(200);
      expect(res.body).toBeDefined();
    });
  });

  describe("DELETE /messages/:id", () => {
    it("should soft-delete a message", async () => {
      const adminProfile = getAdminProfile();
      // Send then delete
      const sendRes = await userAgent()
        .post("/messages")
        .send({ receiverId: adminProfile.employee_id, content: "To delete msg" })
        .expect(201);
      const msgId = sendRes.body.id;
      if (msgId) {
        await userAgent().delete(`/messages/${msgId}`).expect(200);
      }
    });
  });
});
