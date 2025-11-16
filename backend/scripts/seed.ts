import "reflect-metadata";
import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import "dotenv/config"; // Tự động tải file .env

// --- 1. IMPORT TẤT CẢ ENTITY ---
import { Permission } from "../src/entities/permission.entity";
import { Position } from "../src/entities/position.entity";
import { PositionPermission } from "../src/entities/position-permission.entity";
import { Employee } from "../src/entities/employee.entity";
import { Department } from "../src/entities/department.entity";
import { BankInfo } from "../src/entities/bank-info.entity";
import { Contract } from "../src/entities/contract.entity";
import { TimeKeeping } from "../src/entities/timekeeping.entity";
import { Payslip } from "../src/entities/payslip.entity";
import { LeaveRequest } from "../src/entities/leave-request.entity";
import { LeaveType } from "../src/entities/leave-type.entity";
import { LeaveBalance } from "../src/entities/leave-balance.entity";
import { AuditLog } from "../src/entities/audit-log.entity";
import { CompanySettings } from "../src/entities/company-settings.entity";

async function run() {
  const ds = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "postgres", // Khớp với file .env của bạn
    database: process.env.DB_NAME || "hrm", // Khớp với file .env của bạn
    entities: [
      // Đảm bảo tất cả 14 entity đều ở đây
      Permission,
      Position,
      PositionPermission,
      Employee,
      Department,
      BankInfo,
      Contract,
      TimeKeeping,
      Payslip,
      LeaveRequest,
      LeaveType,
      LeaveBalance,
      AuditLog,
      CompanySettings,
    ],
    synchronize: true, // synchronize: true an toàn cho seed script
  } as any);

  await ds.initialize();
  console.log("✅ Data Source đã được khởi tạo!");

  // --- 2. LẤY REPOSITORIES ---
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

  // --- 3. TẠO DỮ LIỆU CỐ ĐỊNH (Settings, Permissions, LeaveTypes) ---
  console.log("🌱 Đang gieo mầm Company Settings...");
  await settingsRepo.save([
    { key: "COMPANY_IP_WHITELIST", value: "127.0.0.1,::1" },
    { key: "COMPANY_NAME", value: "HRM AI Inc." },
  ]);

  console.log("🌱 Đang gieo mầm Permissions & Leave Types...");
  const [
    p_system,
    p_payroll,
    p_leave,
    p_reports,
    p_submit_leave,
    p_read_balance,
    p_check_in,
  ] = await permRepo.save([
    { permission_name: "manage:system" }, // Quyền admin cao nhất
    { permission_name: "manage:payroll" }, // Quyền chạy bảng lương (HR)
    { permission_name: "manage:leave" }, // Quyền duyệt phép (HR/Manager)
    { permission_name: "read:payroll_report" }, // Quyền xem báo cáo lương (Kế toán)
    { permission_name: "submit:leave" }, // Quyền nhân viên: nộp đơn
    { permission_name: "read:balance" }, // Quyền nhân viên: xem phép
    { permission_name: "timekeeping:checkin" }, // Quyền nhân viên: chấm công
  ]);

  const [annualLeave, sickLeave] = await leaveTypeRepo.save([
    { name: "Annual Leave", default_days_allocated: 12 },
    { name: "Sick Leave", default_days_allocated: 5 },
  ]);

  // --- 4. TẠO CẤU TRÚC (Departments, Positions) ---
  console.log("🌱 Đang gieo mầm Departments & Positions...");
  const [deptEng, deptHr, deptSales] = await deptRepo.save([
    { department_name: "Engineering" },
    { department_name: "Human Resources" },
    { department_name: "Sales" },
  ]);

  const [posAdmin, posHr, posDev, posSales] = await posRepo.save([
    { position_name: "Admin" },
    { position_name: "HR Manager" },
    { position_name: "Software Developer" },
    { position_name: "Sales Executive" },
  ]);

  // --- 5. GÁN QUYỀN CHO CHỨC VỤ ---
  console.log("🌱 Đang gán quyền cho các chức vụ...");
  await ppRepo.save([
    // Admin (có tất cả quyền)
    { position: posAdmin, permission: p_system },
    { position: posAdmin, permission: p_payroll },
    { position: posAdmin, permission: p_leave },
    { position: posAdmin, permission: p_reports },

    // HR Manager (có quyền về nhân sự)
    { position: posHr, permission: p_payroll },
    { position: posHr, permission: p_leave },
    { position: posHr, permission: p_reports },

    // Software Developer (quyền nhân viên)
    { position: posDev, permission: p_submit_leave },
    { position: posDev, permission: p_read_balance },
    { position: posDev, permission: p_check_in },

    // Sales Executive (quyền nhân viên)
    { position: posSales, permission: p_submit_leave },
    { position: posSales, permission: p_read_balance },
    { position: posSales, permission: p_check_in },
  ]);

  // --- 6. TẠO USERS (Admin, HR, Employee) ---
  console.log("🌱 Đang tạo users...");
  const saltRounds = 10;
  const passAdmin = await bcrypt.hash("admin", saltRounds);
  const passUser = await bcrypt.hash("password123", saltRounds);

  const adminUser = await empRepo.save(
    empRepo.create({
      email: "admin@example.com",
      password: passAdmin,
      first_name: "System",
      last_name: "Admin",
      position: posAdmin,
    })
  );

  const hrUser = await empRepo.save(
    empRepo.create({
      email: "hr@example.com",
      password: passUser,
      first_name: "Huyen",
      last_name: "Tran",
      position: posHr,
      department: deptHr,
    })
  );

  const devUser = await empRepo.save(
    empRepo.create({
      email: "dev@example.com",
      password: passUser,
      first_name: "Van",
      last_name: "An",
      position: posDev,
      department: deptEng,
    })
  );

  const salesUser = await empRepo.save(
    empRepo.create({
      email: "sales@example.com",
      password: passUser,
      first_name: "Bao",
      last_name: "Le",
      position: posSales,
      department: deptSales,
    })
  );

  console.log("--- TÀI KHOẢN ĐĂNG NHẬP ---");
  console.log("Admin: admin@example.com / admin");
  console.log("HR:    hr@example.com / password123");
  console.log("Dev:   dev@example.com / password123");
  console.log("Sales: sales@example.com / password123");

  // --- 7. TẠO DỮ LIỆU PHỤ (Contract, Bank, Balance) ---
  console.log("🌱 Đang tạo Contracts, BankInfo, LeaveBalances...");

  const devContract = await contractRepo.save(
    contractRepo.create({
      employee: devUser,
      contract_type: "Full-time",
      start_date: "2023-01-01",
      base_salary: "60000",
    })
  );

  const salesContract = await contractRepo.save(
    contractRepo.create({
      employee: salesUser,
      contract_type: "Full-time",
      start_date: "2023-05-15",
      base_salary: "45000",
    })
  );

  const hrContract = await contractRepo.save(
    contractRepo.create({
      employee: hrUser,
      contract_type: "Full-time",
      start_date: "2022-10-01",
      base_salary: "70000",
    })
  );

  await bankRepo.save([
    {
      employee: devUser,
      bank_name: "Techcombank",
      account_number: "123456789",
      account_holder_name: "NGUYEN VAN AN",
    },
    {
      employee: salesUser,
      bank_name: "Vietcombank",
      account_number: "987654321",
      account_holder_name: "LE MINH BAO",
    },
  ]);

  await leaveBalanceRepo.save([
    { employee: devUser, leave_type: annualLeave, remaining_days: 10 },
    { employee: devUser, leave_type: sickLeave, remaining_days: 3 },
    { employee: salesUser, leave_type: annualLeave, remaining_days: 12 },
    { employee: hrUser, leave_type: annualLeave, remaining_days: 8 },
  ]);

  // --- 8. TẠO DỮ LIỆU CHẤM CÔNG (TimeKeeping) ---
  console.log("🌱 Đang tạo TimeKeeping (5 ngày) cho devUser...");
  for (let i = 1; i <= 5; i++) {
    const workDate = new Date();
    workDate.setDate(workDate.getDate() - i); // Set to i days ago

    const checkIn = new Date(workDate);
    checkIn.setHours(8, 0, 0); // 8:00 AM
    const checkOut = new Date(workDate);
    checkOut.setHours(17, 1, 0); // 5:01 PM

    await timeRepo.save(
      timeRepo.create({
        employee: devUser,
        work_date: workDate.toISOString().split("T")[0],
        check_in_time: checkIn,
        check_out_time: checkOut,
        hours_worked: 8,
        status: "Present",
        ip_address: "127.0.0.1",
      })
    );
  }

  // --- 9. TẠO DỮ LIỆU NGHIỆP VỤ (LeaveRequest, Payslip, Audit) ---
  console.log("🌱 Đang tạo LeaveRequest, Payslip, AuditLog...");

  // Tạo 1 đơn xin nghỉ phép "Pending" cho salesUser
  await leaveRepo.save(
    leaveRepo.create({
      employee: salesUser,
      leave_type: annualLeave,
      start_date: "2025-11-20",
      end_date: "2025-11-21",
      reason: "Family vacation",
      status: "Pending", // Sẵn sàng để HR/Admin test duyệt
    })
  );

  // Tạo 1 phiếu lương tháng trước cho devUser
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  await payslipRepo.save(
    payslipRepo.create({
      employee: devUser,
      contract: devContract, // Gán contract
      pay_period: `${lastMonth.getMonth() + 1}/${lastMonth.getFullYear()}`,
      base_salary: "60000",
      bonus: "1000",
      deductions: "500",
      net_salary: "60500",
      status: "Paid",
    })
  );

  // Ghi log lại
  await auditRepo.save(
    auditRepo.create({
      user: adminUser,
      action: "SEED_DATABASE",
      target_entity: "System",
    })
  );

  console.log("\n--- ✅✅✅ SEED COMPLETE ---");
  await ds.destroy(); // Đóng kết nối
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Lỗi khi chạy seed:", err);
  process.exit(1);
});
