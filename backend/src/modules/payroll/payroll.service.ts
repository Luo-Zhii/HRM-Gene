import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, DataSource } from "typeorm";
import { Employee } from "../../entities/employee.entity";
import { Contract } from "../../entities/contract.entity";
import { TimeKeeping } from "../../entities/timekeeping.entity";
import { Payslip, PayslipStatus } from "../../entities/payslip.entity";
import { PayrollPeriod } from "../../entities/payroll-period.entity";
import { SalaryConfig } from "../../entities/salary-config.entity";
import { LeaveRequest } from "../../entities/leave-request.entity";

@Injectable()
export class PayrollService {
  // Config: standard monthly hours (e.g., 8h * 22 working days = 176)
  private STANDARD_MONTHLY_HOURS = 160;
  private OVERTIME_RATE = 1.5; // 150% of hourly

  constructor(
    private dataSource: DataSource,
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
    @InjectRepository(Contract) private contractRepo: Repository<Contract>,
    @InjectRepository(TimeKeeping)
    private timekeepingRepo: Repository<TimeKeeping>,
    @InjectRepository(Payslip) private payslipRepo: Repository<Payslip>,
    @InjectRepository(PayrollPeriod)
    private payrollPeriodRepo: Repository<PayrollPeriod>,
    @InjectRepository(SalaryConfig)
    private salaryConfigRepo: Repository<SalaryConfig>,
    @InjectRepository(LeaveRequest)
    private leaveRequestRepo: Repository<LeaveRequest>
  ) {}

  private monthRange(month: number, year: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    return { start, end };
  }

  async runPayroll(month: number, year: number) {
    const { start, end } = this.monthRange(month, year);

    const employees = await this.employeeRepo.find({
      relations: ["position", "contracts"],
    } as any);

    const summary = {
      total_payroll: 0,
      total_salary_rate: 0,
      total_bonus: 0,
      total_deductions: 0,
      generated: 0,
    } as any;

    // Optimize aggregation: compute total hours and absent days per employee in a single query
    const tkRepo = this.dataSource.getRepository(TimeKeeping);
    const aggRaw = await tkRepo
      .createQueryBuilder("t")
      .select("t.employee", "employee_id")
      .addSelect("SUM(t.hours_worked)", "total_hours")
      .addSelect(
        "SUM(CASE WHEN t.status = 'Absent' THEN 1 ELSE 0 END)",
        "absent_days"
      )
      .where("t.work_date BETWEEN :start AND :end", {
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
      })
      .groupBy("t.employee")
      .getRawMany();

    // Map aggregation by employee id (raw may return strings)
    const aggMap: Record<number, { total_hours: number; absent_days: number }> =
      {};
    for (const row of aggRaw) {
      const eid = Number(row.employee_id);
      aggMap[eid] = {
        total_hours: Number(row.total_hours || 0),
        absent_days: Number(row.absent_days || 0),
      };
    }

    // Fetch active contracts for the period (one query)
    const contractRepo = this.dataSource.getRepository(Contract);
    const activeContracts = await contractRepo
      .createQueryBuilder("c")
      .leftJoinAndSelect("c.employee", "e")
      .where("(c.end_date IS NULL OR c.end_date >= :start)", {
        start: start.toISOString().slice(0, 10),
      })
      .andWhere("c.start_date <= :end", { end: end.toISOString().slice(0, 10) })
      .getMany();

    // Create payslips in a single transaction, iterating active contracts only
    await this.dataSource.transaction(async (manager: any) => {
      for (const contract of activeContracts) {
        const emp = (contract as any).employee as any;
        if (!emp || !emp.employee_id) continue;
        const agg = aggMap[emp.employee_id] || {
          total_hours: 0,
          absent_days: 0,
        };

        const totalHours = agg.total_hours;
        const overtimeHours = Math.max(
          0,
          totalHours - this.STANDARD_MONTHLY_HOURS
        );
        const overtimePay =
          (Number(contract.salary_rate) / this.STANDARD_MONTHLY_HOURS) *
          overtimeHours *
          (this.OVERTIME_RATE - 1);

        const absentDays = agg.absent_days || 0;
        const daysInMonth = new Date(year, month, 0).getDate();
        const deduction =
          (Number(contract.salary_rate) / daysInMonth) * absentDays;

        const baseSalary = Number(contract.salary_rate);
        const bonus = Math.max(0, overtimePay);
        const deductions = Math.max(0, deduction);
        const net = baseSalary + bonus - deductions as any;

        const payslip = manager.getRepository(Payslip).create({
          employee: emp,
          contract: contract,
          pay_period: `${String(month).padStart(2, "0")}/${year}`,
          salary_rate: String(baseSalary.toFixed(2)),
          bonus: String(bonus.toFixed(2)),
          deductions: String(deductions.toFixed(2)),
          net_salary: String(net.toFixed(2)),
          status: "Pending",
        } as any);

        await manager.getRepository(Payslip).save(payslip as any);

        summary.total_payroll += net;
        summary.total_salary_rate += baseSalary;
        summary.total_bonus += bonus;
        summary.total_deductions += deductions;
        summary.generated += 1;
      }
    });

    return summary;
  }

  // Get period by month/year
  async getPeriodByMonthYear(month: number, year: number) {
    const period = await this.payrollPeriodRepo.findOne({
      where: { month, year },
    });
    return period || null;
  }

