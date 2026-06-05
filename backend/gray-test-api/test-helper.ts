/**
 * Gray-Box Test Helper — Shared setup for all gray-spec test files.
 *
 * Architecture (TRUE gray-box):
 *  - Black-box:  Supertest hits the RUNNING dev server at BASE_URL (localhost:3001).
 *  - White-box:  A separate TypeORM DataSource (initialised with entity CLASSES)
 *                queries PostgreSQL directly to assert DB state changes.
 *
 * PREREQUISITE: The NestJS dev server must be running (`npm run dev`) and the DB
 *               must be seeded (`npm run seed`).
 */
import "dotenv/config";
import "reflect-metadata";
import * as request from "supertest";
import { DataSource } from "typeorm";

// ─── All entities (imported as CLASSES so TypeORM can discover metadata) ───
import { Employee } from "../src/entities/employee.entity";
import { Department } from "../src/entities/department.entity";
import { Position } from "../src/entities/position.entity";
import { TimeKeeping } from "../src/entities/timekeeping.entity";
import { LeaveRequest } from "../src/entities/leave-request.entity";
import { LeaveType } from "../src/entities/leave-type.entity";
import { LeaveBalance } from "../src/entities/leave-balance.entity";
import { Payslip } from "../src/entities/payslip.entity";
import { PayrollPeriod } from "../src/entities/payroll-period.entity";
import { Contract } from "../src/entities/contract.entity";
import { Violation } from "../src/entities/violation.entity";
import { SalaryConfig } from "../src/entities/salary-config.entity";
import { SalaryAdjustment } from "../src/entities/salary-adjustment.entity";
import { BankInfo } from "../src/entities/bank-info.entity";
import { CompanySettings } from "../src/entities/company-settings.entity";
import { Notification } from "../src/entities/notification.entity";
import { Permission } from "../src/entities/permission.entity";
import { PositionPermission } from "../src/entities/position-permission.entity";
import { PublicHoliday } from "../src/entities/public-holiday.entity";
import { Announcement } from "../src/entities/announcement.entity";
import { Message } from "../src/entities/message.entity";
import { CompanyProfile } from "../src/entities/company-profile.entity";
import { SalaryHistory } from "../src/entities/salary-history.entity";
import { Comment } from "../src/entities/comment.entity";

const ALL_ENTITIES = [
  Employee, Department, Position, TimeKeeping,
  LeaveRequest, LeaveType, LeaveBalance,
  Payslip, PayrollPeriod,
  Contract, Violation,
  SalaryConfig, SalaryAdjustment,
  BankInfo, CompanySettings, Notification,
  Permission, PositionPermission,
  PublicHoliday, Announcement, Message,
  CompanyProfile, SalaryHistory, Comment,
];

// ─── Configuration ───
const HOST = process.env.TEST_HOST || "http://localhost:3001";
const API = "/api";

/** Helper: wrap a supertest agent so all paths get /api prefix automatically. */
function apiAgent(raw: any): any {
  return new Proxy(raw, {
    get(target, prop) {
      const orig = target[prop];
      if (typeof orig === "function" && ["get","post","patch","put","delete","del"].includes(prop as string)) {
        return (path: string) => orig.call(target, API + path);
      }
      return orig;
    },
  });
}

// ─── Seed-derived deterministic credentials ───
// Source: backend/scripts/seed.ts
export const SEED = {
  ADMIN: {
    email: "admin@example.com",
    password: "admin",
    firstName: "System",
    lastName: "Admin",
    positionName: "Director",
    departmentName: "HR",
  },
  USER: {
    email: "user1@company.com",
    password: "password123",
    defaultPassword: "password123",
  },
  POSITIONS: ["Director", "Manager", "Staff", "Intern"] as const,
  DEPARTMENTS: ["Engineering", "Sales", "HR", "Marketing", "Finance"] as const,
  LEAVE_TYPES: [
    { name: "Annual Leave", defaultDays: 12 },
    { name: "Sick Leave", defaultDays: 5 },
    { name: "Unpaid Leave", defaultDays: 0 },
  ] as const,
} as const;

// ─── Globals ───
let _dataSource: DataSource | null = null;

let _adminToken: string | null = null;
let _userToken: string | null = null;
let _adminProfile: any = null;
let _userProfile: any = null;

// ─── Lifecycle hooks ───

/**
 * Call once in a top-level beforeAll.
 * Initialises a TypeORM DataSource (for white-box DB queries) and fetches JWT tokens.
 */
