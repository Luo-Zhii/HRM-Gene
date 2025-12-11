import "reflect-metadata";
import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import "dotenv/config";

// --- 1. IMPORT TẤT CẢ ENTITY ---
import { Permission } from "../src/entities/permission.entity";
import { Position } from "../src/entities/position.entity";
import { PositionPermission } from "../src/entities/position-permission.entity";
import { Employee } from "../src/entities/employee.entity";
import { Department } from "../src/entities/department.entity";
import { BankInfo } from "../src/entities/bank-info.entity";
import { Contract, ContractType, ContractStatus } from "../src/entities/contract.entity";
import { TimeKeeping } from "../src/entities/timekeeping.entity";
import { Payslip, PayslipStatus } from "../src/entities/payslip.entity";
import { LeaveRequest } from "../src/entities/leave-request.entity";
import { LeaveType } from "../src/entities/leave-type.entity";
import { LeaveBalance } from "../src/entities/leave-balance.entity";
import { AuditLog } from "../src/entities/audit-log.entity";
import { CompanySettings } from "../src/entities/company-settings.entity";
import { Violation, ViolationStatus } from "../src/entities/violation.entity";
import { SalaryHistory } from "../src/entities/salary-history.entity";
import { SalaryConfig } from "../src/entities/salary-config.entity";
import { PayrollPeriod, PayrollPeriodStatus } from "../src/entities/payroll-period.entity";

// Helper functions
function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

