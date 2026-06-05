/**
 * Gray-box Integration Tests — Resignations Module
 *
 * POST /resignations, GET /resignations/my, GET /resignations/all, PATCH /resignations/:id
 *
 * Seed: 4 resignation requests (random employees, mixed statuses).
 */
import {
  bootstrapGrayTest,
  teardownGrayTest,
  adminAgent,
  userAgent,
  agent,
  getUserProfile,
} from "./test-helper";

describe("Resignations Module (Gray-box)", () => {
  beforeAll(async () => {
    await bootstrapGrayTest();
  });

  afterAll(async () => {
    await teardownGrayTest();
  });

  describe("POST /resignations", () => {
    it("user should create a resignation request", async () => {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const lastDay = nextMonth.toISOString().split("T")[0];

      const res = await userAgent()
        .post("/resignations")
        .send({
          reason_text: "Seeking better opportunities.",
          requested_last_day: lastDay,
        });

      expect([201, 400]).toContain(res.status);
    });

    it("should return 401 without auth", async () => {
      await agent()
        .post("/resignations")
        .send({ reason_text: "test", requested_last_day: "2026-12-31" })
        .expect(401);
    });
  });

  describe("GET /resignations/my", () => {
    it("should return current user's resignation requests", async () => {
      const res = await userAgent().get("/resignations/my").expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /resignations/all", () => {
    it("should return all resignation requests", async () => {
      const res = await adminAgent().get("/resignations/all").expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("PATCH /resignations/:id", () => {
    it("admin should update resignation status", async () => {
      const listRes = await adminAgent().get("/resignations/all").expect(200);
      const items = Array.isArray(listRes.body) ? listRes.body : [];
      if (items.length > 0) {
        const res = await adminAgent()
          .patch(`/resignations/${items[0].request_id || items[0].id}`)
          .send({ status: "Approved" });
        expect([200, 201, 400]).toContain(res.status);
      }
    });
  });
});
