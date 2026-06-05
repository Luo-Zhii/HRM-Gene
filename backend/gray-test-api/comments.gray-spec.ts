/**
 * Gray-box Integration Tests — Comments Module
 *
 * POST /comments, GET /comments/:entityType/:entityId
 */
import {
  bootstrapGrayTest,
  teardownGrayTest,
  adminAgent,
  userAgent,
  agent,
  getCommentRepo,
} from "./test-helper";

describe("Comments Module (Gray-box)", () => {
  beforeAll(async () => {
    await bootstrapGrayTest();
  });

  afterAll(async () => {
    await teardownGrayTest();
  });

  describe("POST /comments", () => {
    it("should create a comment", async () => {
      const res = await userAgent()
        .post("/comments")
        .send({ entityType: "employee", entityId: "1", content: "Gray test comment" })
        .expect(201);

      expect(res.body).toBeDefined();
    });

    it("should return 401 without auth", async () => {
      await agent()
        .post("/comments")
        .send({ entityType: "employee", entityId: "1", content: "test" })
        .expect(401);
    });
  });

  describe("GET /comments/:entityType/:entityId", () => {
    it("should return comments for an entity", async () => {
      const res = await userAgent().get("/comments/employee/1").expect(200);
      expect(res.body).toBeDefined();
    });
  });
});
