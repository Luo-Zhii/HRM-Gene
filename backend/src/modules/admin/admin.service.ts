import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CompanySettings } from "../../entities/company-settings.entity";
import { Department } from "../../entities/department.entity";
import { Position } from "../../entities/position.entity";
import { Permission } from "../../entities/permission.entity";
import { PositionPermission } from "../../entities/position-permission.entity";
import { Employee } from "../../entities/employee.entity";
import { Contract, ContractStatus, ContractType } from "../../entities/contract.entity";
import { SalaryHistory } from "../../entities/salary-history.entity";
import { Payslip } from "../../entities/payslip.entity";
import { PayrollPeriod } from "../../entities/payroll-period.entity";
import { SalaryConfig } from "../../entities/salary-config.entity";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(CompanySettings)
    private settingsRepo: Repository<CompanySettings>,
    @InjectRepository(Department) private deptRepo: Repository<Department>,
    @InjectRepository(Position) private positionRepo: Repository<Position>,
    @InjectRepository(Permission)
    private permissionRepo: Repository<Permission>,
    @InjectRepository(PositionPermission)
    private posPermRepo: Repository<PositionPermission>,
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
    @InjectRepository(Contract) private contractRepo: Repository<Contract>,
    @InjectRepository(SalaryHistory)
    private salaryHistoryRepo: Repository<SalaryHistory>,
    @InjectRepository(Payslip) private payslipRepo: Repository<Payslip>,
    @InjectRepository(PayrollPeriod)
    private payrollPeriodRepo: Repository<PayrollPeriod>,
    @InjectRepository(SalaryConfig)
    private salaryConfigRepo: Repository<SalaryConfig>
  ) {}

  // ============= System Settings =============
  async getAllSettings() {
    return this.settingsRepo.find();
  }

  async getSetting(key: string) {
    const setting = await this.settingsRepo.findOne({ where: { key } });
    return setting || { key, value: "" };
  }

  async updateSetting(key: string, value: string) {
    let setting = await this.settingsRepo.findOne({ where: { key } });
    if (!setting) {
      setting = this.settingsRepo.create({ key, value });
    } else {
      setting.value = value;
    }
    return this.settingsRepo.save(setting);
  }

  // ============= Department Management =============
  async getAllDepartments() {
    return this.deptRepo.find({ relations: ["manager", "employees"] });
  }

  async createDepartment(departmentName: string) {
    if (!departmentName) {
      throw new BadRequestException("Department name is required");
    }
    const dept = this.deptRepo.create({ department_name: departmentName });
    return this.deptRepo.save(dept);
  }

  // ============= Position Management =============
  async getAllPositions() {
    return this.positionRepo.find({
      relations: ["permissions", "permissions.permission"],
    });
  }

  async createPosition(positionName: string) {
    if (!positionName) {
      throw new BadRequestException("Position name is required");
    }
    const pos = this.positionRepo.create({ position_name: positionName });
    return this.positionRepo.save(pos);
  }

  // ============= Permission Management =============
  async getPermissionMatrix() {
    const positions = await this.positionRepo.find({
      relations: ["permissions", "permissions.permission"],
    });

    const matrix = positions.map((position) => ({
      position_id: position.position_id,
      position_name: position.position_name,
      permissions: (position.permissions || []).map((pp) => ({
        permission_id: pp.permission.permission_id,
        permission_name: pp.permission.permission_name,
      })),
    }));

    return matrix;
  }

  async assignPermissionToPosition(positionId: number, permissionId: number) {
    // Verify position and permission exist
    const position = await this.positionRepo.findOne({
      where: { position_id: positionId },
    });
    if (!position) {
      throw new NotFoundException(`Position with ID ${positionId} not found`);
    }

    const permission = await this.permissionRepo.findOne({
      where: { permission_id: permissionId },
    });
    if (!permission) {
      throw new NotFoundException(
        `Permission with ID ${permissionId} not found`
      );
    }

    // Check if assignment already exists
    const existing = await this.posPermRepo.findOne({
      where: { position_id: positionId, permission_id: permissionId },
    });

    if (existing) {
      throw new BadRequestException(
        `Permission ${permissionId} is already assigned to position ${positionId}`
      );
    }

    // Create the assignment
    const assignment = this.posPermRepo.create({
      position_id: positionId,
      permission_id: permissionId,
    });

    return this.posPermRepo.save(assignment);
  }

  async revokePermissionFromPosition(positionId: number, permissionId: number) {
    // Verify position and permission exist
    const position = await this.positionRepo.findOne({
      where: { position_id: positionId },
    });
    if (!position) {
      throw new NotFoundException(`Position with ID ${positionId} not found`);
    }

    const permission = await this.permissionRepo.findOne({
      where: { permission_id: permissionId },
    });
    if (!permission) {
      throw new NotFoundException(
        `Permission with ID ${permissionId} not found`
      );
    }

    // Check if assignment exists
    const assignment = await this.posPermRepo.findOne({
      where: { position_id: positionId, permission_id: permissionId },
    });

    if (!assignment) {
      throw new BadRequestException(
        `Permission ${permissionId} is not assigned to position ${positionId}`
      );
    }

    // Delete the assignment
    await this.posPermRepo.remove(assignment);

    return { message: "Permission revoked successfully" };
  }

  // ============= Employee Management =============
  async getAllEmployees() {
    return this.employeeRepo.find({
      relations: ["position", "department"],
      select: [
        "employee_id",
        "email",
        "first_name",
        "last_name",
        "position",
        "department",
      ],
    });
  }

  // ============= Seed Demo Data =============
  async seedDemoData(employeeId?: number) {
    const employees = await this.employeeRepo.find({
      relations: ["department", "position"],
    });

    if (employees.length === 0) {
      throw new BadRequestException("No employees found. Please create employees first.");
    }

    // Use provided employeeId or first employee
    const targetEmployee = employeeId
      ? employees.find((e) => e.employee_id === employeeId)
      : employees[0];

    if (!targetEmployee) {
      throw new NotFoundException("Employee not found");
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // 1. Generate 12 months of SalaryHistory
    console.log("🌱 Seeding 12 months of salary history...");
    const salaryHistories = [];
    let baseSalary = 5000; // Starting salary

    for (let i = 11; i >= 0; i--) {
      let year = currentYear;
      let month = currentMonth - i;
      if (month <= 0) {
        month += 12;
        year -= 1;
      }

      // Simulate salary increases (skip first iteration)
      if (i < 11 && (11 - i) % 3 === 0) {
        baseSalary += 500; // Increase every 3 months
      }

      const changeDate = new Date(year, month - 1, 1);
      const oldSalary = i === 11 ? String(baseSalary) : String(baseSalary - 500);
      salaryHistories.push(
        this.salaryHistoryRepo.create({
          employee: targetEmployee,
          old_salary: oldSalary,
          new_salary: String(baseSalary),
          change_date: changeDate.toISOString().split("T")[0],
          reason: "Annual review",
        })
      );
    }
    await this.salaryHistoryRepo.save(salaryHistories);

    // 2. Generate 5 Contracts (3 Active, 2 Expired)
    console.log("🌱 Seeding contracts...");
    const contracts = [];

    // Active contracts
    for (let i = 0; i < 3; i++) {
      const startDate = new Date(currentYear - 1, 0, 1 + i * 120);
      contracts.push(
        this.contractRepo.create({
          employee: targetEmployee,
          contract_number: `CNT-${targetEmployee.employee_id}-${i + 1}`,
          contract_type: i === 0 ? ContractType.PROBATION : ContractType.OFFICIAL,
          start_date: startDate.toISOString().split("T")[0],
          end_date: undefined,
          status: ContractStatus.ACTIVE,
          salary_rate: String(5000 + i * 1000),
        })
      );
    }

    // Expired contracts
    for (let i = 0; i < 2; i++) {
      const startDate = new Date(currentYear - 2, 0, 1 + i * 180);
      const endDate = new Date(currentYear - 1, 6, 30 + i * 30);
      contracts.push(
        this.contractRepo.create({
          employee: targetEmployee,
          contract_number: `CNT-${targetEmployee.employee_id}-EXP-${i + 1}`,
          contract_type: ContractType.OFFICIAL,
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          status: ContractStatus.EXPIRED,
          salary_rate: String(4000 + i * 500),
        })
      );
    }
    await this.contractRepo.save(contracts);

    // 3. Generate Payslips for last 12 months (for dashboard charts)
    console.log("🌱 Seeding payslips for dashboard...");
    const payslips = [];

    for (let i = 11; i >= 0; i--) {
      let year = currentYear;
      let month = currentMonth - i;
      if (month <= 0) {
        month += 12;
        year -= 1;
      }

      // Find or create payroll period
      let period = await this.payrollPeriodRepo.findOne({
        where: { month, year },
      });

      if (!period) {
        period = this.payrollPeriodRepo.create({
          month,
          year,
          status: "Draft" as any,
          standard_work_days: 26,
        });
        period = await this.payrollPeriodRepo.save(period);
      }

      // Generate payslips for all employees
      for (const emp of employees) {
        // Check if payslip already exists
        const existing = await this.payslipRepo.findOne({
          where: {
            employee: { employee_id: emp.employee_id },
            payroll_period: { id: period.id },
          },
        });

        if (!existing) {
          const baseSalary = 4000 + Math.random() * 3000; // Random between 4000-7000
          const gross = baseSalary * 1.2; // Add 20% for allowances
          const deductions = baseSalary * 0.105; // 10.5% insurance
          const net = gross - deductions;

          payslips.push(
            this.payslipRepo.create({
              employee: emp,
              payroll_period: period,
              actual_work_days: 22 + Math.floor(Math.random() * 4),
              ot_hours: Math.floor(Math.random() * 20),
              gross_salary: gross.toFixed(2),
              deductions: deductions.toFixed(2),
              net_salary: net.toFixed(2),
              status: "Pending" as any,
              pay_period: `${String(month).padStart(2, "0")}/${year}`,
            })
          );
        }
      }
    }

    if (payslips.length > 0) {
      await this.payslipRepo.save(payslips);
    }

    return {
      message: "Demo data seeded successfully",
      salary_history_count: salaryHistories.length,
      contracts_count: contracts.length,
      payslips_count: payslips.length,
      employee_id: targetEmployee.employee_id,
    };
  }
}