async function run() {
  const ds = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "postgres",
    database: process.env.DB_NAME || "hrm",
    entities: [
      Permission, Position, PositionPermission, Employee, Department,
      BankInfo, Contract, TimeKeeping, Payslip, LeaveRequest,
      LeaveType, LeaveBalance, AuditLog, CompanySettings, Violation,
      SalaryHistory, SalaryConfig, PayrollPeriod,
    ],
    // 🔥 QUAN TRỌNG: dropSchema: true sẽ xóa sạch DB cũ và tạo lại từ đầu.
    // Giúp tránh mọi lỗi về cột cũ, cột mới, null value.
    dropSchema: true,
    synchronize: true, 
  } as any);

  await ds.initialize();
  console.log("✅ Data Source initialized & Database Reset (Clean Slate)!");

  // --- 2. GET REPOSITORIES ---
  const permRepo = ds.getRepository(Permission);
  const posRepo = ds.getRepository(Position);
  const ppRepo = ds.getRepository(PositionPermission);
  const empRepo = ds.getRepository(Employee);
  const deptRepo = ds.getRepository(Department);
  const leaveTypeRepo = ds.getRepository(LeaveType);
  const leaveBalanceRepo = ds.getRepository(LeaveBalance);
  const contractRepo = ds.getRepository(Contract);
  const bankRepo = ds.getRepository(BankInfo);
  const timeRepo = ds.getRepository(TimeKeeping);
  const payslipRepo = ds.getRepository(Payslip);
  const leaveRepo = ds.getRepository(LeaveRequest);
  const auditRepo = ds.getRepository(AuditLog);
  const settingsRepo = ds.getRepository(CompanySettings);
  const violationRepo = ds.getRepository(Violation);
  const salaryHistoryRepo = ds.getRepository(SalaryHistory);
  const salaryConfigRepo = ds.getRepository(SalaryConfig);
  const payrollPeriodRepo = ds.getRepository(PayrollPeriod);

  // (Không cần code xóa dữ liệu thủ công nữa vì dropSchema đã làm rồi)

  // --- 3. CREATE MASTER DATA ---
  console.log("🌱 Creating Company Settings...");
  await settingsRepo.save([
    { key: "COMPANY_IP_WHITELIST", value: "127.0.0.1,::1" },
    { key: "COMPANY_NAME", value: "HRM AI Inc." },
  ]);

  console.log("🌱 Creating Permissions...");
  const p_system = await permRepo.save({ permission_name: "manage:system" });
  const p_payroll = await permRepo.save({ permission_name: "manage:payroll" });
  const p_leave = await permRepo.save({ permission_name: "manage:leave" });
  const p_reports = await permRepo.save({ permission_name: "read:payroll_report" });
  const p_submit_leave = await permRepo.save({ permission_name: "submit:leave" });
  const p_read_balance = await permRepo.save({ permission_name: "read:balance" });
  const p_check_in = await permRepo.save({ permission_name: "timekeeping:checkin" });

  console.log("🌱 Creating Leave Types...");
  const [annualLeave, sickLeave, unpaidLeave] = await leaveTypeRepo.save([
    { name: "Annual Leave", default_days_allocated: 12 },
    { name: "Sick Leave", default_days_allocated: 5 },
    { name: "Unpaid Leave", default_days_allocated: 0 },
  ]);

  // --- 4. CREATE DEPARTMENTS ---
  console.log("🌱 Creating Departments...");
  const departments = await deptRepo.save([
    { department_name: "Engineering" },
    { department_name: "Sales" },
    { department_name: "HR" },
    { department_name: "Marketing" },
    { department_name: "Finance" },
  ]);
  const deptHR = departments.find(d => d.department_name === "HR");

  // --- 5. CREATE POSITIONS ---
  console.log("🌱 Creating Positions...");
  const positions = await posRepo.save([
    { position_name: "Director" },
    { position_name: "Manager" },
    { position_name: "Team Leader" },
    { position_name: "Senior Staff" },
    { position_name: "Intern" },
  ]);
  const [posDirector, posManager, posTeamLeader, posSeniorStaff, posIntern] = positions;

  // --- 6. ASSIGN PERMISSIONS ---
  console.log("🌱 Assigning Permissions...");
  await ppRepo.save([
    { position: posDirector, permission: p_system },
    { position: posDirector, permission: p_payroll },
    { position: posDirector, permission: p_leave }, 
    { position: posManager, permission: p_payroll },
    { position: posManager, permission: p_leave },
    { position: posSeniorStaff, permission: p_submit_leave },
    { position: posSeniorStaff, permission: p_read_balance },
    { position: posIntern, permission: p_check_in },
  ]);

  // --- 7. CREATE EMPLOYEES ---
  console.log("🌱 Creating Employees...");
  const saltRounds = 10;
  const defaultPassword = await bcrypt.hash("password123", saltRounds);
  const adminPassword = await bcrypt.hash("admin", saltRounds);

  const employees: Employee[] = [];
  const now = new Date();
  const twoYearsAgo = new Date(now.getFullYear() - 2, 0, 1);

  // Admin
  const adminUser = await empRepo.save(empRepo.create({
    email: "admin@example.com",
    password: adminPassword,
    first_name: "System",
    last_name: "Admin",
    position: posDirector,
    department: deptHR,
  }));
  employees.push(adminUser);

  // 39 Users
  const firstNames = ["An", "Binh", "Cuong", "Dung", "Giang", "Hoa", "Hung", "Khanh", "Linh", "Minh"];
  const lastNames = ["Nguyen", "Tran", "Le", "Pham", "Hoang", "Vu", "Vo", "Dang", "Bui", "Do"];

  for (let i = 1; i <= 39; i++) {
    const employee = await empRepo.save(empRepo.create({
      email: `user${i}@company.com`,
      password: defaultPassword,
      first_name: randomElement(firstNames),
      last_name: randomElement(lastNames) + ` ${i}`,
      position: randomElement(positions),
      department: randomElement(departments),
      phone_number: `090${String(i).padStart(7, "0")}`,
      address: `Street ${i}, HCMC`,
    }));
    employees.push(employee);
  }
  console.log(`✅ Created ${employees.length} employees`);

  // --- 8. CREATE CONTRACTS (Fixing Schema Issue) ---
  console.log("🌱 Creating Contracts...");
  const contracts: Contract[] = [];
  
  for (const employee of employees) {
    const joinDate = randomDate(twoYearsAgo, now);
    const contractType = randomElement([ContractType.OFFICIAL, ContractType.PROBATION, ContractType.PART_TIME]);
    // Salary variance by position to create a wide spread (5M - 100M)
    let baseSalary = 0;
    switch (employee.position?.position_name) {
      case "Intern":
        baseSalary = randomBetween(5_000_000, 12_000_000);
        break;
      case "Senior Staff":
        baseSalary = randomBetween(20_000_000, 40_000_000);
        break;
      case "Team Leader":
        baseSalary = randomBetween(25_000_000, 50_000_000);
        break;
      case "Manager":
        baseSalary = randomBetween(30_000_000, 60_000_000);
        break;
      case "Director":
        baseSalary = randomBetween(60_000_000, 100_000_000);
        break;
      default:
        baseSalary = randomBetween(10_000_000, 25_000_000);
        break;
    }

    const contract = await contractRepo.save(contractRepo.create({
      employee: employee,
      contract_number: `CNT-${employee.employee_id}-${Math.floor(Math.random()*10000)}`,
      contract_type: contractType,
      start_date: formatDate(joinDate),
      // Fix null issue: use undefined if null
      end_date: undefined, 
      status: ContractStatus.ACTIVE,
      salary_rate: String(baseSalary), // Use salary_rate property
    }));
    contracts.push(contract);
  }
  console.log(`✅ Created ${contracts.length} contracts`);

  // --- 9. SALARY CONFIGS ---
  console.log("🌱 Creating Salary Configs...");
  const activeEmployees = employees; // All for now

  for (const employee of activeEmployees) {
    const contract = contracts.find(c => c.employee.employee_id === employee.employee_id);
    if (!contract) continue;

    const base = parseFloat((contract as any).salary_rate);
    
    await salaryConfigRepo.save(salaryConfigRepo.create({
      employee: employee,
      base_salary: String(base),
      transport_allowance: String(base * 0.1),
      lunch_allowance: "730000",
      responsibility_allowance: employee.position?.position_name=== "Manager" ? String(base * 0.15) : "0",
    }));
  }

  // --- 10. PAYROLL & PAYSLIPS ---
  console.log("🌱 Generating Payslips...");
  // Create Periods
  const periods: PayrollPeriod[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const p = await payrollPeriodRepo.save(payrollPeriodRepo.create({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      status: PayrollPeriodStatus.PAID,
      standard_work_days: 26
    }));
    periods.push(p);
  }

  // Create Payslips with Chaos Logic (high volatility)
  const HOURS_PER_DAY = 8;
  for (const period of periods) {
    const month = period.month;
    for (const emp of activeEmployees) {
      const contract = contracts.find(c => c.employee.employee_id === emp.employee_id);
      if (!contract) continue;

      const baseSalary = parseFloat((contract as any).salary_rate);
      const standardDays = period.standard_work_days;

      // Seasonal base days
      let actualDays = randomBetween(24, 26);
      if (month === 2) {
        actualDays = randomBetween(15, 18); // Post-Tet dip
      }
      // Unpaid leave (5% employees): reduce days further and add deduction
      let unpaidLeaveDays = 0;
      if (Math.random() < 0.05) {
        unpaidLeaveDays = randomBetween(1, 3);
        actualDays = Math.max(10, actualDays - unpaidLeaveDays);
      }
      actualDays = Math.min(actualDays, standardDays);

      // OT hours
      let otHours = randomBetween(0, 10);
      if (month === 6 && emp.department?.department_name === "Engineering") {
        otHours = randomBetween(30, 50); // Crunch
      } else if (month === 9) {
        otHours = 0; // Low season
      }

      // Bonuses
      const thirteenthBonus =
        month === 1 || month === 12 ? baseSalary : 0;
      const tetBonus =
        month === 1 || month === 12 ? randomBetween(2_000_000, 8_000_000) : 0;
      const performanceBonus =
        Math.random() < 0.10 ? randomBetween(2_000_000, 10_000_000) : 0;

      // Core pay
      const salaryPerDay = baseSalary / standardDays;
      const workSalary = salaryPerDay * actualDays;
      const hourlyRate = baseSalary / (standardDays * HOURS_PER_DAY);
      const overtimePay = otHours * hourlyRate * 1.5;

      // Allowances from salary config ratios
      const transportAllowance = baseSalary * 0.1;
      const lunchAllowance = 730_000;
      const responsibilityAllowance =
        emp.position?.position_name === "Manager"
          ? baseSalary * 0.15
          : 0;

      const totalAllowance =
        transportAllowance + lunchAllowance + responsibilityAllowance;

      const totalBonus =
        overtimePay + thirteenthBonus + tetBonus + performanceBonus;

      const grossIncome = workSalary + totalAllowance + totalBonus;

      // Deductions: insurance + unpaid leave
      const insurance = baseSalary * 0.105;
      const unpaidDeduction = salaryPerDay * unpaidLeaveDays;
      const deductions = insurance + unpaidDeduction;

      const netSalary = grossIncome - deductions;

      await payslipRepo.save(payslipRepo.create({
        employee: emp,
        payroll_period: period,
        actual_work_days: actualDays,
        ot_hours: otHours,
        bonus: totalBonus.toFixed(2),
        gross_salary: grossIncome.toFixed(2),
        deductions: deductions.toFixed(2),
        net_salary: netSalary.toFixed(2),
        status: PayslipStatus.PAID,
        pay_period: `${String(period.month).padStart(2, '0')}/${period.year}`
      }));
    }
  }

  // --- 11. VIOLATIONS ---
  console.log("🌱 Creating Violations...");
  await violationRepo.save(violationRepo.create({
    employee: employees[1],
    date: formatDate(now),
    violation_type: "Late",
    description: "Late > 30 mins",
    penalty_amount: "200000",
    status: ViolationStatus.RESOLVED
  }));

  // --- 12. TIMEKEEPING (Current Month) ---
  console.log("🌱 Creating Timekeeping...");
  for (let d = 1; d <= now.getDate(); d++) {
    const workDate = new Date(now.getFullYear(), now.getMonth(), d);
    if (workDate.getDay() === 0 || workDate.getDay() === 6) continue;

    for (let k = 0; k < 10; k++) {
      await timeRepo.save(timeRepo.create({
        employee: employees[k],
        work_date: formatDate(workDate),
        check_in_time: new Date(workDate.setHours(8, 0, 0)),
        check_out_time: new Date(workDate.setHours(17, 0, 0)),
        hours_worked: 8,
        status: "Present",
        ip_address: "127.0.0.1"
      }));
    }
  }

  // --- 13. AUDIT LOG ---
  await auditRepo.save(auditRepo.create({
    user: adminUser, action: "SEED_FULL_RESET", target_entity: "System"
  }));

  console.log("\n--- ✅✅✅ SEED COMPLETE ---");
  console.log("Admin: admin@example.com / admin");
  console.log("Users: user1@company.com / password123");

  await ds.destroy();
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Seed Error:", err);
  process.exit(1);
});