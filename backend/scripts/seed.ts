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

// New entities for Phase 2
import { Announcement } from "../src/entities/announcement.entity";
import { KpiLibrary, KpiUnit } from "../src/entities/kpi-library.entity";
import { KpiPeriod, KpiPeriodStatus } from "../src/entities/kpi-period.entity";
import { KpiAssignment, KpiAssignmentStatus } from "../src/entities/kpi-assignment.entity";
import { ResignationRequest, ResignationStatus } from "../src/entities/resignation-request.entity";
import { CompanyProfile } from "../src/entities/company-profile.entity";
import { SalaryAdjustment, AdjustmentType, AdjustmentStatus } from "../src/entities/salary-adjustment.entity";
import { Notification, NotificationType } from "../src/entities/notification.entity";

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
      Announcement, KpiLibrary, KpiPeriod, KpiAssignment,
      ResignationRequest, CompanyProfile, SalaryAdjustment, Notification,
    ],
    // 🔥 QUAN TRỌNG: dropSchema: true sẽ xóa sạch DB cũ và tạo lại từ đầu.
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

  // Phase 2 repos
  const announcementRepo = ds.getRepository(Announcement);
  const kpiLibraryRepo = ds.getRepository(KpiLibrary);
  const kpiPeriodRepo = ds.getRepository(KpiPeriod);
  const kpiAssignmentRepo = ds.getRepository(KpiAssignment);
  const resignationRepo = ds.getRepository(ResignationRequest);
  const companyProfileRepo = ds.getRepository(CompanyProfile);
  const salaryAdjRepo = ds.getRepository(SalaryAdjustment);
  const notificationRepo = ds.getRepository(Notification);

  // --- 3. CREATE MASTER DATA ---
  console.log("🌱 Creating Company Settings & Profile...");
  await settingsRepo.save([
    { key: "COMPANY_IP_WHITELIST", value: "127.0.0.1,::1" },
    { key: "COMPANY_NAME", value: "HRM AI Inc." },
  ]);

  await companyProfileRepo.save(companyProfileRepo.create({
    company_name: "HRM AI Inc.",
    tax_id: "123456789",
    city: "San Francisco",
    country: "USA",
    base_currency: "USD",
  }));

  console.log("🌱 Creating Permissions...");
  const p_system = await permRepo.save({ permission_name: "manage:system" });
  const p_payroll = await permRepo.save({ permission_name: "manage:payroll" });
  const p_leave = await permRepo.save({ permission_name: "manage:leave" });
  const p_employee = await permRepo.save({ permission_name: "manage:employee" });
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
    { position: posDirector, permission: p_employee },
    { position: posDirector, permission: p_reports },
    { position: posDirector, permission: p_submit_leave },
    { position: posDirector, permission: p_read_balance },
    { position: posDirector, permission: p_check_in },
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

  // --- 7.5. BANK INFO & LEAVE BALANCES ---
  console.log("🌱 Creating Bank Info & Leave Balances...");
  for (const employee of employees) {
    const banks = ["Vietcombank", "Techcombank", "MB Bank", "ACB", "VPBank", "BIDV", "Sacombank"];
    const acct_num = Math.floor(1000000000 + Math.random() * 9000000000).toString(); // 10 digits
    await bankRepo.save(bankRepo.create({
      employee,
      bank_name: randomElement(banks),
      account_number: acct_num,
      account_holder_name: `${employee.first_name} ${employee.last_name}`,
    }));

    await leaveBalanceRepo.save([
      leaveBalanceRepo.create({ employee, leave_type: annualLeave, remaining_days: randomBetween(2, 12) }),
      leaveBalanceRepo.create({ employee, leave_type: sickLeave, remaining_days: randomBetween(0, 5) }),
      leaveBalanceRepo.create({ employee, leave_type: unpaidLeave, remaining_days: 0 }),
    ]);
  }

  // --- 8. CREATE CONTRACTS & SALARY HISTORY ---
  console.log("🌱 Creating Contracts & Salary History...");
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
      end_date: undefined, 
      status: ContractStatus.ACTIVE,
      salary_rate: String(baseSalary),
    }));
    contracts.push(contract);

    // --- 8.5 MEASURES: SALARY HISTORY & ADJUSTMENTS ---
    await salaryHistoryRepo.save(salaryHistoryRepo.create({
      employee: employee,
      old_salary: "0",
      new_salary: String(baseSalary),
      change_date: formatDate(joinDate),
      reason: "Initial Contract Starting Salary",
    }));

    if (Math.random() < 0.15) {
      const type = Math.random() < 0.66 ? AdjustmentType.BONUS : AdjustmentType.PENALTY;
      await salaryAdjRepo.save(salaryAdjRepo.create({
        employee: employee,
        type: type,
        amount: String(randomBetween(500000, 3000000)),
        applied_month: "04/2026",
        reason: type === AdjustmentType.BONUS ? "Excellent Performance" : "Policy Violation",
        status: AdjustmentStatus.APPROVED,
        created_by_id: adminUser.employee_id,
      }));
    }
  }
  console.log(`✅ Created ${contracts.length} contracts`);

  // --- 9. SALARY CONFIGS ---
  console.log("🌱 Creating Salary Configs...");
  const activeEmployees = employees;

  for (const employee of activeEmployees) {
    const contract = contracts.find(c => c.employee.employee_id === employee.employee_id);
    if (!contract) continue;

    const base = parseFloat((contract as any).salary_rate);
    
    await salaryConfigRepo.save(salaryConfigRepo.create({
      employee: employee,
      base_salary: String(base),
      transport_allowance: String(base * 0.1),
      lunch_allowance: "730000",
      responsibility_allowance: employee.position?.position_name === "Manager" ? String(base * 0.15) : "0",
    }));
  }

  // --- 10. PAYROLL & PAYSLIPS ---
  console.log("🌱 Generating Payslips...");
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

  const HOURS_PER_DAY = 8;
  for (const period of periods) {
    const month = period.month;
    for (const emp of activeEmployees) {
      const contract = contracts.find(c => c.employee.employee_id === emp.employee_id);
      if (!contract) continue;

      const baseSalary = parseFloat((contract as any).salary_rate);
      const standardDays = period.standard_work_days;

      let actualDays = randomBetween(24, 26);
      if (month === 2) {
        actualDays = randomBetween(15, 18);
      }
      
      let unpaidLeaveDays = 0;
      if (Math.random() < 0.05) {
        unpaidLeaveDays = randomBetween(1, 3);
        actualDays = Math.max(10, actualDays - unpaidLeaveDays);
      }
      actualDays = Math.min(actualDays, standardDays);

      let otHours = randomBetween(0, 10);
      if (month === 6 && emp.department?.department_name === "Engineering") {
        otHours = randomBetween(30, 50);
      } else if (month === 9) {
        otHours = 0;
      }

      const thirteenthBonus = month === 1 || month === 12 ? baseSalary : 0;
      const tetBonus = month === 1 || month === 12 ? randomBetween(2_000_000, 8_000_000) : 0;
      const performanceBonus = Math.random() < 0.10 ? randomBetween(2_000_000, 10_000_000) : 0;

      const salaryPerDay = baseSalary / standardDays;
      const workSalary = salaryPerDay * actualDays;
      const hourlyRate = baseSalary / (standardDays * HOURS_PER_DAY);
      const overtimePay = otHours * hourlyRate * 1.5;

      const transportAllowance = baseSalary * 0.1;
      const lunchAllowance = 730_000;
      const responsibilityAllowance = emp.position?.position_name === "Manager" ? baseSalary * 0.15 : 0;

      const totalAllowance = transportAllowance + lunchAllowance + responsibilityAllowance;
      const totalBonus = overtimePay + thirteenthBonus + tetBonus + performanceBonus;
      const grossIncome = workSalary + totalAllowance + totalBonus;

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
    violation_date: now,
    violation_type: "Late",
    description: "Late > 30 mins",
    deduction_amount: "200000",
    status: ViolationStatus.RESOLVED
  }));

  // --- 12. TIMEKEEPING (Current Month) ---
  console.log("🌱 Creating Timekeeping...");
  for (let d = 1; d <= now.getDate(); d++) {
    const workDate = new Date(now.getFullYear(), now.getMonth(), d);
    if (workDate.getDay() === 0 || workDate.getDay() === 6) continue;

    for (const emp of activeEmployees) {
      const rand = Math.random();
      let status = "Present";
      let hours = 8;
      let checkIn = new Date(workDate);
      checkIn.setHours(8, randomBetween(0, 5), 0);
      let checkOut: Date | undefined = new Date(workDate);
      checkOut.setHours(17, randomBetween(0, 15), 0);

      if (rand < 0.025) {
        status = "Absent";
        hours = 0;
        checkIn.setHours(0, 0, 0); // fallback for non-nullable DB schema
        checkOut = undefined;
      } else if (rand < 0.05) {
        status = "Late";
        const lateMinutes = randomBetween(15, 60);
        checkIn.setHours(8, lateMinutes, 0);
        hours = 8 - (lateMinutes / 60);
      }

      await timeRepo.save(timeRepo.create({
        employee: emp,
        work_date: formatDate(workDate),
        check_in_time: checkIn,
        check_out_time: checkOut,
        hours_worked: parseFloat(hours.toFixed(2)),
        status: status,
        ip_address: checkOut ? "127.0.0.1" : undefined
      }));
    }
  }

  // --- 12.5. LEAVE REQUESTS & RESIGNATIONS ---
  console.log("🌱 Creating Leave Requests & Resignations...");
  for (let i = 0; i < 15; i++) {
    const emp = randomElement(activeEmployees);
    const mng = randomElement(activeEmployees.filter(e => 
      e.position?.position_name === "Manager" || e.position?.position_name === "Director"
    ));
    const leaveType = randomElement([annualLeave, sickLeave, unpaidLeave]);
    const start = randomDate(twoYearsAgo, now);
    const end = new Date(start);
    end.setDate(start.getDate() + randomBetween(0, 4));

    const statusOpt = randomElement(['Approved', 'Pending', 'Rejected']);
    
    await leaveRepo.save(leaveRepo.create({
      employee: emp,
      leave_type: leaveType,
      start_date: formatDate(start),
      end_date: formatDate(end),
      reason: "Need some time off",
      status: statusOpt,
      manager_approver: statusOpt === 'Approved' ? mng : undefined,
      admin_note: statusOpt !== 'Pending' ? "Reviewed by management" : undefined
    }));
  }

  for (let i = 0; i < 4; i++) {
    const emp = randomElement(activeEmployees);
    await resignationRepo.save(resignationRepo.create({
      employee: emp,
      employee_id: emp.employee_id,
      reason_text: "Seeking better opportunities elsewhere and relocating to a new city.",
      requested_last_day: formatDate(addMonths(now, 1)),
      status: randomElement([ResignationStatus.PENDING, ResignationStatus.APPROVED, ResignationStatus.REJECTED]),
    }));
  }

  // --- 13. PERFORMANCE KPIs (Library, Periods, Assignments) ---
  console.log("🌱 Creating KPIs...");
  const kpiLib1 = await kpiLibraryRepo.save(kpiLibraryRepo.create({
    name: "Customer Satisfaction",
    description: "Maintain a CSAT score above 90%",
    unit: KpiUnit.PERCENT,
    created_by: adminUser
  }));
  const kpiLib2 = await kpiLibraryRepo.save(kpiLibraryRepo.create({
    name: "Sales Conversion Rate",
    description: "Convert at least 15% of inbound leads",
    unit: KpiUnit.PERCENT,
    created_by: adminUser
  }));
  const kpiLib3 = await kpiLibraryRepo.save(kpiLibraryRepo.create({
    name: "New Feature Delivery",
    description: "Deliver scheduled features per quarter",
    unit: KpiUnit.NUMBER,
    created_by: adminUser
  }));

  const activeKpiPeriod = await kpiPeriodRepo.save(kpiPeriodRepo.create({
    name: "Q2 2026",
    start_date: formatDate(new Date(2026, 3, 1)), // April 1st
    end_date: formatDate(new Date(2026, 5, 30)), // June 30th
    status: KpiPeriodStatus.ACTIVE
  }));

  const pastKpiPeriod = await kpiPeriodRepo.save(kpiPeriodRepo.create({
    name: "Q1 2026",
    start_date: formatDate(new Date(2026, 0, 1)),
    end_date: formatDate(new Date(2026, 2, 31)),
    status: KpiPeriodStatus.LOCKED
  }));

  // Assign KPIs to teams
  for (const emp of activeEmployees) {
    const isSales = emp.department?.department_name === "Sales";
    const isEng = emp.department?.department_name === "Engineering";
    
    const relevantLibrary = isSales ? kpiLib2 : (isEng ? kpiLib3 : kpiLib1);

    // Passed period
    await kpiAssignmentRepo.save(kpiAssignmentRepo.create({
      employee: emp,
      period: pastKpiPeriod,
      kpi_library: relevantLibrary,
      target_value: 100,
      actual_value: randomBetween(70, 110),
      weight: 100,
      manager_score: randomBetween(3, 5),
      status: KpiAssignmentStatus.APPROVED
    }));

    // Current period
    await kpiAssignmentRepo.save(kpiAssignmentRepo.create({
      employee: emp,
      period: activeKpiPeriod,
      kpi_library: relevantLibrary,
      target_value: 100,
      actual_value: randomBetween(10, 60), // In progress
      weight: 100,
      manager_score: undefined,
      status: KpiAssignmentStatus.ASSIGNED
    }));

    // Generic KPI for all
    await kpiAssignmentRepo.save(kpiAssignmentRepo.create({
      employee: emp,
      period: activeKpiPeriod,
      kpi_library: kpiLib1,
      target_value: 100,
      actual_value: randomBetween(50, 95),
      weight: 50,
      status: KpiAssignmentStatus.SUBMITTED
    }));
  }

  // --- 14. ANNOUNCEMENTS & NOTIFICATIONS ---
  console.log("🌱 Creating Announcements & Notifications...");
  await announcementRepo.save([
    announcementRepo.create({
      title: "Welcome to HRM AI Inc.",
      content: "We are thrilled to launch our new internal platform! Enjoy the smooth experience and detailed dashboards.",
      type: "General",
      target_audience: "all",
      priority: "Normal",
      status: "Active",
      delivery_methods: ["in_app", "email"]
    }),
    announcementRepo.create({
      title: "Quarterly Townhall Scheduled",
      content: "Please join us next Friday at 3:00 PM for the Q2 Company Townhall. A virtual link is provided in the calendar.",
      type: "Event",
      target_audience: "all",
      priority: "High",
      status: "Active",
      delivery_methods: ["in_app"]
    }),
    announcementRepo.create({
      title: "Annual Leave Policy Changes",
      content: "Please review the updated employee handbook. You can now carry over up to 3 days of unused annual leave into the next calendar year.",
      type: "Policy",
      target_audience: "all",
      priority: "High",
      status: "Active",
      delivery_methods: ["in_app", "email"]
    })
  ]);

  // Read / Unread Notifications
  await notificationRepo.save(notificationRepo.create({
    user: adminUser,
    userId: adminUser.employee_id,
    title: "New Policy Announcement",
    message: "A new company policy regarding Annual Leave has been published.",
    type: NotificationType.ANNOUNCEMENT,
    isRead: false
  }));

  // Create notifications for the first standard user
  if (employees.length > 1) {
    await notificationRepo.save(notificationRepo.create({
      user: employees[1],
      userId: employees[1].employee_id,
      title: "KPI Assignment",
      message: "You have been assigned 2 new KPIs for Q2 2026.",
      type: NotificationType.KPI,
      isRead: false
    }));
    await notificationRepo.save(notificationRepo.create({
      user: employees[1],
      userId: employees[1].employee_id,
      title: "Payslip ready",
      message: "Your April 2026 payslip has been generated.",
      type: NotificationType.PAYROLL,
      isRead: true
    }));
  }

  // --- 15. AUDIT LOG ---
  await auditRepo.save(auditRepo.create({
    user: adminUser, action: "SEED_FULL_RESET_WITH_PHASE_2", target_entity: "System"
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