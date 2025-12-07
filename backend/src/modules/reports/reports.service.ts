import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { Payslip } from "../../entities/payslip.entity";
import { Employee } from "../../entities/employee.entity";
import { Department } from "../../entities/department.entity";
import { PayrollPeriod } from "../../entities/payroll-period.entity";
import { Contract } from "../../entities/contract.entity";
import { SalaryConfig } from "../../entities/salary-config.entity";

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Payslip) private payslipRepo: Repository<Payslip>,
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
    @InjectRepository(Department) private deptRepo: Repository<Department>,
    @InjectRepository(PayrollPeriod)
    private payrollPeriodRepo: Repository<PayrollPeriod>,
    @InjectRepository(Contract) private contractRepo: Repository<Contract>,
    @InjectRepository(SalaryConfig)
    private salaryConfigRepo: Repository<SalaryConfig>
  ) {}

  async payrollSummary(month: number, year: number) {
    // Format pay_period as MM/YYYY for filtering
    const payPeriod = `${String(month).padStart(2, "0")}/${year}`;

    // Get all payslips for the period
    const payslips = await this.payslipRepo.find({
      where: { pay_period: payPeriod },
      relations: ["employee", "employee.department"],
    });

    if (payslips.length === 0) {
      return {
        month,
        year,
        total_payroll: 0,
        total_base_salary: 0,
        total_bonus: 0,
        total_deductions: 0,
        employees_processed: 0,
        avg_salary: 0,
        payroll_by_department: [],
      };
    }

    // Aggregate totals
    let totalPayroll = 0;
    let totalBaseSalary = 0;
    let totalBonus = 0;
    let totalDeductions = 0;

    payslips.forEach((slip) => {
      totalBaseSalary += parseFloat(slip.gross_salary as string);
      totalBonus += parseFloat(slip.bonus as string);
      totalDeductions += parseFloat(slip.deductions as string);
      totalPayroll += parseFloat(slip.net_salary as string);
    });

    // Group by department
    const byDept: { [key: string]: any } = {};
    payslips.forEach((slip) => {
      const deptName = slip.employee?.department?.department_name || "Unknown";
      if (!byDept[deptName]) {
        byDept[deptName] = {
          department: deptName,
          count: 0,
          total: 0,
          avg: 0,
        };
      }
      byDept[deptName].count += 1;
      byDept[deptName].total += parseFloat(slip.net_salary as string);
    });

    // Calculate averages
    Object.keys(byDept).forEach((key) => {
      byDept[key].avg =
        byDept[key].count > 0 ? byDept[key].total / byDept[key].count : 0;
    });

    const payrollByDepartment = Object.values(byDept);

    return {
      month,
      year,
      total_payroll: totalPayroll,
      total_base_salary: totalBaseSalary,
      total_bonus: totalBonus,
      total_deductions: totalDeductions,
      employees_processed: payslips.length,
      avg_salary: payslips.length > 0 ? totalPayroll / payslips.length : 0,
      payroll_by_department: payrollByDepartment,
    };
  }

  /**
   * Get dashboard analytics data for the last 12 months
   * Returns: salary trend, headcount trend, and turnover data
   */
  async getDashboardData() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    // Generate last 12 months array
    const months: Array<{ year: number; month: number }> = [];
    for (let i = 11; i >= 0; i--) {
      let year = currentYear;
      let month = currentMonth - i;
      if (month <= 0) {
        month += 12;
        year -= 1;
      }
      months.push({ year, month });
    }

    // 1. Salary Trend: Total base salary and net payout per month
    const salaryTrend = await Promise.all(
      months.map(async ({ year, month }) => {
        // Find payroll period
        const period = await this.payrollPeriodRepo.findOne({
          where: { month, year },
        });

        let totalBaseSalary = 0;
        let totalNetPayout = 0;

        if (period) {
          const payslips = await this.payslipRepo.find({
            where: { payroll_period: { id: period.id } },
            relations: ["employee"],
          });

          payslips.forEach((slip) => {
            // Use gross_salary as base salary (total before deductions)
            // Net salary is after deductions
            const gross = parseFloat(slip.gross_salary || "0");
            const net = parseFloat(slip.net_salary || "0");
            totalBaseSalary += gross;
            totalNetPayout += net;
          });
        } else {
          // Fallback: use legacy pay_period field
          const payPeriod = `${String(month).padStart(2, "0")}/${year}`;
          const payslips = await this.payslipRepo.find({
            where: { pay_period: payPeriod },
            relations: ["employee"],
          });

          payslips.forEach((slip) => {
            const gross = parseFloat(slip.gross_salary || "0");
            const net = parseFloat(slip.net_salary || "0");
            totalBaseSalary += gross;
            totalNetPayout += net;
          });
        }

        return {
          year,
          month,
          month_label: `${String(month).padStart(2, "0")}/${year}`,
          total_base_salary: Math.round(totalBaseSalary),
          total_net_payout: Math.round(totalNetPayout),
        };
      })
    );

    // 2. Headcount Trend: Active employees per month
    const headcountTrend = await Promise.all(
      months.map(async ({ year, month }) => {
        // Calculate month start and end
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

        // Count employees who have an active contract during this month
        const activeContracts = await this.contractRepo
          .createQueryBuilder("contract")
          .leftJoinAndSelect("contract.employee", "employee")
          .where("contract.start_date <= :monthEnd", {
            monthEnd: monthEnd.toISOString().split("T")[0],
          })
          .andWhere(
            "(contract.end_date IS NULL OR contract.end_date >= :monthStart)",
            {
              monthStart: monthStart.toISOString().split("T")[0],
            }
          )
          .andWhere("contract.status != :terminated", {
            terminated: "Terminated",
          })
          .getMany();

        // Get unique employee count
        const uniqueEmployeeIds = new Set(
          activeContracts.map((c) => c.employee.employee_id)
        );

        return {
          year,
          month,
          month_label: `${String(month).padStart(2, "0")}/${year}`,
          total_personnel: uniqueEmployeeIds.size,
        };
      })
    );

    // 3. Turnover: New hires and resignations per month
    const turnover = await Promise.all(
      months.map(async ({ year, month }) => {
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

        // New hires: contracts that started in this month
        const newHires = await this.contractRepo
          .createQueryBuilder("contract")
          .where("contract.start_date >= :monthStart", {
            monthStart: monthStart.toISOString().split("T")[0],
          })
          .andWhere("contract.start_date <= :monthEnd", {
            monthEnd: monthEnd.toISOString().split("T")[0],
          })
          .getCount();

        // Resignations: contracts that ended in this month
        const resignations = await this.contractRepo
          .createQueryBuilder("contract")
          .where("contract.end_date IS NOT NULL")
          .andWhere("contract.end_date >= :monthStart", {
            monthStart: monthStart.toISOString().split("T")[0],
          })
          .andWhere("contract.end_date <= :monthEnd", {
            monthEnd: monthEnd.toISOString().split("T")[0],
          })
          .getCount();

        return {
          year,
          month,
          month_label: `${String(month).padStart(2, "0")}/${year}`,
          new_hires: newHires,
          resigned: resignations,
        };
      })
    );

    // 4. Personnel by Department (current snapshot)
    const allEmployees = await this.employeeRepo.find({
      relations: ["department"],
    });

    const deptCounts: Record<string, number> = {};
    allEmployees.forEach((emp) => {
      const deptName = emp.department?.department_name || "Unassigned";
      deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
    });

    const personnelByDepartment = Object.entries(deptCounts).map(
      ([department_name, count]) => ({
        department_name,
        count,
      })
    );

    return {
      salary_trend: salaryTrend,
      headcount_trend: headcountTrend,
      turnover,
      personnel_by_department: personnelByDepartment,
    };
  }
}
