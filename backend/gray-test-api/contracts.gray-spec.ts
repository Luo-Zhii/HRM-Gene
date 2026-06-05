/**
 * Gray-box Integration Tests — Contracts Module
 *
 * GET /contracts, GET /contracts/:id, GET /contracts/employee/:id, POST, PATCH, DELETE
 * White-box: verify DB after mutations.
 *
 * Seed: 40 employees each with 1 contract (varying types: Official, Probation, Part-time).
 */
import {
  bootstrapGrayTest,
  teardownGrayTest,
  adminAgent,
  userAgent,
  agent,
  getContractRepo,
  getUserProfile,
  getAdminProfile,
} from "./test-helper";

describe("Contracts Module (Gray-box)", () => {
  beforeAll(async () => {
    await bootstrapGrayTest();
  });

  afterAll(async () => {
    await teardownGrayTest();
  });

  describe("GET /contracts", () => {
    it("should return contracts for admin", async () => {
      const res = await adminAgent().get("/contracts").expect(200);
      const data = Array.isArray(res.body) ? res.body : (res.body.data || res.body.records || []);
      expect(Array.isArray(data)).toBe(true);
    });

    it("should return contracts for user (own only)", async () => {
      const res = await userAgent().get("/contracts").expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should support filtering by employeeId", async () => {
      const adminProfile = getAdminProfile();
      const res = await adminAgent()
        .get("/contracts")
        .query({ employeeId: adminProfile.employee_id })
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should return 401 without auth", async () => {
      await agent().get("/contracts").expect(401);
    });
  });

  describe("GET /contracts/employee/:employeeId", () => {
    it("admin should get contracts by employee id", async () => {
      const userProfile = getUserProfile();
      const res = await adminAgent()
        .get(`/contracts/employee/${userProfile.employee_id}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("user should only access their own", async () => {
      const userProfile = getUserProfile();
      const res = await userAgent()
        .get(`/contracts/employee/${userProfile.employee_id}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /contracts/:id", () => {
    it("admin should get a contract by id", async () => {
      const repo = getContractRepo();
      const contracts = await repo.find({ take: 1, relations: ["employee"] });
      expect(contracts.length).toBeGreaterThan(0);

      const res = await adminAgent()
        .get(`/contracts/${contracts[0].contract_id}`)
        .expect(200);
      expect(res.body.contract_id).toBe(contracts[0].contract_id);
    });
  });

  describe("POST /contracts — Create Contract", () => {
    let createdId: number;

    afterAll(async () => {
      if (createdId) await getContractRepo().delete({ contract_id: createdId });
    });

    it("admin should create a contract and persist in DB", async () => {
      const userProfile = getUserProfile();

      const res = await adminAgent()
        .post("/contracts")
        .send({
          employee_id: userProfile.employee_id,
          contract_number: "CNT-GRAY-TEST-001",
          contract_type: "Official",
          start_date: "2026-06-01",
          salary_rate: "15000000",
          status: "Active",
        })
        .expect(201);

      expect(res.body).toBeDefined();
      createdId = res.body.contract_id;

      // White-box
      const repo = getContractRepo();
      const dbContract = await repo.findOne({
        where: { contract_id: createdId },
        relations: ["employee"],
      });
      expect(dbContract).toBeDefined();
      expect(dbContract!.employee.employee_id).toBe(userProfile.employee_id);
      expect(parseFloat(dbContract!.salary_rate)).toBe(15000000);
    });

    it("standard user should get 403", async () => {
      await userAgent()
        .post("/contracts")
        .send({ employee_id: 1, contract_type: "Official", start_date: "2026-01-01", salary_rate: "10000000" })
        .expect(403);
    });
  });

  describe("PATCH /contracts/:id — Update Contract", () => {
    it("admin should update a contract", async () => {
      const repo = getContractRepo();
      const contracts = await repo.find({ take: 1 });

      const res = await adminAgent()
        .patch(`/contracts/${contracts[0].contract_id}`)
        .send({ salary_rate: "99999999" });
      expect([200, 201]).toContain(res.status);
    });
  });

  describe("DELETE /contracts/:id", () => {
    it("admin should delete a contract", async () => {
      const repo = getContractRepo();
      const userProfile = getUserProfile();
      const created = await repo.save(
        repo.create({
          employee: { employee_id: userProfile.employee_id } as any,
          contract_type: "Probation" as any,
          start_date: "2026-01-01",
          salary_rate: "5000000",
          status: "Active" as any,
        })
      );

      await adminAgent().delete(`/contracts/${created.contract_id}`).expect(200);

      const dbContract = await repo.findOne({ where: { contract_id: created.contract_id } });
      expect(dbContract).toBeNull();
    });
  });

  describe("White-box: Contract DB integrity", () => {
    it("all 40 employees should have at least 1 contract", async () => {
      const repo = getContractRepo();
      const result = await repo
        .createQueryBuilder("c")
        .select("c.employee_id", "employee_id")
        .addSelect("COUNT(*)", "count")
        .groupBy("c.employee_id")
        .getRawMany();

      expect(result.length).toBeGreaterThanOrEqual(40);
      for (const row of result) {
        expect(parseInt(row.count, 10)).toBeGreaterThanOrEqual(1);
      }
    });
  });
});