  // Get payslips by month/year
  async getPayslipsByPeriod(month: number, year: number) {
    // First try to find by payroll_period relation
    const period = await this.payrollPeriodRepo.findOne({
      where: { month, year },
    });

    if (period) {
      return this.payslipRepo.find({
        where: { payroll_period: { id: period.id } },
        relations: ["employee", "employee.department", "payroll_period"],
        order: { employee: { first_name: "ASC" } },
      });
    }

    // Fallback to legacy pay_period field
    const payPeriod = `${String(month).padStart(2, "0")}/${year}`;
    return this.payslipRepo.find({
      where: { pay_period: payPeriod },
      relations: ["employee", "employee.department", "payroll_period"],
      order: { employee: { first_name: "ASC" } },
    });
  }

  // Get payslips by payroll period ID
  async getPayslipsByPeriodId(periodId: number) {
    const period = await this.payrollPeriodRepo.findOne({
      where: { id: periodId },
      relations: ["payslips", "payslips.employee", "payslips.employee.department"],
    });

    if (!period) {
      throw new NotFoundException("Payroll period not found");
    }

    return {
      period: {
        id: period.id,
        month: period.month,
        year: period.year,
        status: period.status,
        standard_work_days: period.standard_work_days,
      },
      payslips: period.payslips || [],
    };
  }

  // Get employee's own payslips
  async getEmployeePayslips(employeeId: number) {
    return this.payslipRepo.find({
      where: { employee: { employee_id: employeeId } },
      relations: ["payroll_period"],
      order: { payroll_period: { year: "DESC", month: "DESC" } },
    });
  }

  // Generate payslips (new implementation based on requirements)
  async generatePayslips(month: number, year: number) {
    const { start, end } = this.monthRange(month, year);

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

    // Get all employees with salary config
    const employees = await this.employeeRepo.find({
      relations: ["position", "department"],
    });

    // Get timekeeping data for the month
    const timekeepings = await this.timekeepingRepo.find({
      where: {
        work_date: Between(
          start.toISOString().slice(0, 10),
          end.toISOString().slice(0, 10)
        ),
      },
      relations: ["employee"],
    });

    // Get approved leave requests for the month
    const leaveRequests = await this.leaveRequestRepo.find({
      where: {
        status: "Approved",
        start_date: Between(
          start.toISOString().slice(0, 10),
          end.toISOString().slice(0, 10)
        ),
      },
      relations: ["employee", "leave_type"],
    });

    // Calculate work days per employee
    const workDaysMap: Record<number, number> = {};
    const employeeSet = new Set<number>();

    timekeepings.forEach((tk) => {
      const empId = tk.employee.employee_id;
      employeeSet.add(empId);
      if (tk.status === "Present" || tk.status === "Half-day") {
        workDaysMap[empId] = (workDaysMap[empId] || 0) + 1;
      }
    });

    // Add paid leave days
    leaveRequests.forEach((lr) => {
      const empId = lr.employee.employee_id;
      employeeSet.add(empId);
      const startDate = new Date(lr.start_date);
      const endDate = new Date(lr.end_date);
      const days = Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
      workDaysMap[empId] = (workDaysMap[empId] || 0) + days;
    });

    const standardDays = period.standard_work_days;
    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;
    let generated = 0;

    // Generate payslips
    await this.dataSource.transaction(async (manager) => {
      for (const employee of employees) {
        const salaryConfig = await this.salaryConfigRepo.findOne({
          where: { employee: { employee_id: employee.employee_id } },
        });

        if (!salaryConfig) continue;

        const actualDays = workDaysMap[employee.employee_id] || 0;
        const salaryPerDay =
          parseFloat(salaryConfig.base_salary) / standardDays;
        const workSalary = salaryPerDay * actualDays;

        const totalAllowance =
          parseFloat(salaryConfig.transport_allowance) +
          parseFloat(salaryConfig.lunch_allowance) +
          parseFloat(salaryConfig.responsibility_allowance);

        const grossIncome = workSalary + totalAllowance;

        // Deductions: Insurance 10.5% of base salary
        const insurance = parseFloat(salaryConfig.base_salary) * 0.105;
        const deductions = insurance;
        const netSalary = grossIncome - deductions;

        if (!period) {
          throw new Error("Payroll period not found. Please create the period first.");
        }
        // Check if payslip already exists
        const existing = await manager.getRepository(Payslip).findOne({
          where: {
            employee: { employee_id: employee.employee_id },
            payroll_period: { id: period.id },
          },
        });

        if (existing) {
          // Update existing
          existing.actual_work_days = actualDays;
          existing.gross_salary = grossIncome.toFixed(2);
          existing.deductions = deductions.toFixed(2);
          existing.net_salary = netSalary.toFixed(2);
          await manager.getRepository(Payslip).save(existing);
        } else {
          // Create new
          const payslip = manager.getRepository(Payslip).create({
            employee,
            payroll_period: period,
            actual_work_days: actualDays,
            ot_hours: 0,
            gross_salary: grossIncome.toFixed(2),
            deductions: deductions.toFixed(2),
            net_salary: netSalary.toFixed(2),
            status: PayslipStatus.PENDING,
            pay_period: `${String(month).padStart(2, "0")}/${year}`,
          });
          await manager.getRepository(Payslip).save(payslip);
        }

        totalGross += grossIncome;
        totalDeductions += deductions;
        totalNet += netSalary;
        generated += 1;
      }
    });

    return {
      period_id: period.id,
      month,
      year,
      total_gross: totalGross.toFixed(2),
      total_deductions: totalDeductions.toFixed(2),
      total_net: totalNet.toFixed(2),
      generated,
    };
  }
}
