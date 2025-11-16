import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, DataSource } from "typeorm";
import { Employee } from "../../entities/employee.entity";
import { Contract } from "../../entities/contract.entity";
import { TimeKeeping } from "../../entities/timekeeping.entity";
import { Payslip } from "../../entities/payslip.entity";

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
    @InjectRepository(Payslip) private payslipRepo: Repository<Payslip>
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
      total_base_salary: 0,
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
          (Number(contract.base_salary) / this.STANDARD_MONTHLY_HOURS) *
          overtimeHours *
          (this.OVERTIME_RATE - 1);

        const absentDays = agg.absent_days || 0;
        const daysInMonth = new Date(year, month, 0).getDate();
        const deduction =
          (Number(contract.base_salary) / daysInMonth) * absentDays;

        const baseSalary = Number(contract.base_salary);
        const bonus = Math.max(0, overtimePay);
        const deductions = Math.max(0, deduction);
        const net = baseSalary + bonus - deductions;

        const payslip = manager.getRepository(Payslip).create({
          employee: emp,
          contract: contract,
          pay_period: `${String(month).padStart(2, "0")}/${year}`,
          base_salary: String(baseSalary.toFixed(2)),
          bonus: String(bonus.toFixed(2)),
          deductions: String(deductions.toFixed(2)),
          net_salary: String(net.toFixed(2)),
          status: "Pending",
        } as any);

        await manager.getRepository(Payslip).save(payslip as any);

        summary.total_payroll += net;
        summary.total_base_salary += baseSalary;
        summary.total_bonus += bonus;
        summary.total_deductions += deductions;
        summary.generated += 1;
      }
    });

    return summary;
  }
}