export async function bootstrapGrayTest(): Promise<void> {
  if (_dataSource?.isInitialized) return;

  // ── White-box: create a direct DB connection using entity classes ──
  _dataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "postgres",
    database: process.env.DB_NAME || "hrm",
    entities: ALL_ENTITIES,
    synchronize: false, // NEVER sync in tests — rely on seed data
    logging: false,
  });
  await _dataSource.initialize();

  // ── Black-box: fetch JWT tokens from the running server ──
  await refreshTokens();
}

/** Re-fetch JWT tokens (useful after a password change or token expiry). */
export async function refreshTokens(): Promise<void> {
  const ag = apiAgent(request.agent(HOST));

  const adminRes = await ag
    .post("/auth/login")
    .send({ email: SEED.ADMIN.email, password: SEED.ADMIN.password })
    .expect(201);

  _adminToken = adminRes.body.access_token;
  _adminProfile = adminRes.body.user;

  const userRes = await ag
    .post("/auth/login")
    .send({ email: SEED.USER.email, password: SEED.USER.password })
    .expect(201);

  _userToken = userRes.body.access_token;
  _userProfile = userRes.body.user;
}

/** Tear down the DB connection. Call in a top-level afterAll. */
export async function teardownGrayTest(): Promise<void> {
  if (_dataSource?.isInitialized) {
    await _dataSource.destroy();
    _dataSource = null;
  }
  _adminToken = null;
  _userToken = null;
  _adminProfile = null;
  _userProfile = null;
}

// ─── Black-box: Supertest agents (hit the running server) ───

/** Supertest agent pointing at the running server — no auth header. */
export function agent(): any {
  return apiAgent(request.agent(HOST));
}

/** Supertest agent with Admin Bearer token. */
export function adminAgent(): any {
  return apiAgent(request.agent(HOST)).set("Authorization", `Bearer ${getAdminToken()}`);
}

/** Supertest agent with standard User Bearer token. */
export function userAgent(): any {
  return apiAgent(request.agent(HOST)).set("Authorization", `Bearer ${getUserToken()}`);
}

// ─── Token / profile getters ───

export function getAdminToken(): string {
  if (!_adminToken) throw new Error("Admin token not available. Did bootstrapGrayTest() run?");
  return _adminToken;
}

export function getUserToken(): string {
  if (!_userToken) throw new Error("User token not available. Did bootstrapGrayTest() run?");
  return _userToken;
}

export function getAdminProfile(): any {
  return _adminProfile;
}

export function getUserProfile(): any {
  return _userProfile;
}

// ─── White-box: TypeORM DataSource getter ───

export function getDataSource(): DataSource {
  if (!_dataSource?.isInitialized) {
    throw new Error("DataSource not initialised. Did bootstrapGrayTest() run?");
  }
  return _dataSource;
}

// ─── White-box: repository getters ───

export function getEmployeeRepo() { return getDataSource().getRepository(Employee); }
export function getDepartmentRepo() { return getDataSource().getRepository(Department); }
export function getPositionRepo() { return getDataSource().getRepository(Position); }
export function getTimeKeepingRepo() { return getDataSource().getRepository(TimeKeeping); }
export function getLeaveRequestRepo() { return getDataSource().getRepository(LeaveRequest); }
export function getLeaveTypeRepo() { return getDataSource().getRepository(LeaveType); }
export function getLeaveBalanceRepo() { return getDataSource().getRepository(LeaveBalance); }
export function getPayslipRepo() { return getDataSource().getRepository(Payslip); }
export function getPayrollPeriodRepo() { return getDataSource().getRepository(PayrollPeriod); }
export function getContractRepo() { return getDataSource().getRepository(Contract); }
export function getViolationRepo() { return getDataSource().getRepository(Violation); }
export function getSalaryConfigRepo() { return getDataSource().getRepository(SalaryConfig); }
export function getSalaryAdjustmentRepo() { return getDataSource().getRepository(SalaryAdjustment); }
export function getBankInfoRepo() { return getDataSource().getRepository(BankInfo); }
export function getCompanySettingsRepo() { return getDataSource().getRepository(CompanySettings); }
export function getNotificationRepo() { return getDataSource().getRepository(Notification); }
export function getPermissionRepo() { return getDataSource().getRepository(Permission); }
export function getPositionPermissionRepo() { return getDataSource().getRepository(PositionPermission); }
export function getPublicHolidayRepo() { return getDataSource().getRepository(PublicHoliday); }
export function getAnnouncementRepo() { return getDataSource().getRepository(Announcement); }
export function getMessageRepo() { return getDataSource().getRepository(Message); }
export function getCompanyProfileRepo() { return getDataSource().getRepository(CompanyProfile); }
export function getSalaryHistoryRepo() { return getDataSource().getRepository(SalaryHistory); }
export function getCommentRepo() { return getDataSource().getRepository(Comment); }
