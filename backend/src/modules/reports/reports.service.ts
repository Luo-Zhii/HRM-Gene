import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Payslip } from "../../entities/payslip.entity";
import { Employee } from "../../entities/employee.entity";
import { Department } from "../../entities/department.entity";

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Payslip) private payslipRepo: Repository<Payslip>,
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
    @InjectRepository(Department) private deptRepo: Repository<Department>
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
      totalBaseSalary += parseFloat(slip.base_salary as string);
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
}
