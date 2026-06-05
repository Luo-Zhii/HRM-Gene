/**
 * Gray-box Integration Tests — Company Profile Module
 *
 * GET /company-profile, PATCH /company-profile
 * White-box: verify DB after PATCH.
 *
 * Seed data: company_name = "HRM AI Inc.", tax_id = "123456789", city = "San Francisco", country = "USA".
 */
import {
  bootstrapGrayTest,
  teardownGrayTest,
  adminAgent,
  userAgent,
  agent,
  getCompanyProfileRepo,
} from "./test-helper";

describe("Company Profile Module (Gray-box)", () => {
  beforeAll(async () => {
    await bootstrapGrayTest();
  });

  afterAll(async () => {
    await teardownGrayTest();
  });

  describe("GET /company-profile", () => {
    it("should return company profile for authenticated user", async () => {
      const res = await userAgent().get("/company-profile").expect(200);
      expect(res.body.company_name).toBeDefined();
      expect(res.body.base_currency).toBeDefined();
    });

    it("should return 401 without auth", async () => {
      await agent().get("/company-profile").expect(401);
    });
  });

  describe("PATCH /company-profile", () => {
    it("admin should update company profile and persist in DB", async () => {
      const res = await adminAgent()
        .patch("/company-profile")
        .send({ address: "456 Updated St", city: "New York" })
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.city).toBe("New York");

      // White-box: verify DB
      const repo = getCompanyProfileRepo();
      const dbProfile = await repo.findOne({ where: {} });
      expect(dbProfile).toBeDefined();
      expect(dbProfile!.city).toBe("New York");

      // Restore
      await repo.update({ id: dbProfile!.id }, { city: "San Francisco" });
    });

    it("standard user should get 403", async () => {
      await userAgent()
        .patch("/company-profile")
        .send({ city: "HCMC" })
        .expect(403);
    });
  });
});
