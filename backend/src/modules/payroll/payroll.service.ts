import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { numberToVietnameseWords } from "./num-to-words.util";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, DataSource } from "typeorm";
import { Employee } from "../../entities/employee.entity";
import { Contract } from "../../entities/contract.entity";
import { TimeKeeping } from "../../entities/timekeeping.entity";
import { Payslip, PayslipStatus } from "../../entities/payslip.entity";
import { PayrollPeriod } from "../../entities/payroll-period.entity";
import { SalaryConfig } from "../../entities/salary-config.entity";
import { LeaveRequest } from "../../entities/leave-request.entity";
import { SalaryAdjustment, AdjustmentType, AdjustmentStatus } from "../../entities/salary-adjustment.entity";
import { NotificationsService } from "../notifications/notifications.service";
import { NotificationType } from "../../entities/notification.entity";
import { CompanySettings } from "../../entities/company-settings.entity";
import { KpiService } from "../kpi/kpi.service";

@Injectable()
export class PayrollService {
  private STANDARD_MONTHLY_HOURS = 160;
  private OVERTIME_RATE = 1.5;

  constructor(
    private dataSource: DataSource,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
    @InjectRepository(Contract) private contractRepo: Repository<Contract>,
    @InjectRepository(TimeKeeping) private timekeepingRepo: Repository<TimeKeeping>,
    @InjectRepository(Payslip) private payslipRepo: Repository<Payslip>,
    @InjectRepository(PayrollPeriod) private payrollPeriodRepo: Repository<PayrollPeriod>,
    @InjectRepository(SalaryConfig) private salaryConfigRepo: Repository<SalaryConfig>,
    @InjectRepository(LeaveRequest) private leaveRequestRepo: Repository<LeaveRequest>,
    @InjectRepository(SalaryAdjustment) private adjustmentRepo: Repository<SalaryAdjustment>,
    @InjectRepository(CompanySettings) private settingsRepo: Repository<CompanySettings>,
    private readonly kpiService: KpiService
  ) {}

  private monthRange(month: number, year: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    return { start, end };
  }

  // ============= Legacy runPayroll (kept for backward compat) =============
  async runPayroll(month: number, year: number, createdByUserId?: number) {
    const { start, end } = this.monthRange(month, year);
    const employees = await this.employeeRepo.find({ relations: ["position", "contracts"] } as any);
    const summary = { total_payroll: 0, total_salary_rate: 0, total_bonus: 0, total_deductions: 0, generated: 0 } as any;

    const tkRepo = this.dataSource.getRepository(TimeKeeping);
    const aggRaw = await tkRepo
      .createQueryBuilder("t")
      .select("t.employee", "employee_id")
      .addSelect("SUM(t.hours_worked)", "total_hours")
      .addSelect("SUM(CASE WHEN t.status = 'Absent' THEN 1 ELSE 0 END)", "absent_days")
      .where("t.work_date BETWEEN :start AND :end", {
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
      })
      .groupBy("t.employee")
      .getRawMany();

    const aggMap: Record<number, { total_hours: number; absent_days: number }> = {};
    for (const row of aggRaw) {
      const eid = Number(row.employee_id);
      aggMap[eid] = { total_hours: Number(row.total_hours || 0), absent_days: Number(row.absent_days || 0) };
    }

    const contractRepo = this.dataSource.getRepository(Contract);
    const activeContracts = await contractRepo
      .createQueryBuilder("c")
      .leftJoinAndSelect("c.employee", "e")
      .where("(c.end_date IS NULL OR c.end_date >= :start)", { start: start.toISOString().slice(0, 10) })
      .andWhere("c.start_date <= :end", { end: end.toISOString().slice(0, 10) })
      .getMany();

    await this.dataSource.transaction(async (manager: any) => {
      for (const contract of activeContracts) {
        const emp = (contract as any).employee as any;
        if (!emp || !emp.employee_id) continue;
        const agg = aggMap[emp.employee_id] || { total_hours: 0, absent_days: 0 };
        const totalHours = agg.total_hours;
        const overtimeHours = Math.max(0, totalHours - this.STANDARD_MONTHLY_HOURS);
        const overtimePay = (Number(contract.salary_rate) / this.STANDARD_MONTHLY_HOURS) * overtimeHours * (this.OVERTIME_RATE - 1);
        const absentDays = agg.absent_days || 0;
        const daysInMonth = new Date(year, month, 0).getDate();
        const deduction = (Number(contract.salary_rate) / daysInMonth) * absentDays;
        const baseSalary = Number(contract.salary_rate);
        const bonus = Math.max(0, overtimePay);
        const deductions = Math.max(0, deduction);
        const net = baseSalary + bonus - deductions as any;
        const payslip = manager.getRepository(Payslip).create({
          employee: emp, contract: contract,
          pay_period: `${String(month).padStart(2, "0")}/${year}`,
          salary_rate: String(baseSalary.toFixed(2)),
          bonus: String(bonus.toFixed(2)), deductions: String(deductions.toFixed(2)),
          net_salary: String(net.toFixed(2)), status: "Pending",
          created_by_id: createdByUserId,
        } as any);
        await manager.getRepository(Payslip).save(payslip as any);
        summary.total_payroll += net; summary.total_salary_rate += baseSalary;
        summary.total_bonus += bonus; summary.total_deductions += deductions; summary.generated += 1;
      }
    });
    return summary;
  }

  // Get period by month/year
  async getPeriodByMonthYear(month: number, year: number) {
    const period = await this.payrollPeriodRepo.findOne({ where: { month, year } });
    return period || null;
  }

  // Get payslips by month/year
  async getPayslipsByPeriod(month: number, year: number) {
    const period = await this.payrollPeriodRepo.findOne({ where: { month, year } });
    if (period) {
      return this.payslipRepo.find({
        where: { payroll_period: { id: period.id } },
        relations: ["employee", "employee.department", "payroll_period"],
        order: { employee: { first_name: "ASC" } },
      });
    }
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
    if (!period) throw new NotFoundException("Payroll period not found");
    return {
      period: { id: period.id, month: period.month, year: period.year, status: period.status, standard_work_days: period.standard_work_days },
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

  // Get single payslip detail with optimized, compact payload
  async getPayslipById(id: number) {
    const payslip = await this.payslipRepo.findOne({
      where: { payslip_id: id },
      relations: ["employee", "employee.department", "employee.position", "payroll_period", "created_by", "created_by.department"],
    });

    if (!payslip) throw new NotFoundException(`Payslip #${id} not found`);

    const salaryConfig = await this.salaryConfigRepo.findOne({
      where: { employee: { employee_id: payslip.employee.employee_id } },
    });

    // ── Build optimized earnings array (only non-zero items) ──
    const bonus = parseFloat(payslip.bonus || "0");
    const deductions = parseFloat(payslip.deductions || "0");

    const earnings: { name: string; value: number }[] = [];
    let hasNonzeroAllowances = false;

    if (salaryConfig) {
      const base = parseFloat(salaryConfig.base_salary || "0");
      const transport = parseFloat(salaryConfig.transport_allowance || "0");
      const lunch = parseFloat(salaryConfig.lunch_allowance || "0");
      const responsibility = parseFloat(salaryConfig.responsibility_allowance || "0");

      if (base > 0) earnings.push({ name: "Base Salary", value: base });
      if (transport > 0) { earnings.push({ name: "Transport Allowance", value: transport }); hasNonzeroAllowances = true; }
      if (lunch > 0) { earnings.push({ name: "Lunch Allowance", value: lunch }); hasNonzeroAllowances = true; }
      if (responsibility > 0) { earnings.push({ name: "Responsibility Allowance", value: responsibility }); hasNonzeroAllowances = true; }
    } else {
      // Fallback: gross minus bonus = base
      const baseFallback = parseFloat(payslip.gross_salary || "0") - bonus;
      if (baseFallback > 0) earnings.push({ name: "Base Salary", value: baseFallback });
    }
    if (bonus > 0) earnings.push({ name: "Bonus / Commission", value: bonus });

    // ── Build optimized deductions array (only non-zero items) ──
    const deductionItems: { name: string; value: number }[] = [];
    const baseSalaryForInsurance = salaryConfig
      ? parseFloat(salaryConfig.base_salary || "0")
      : parseFloat(payslip.gross_salary || "0");

    // Fetch dynamic insurance rate (fallback: 10.5%)
    let INSURANCE_RATE = 0.105;
    try {
      const rateSetting = await this.settingsRepo.findOne({ where: { key: "social_insurance_rate" } });
      if (rateSetting?.value) INSURANCE_RATE = parseFloat(rateSetting.value) / 100;
    } catch { /* use default */ }

    const insurance = baseSalaryForInsurance * INSURANCE_RATE;
    const penalty = Math.max(0, deductions - insurance);

    if (insurance > 0) deductionItems.push({ name: `Social + Health + Unemployment (${(INSURANCE_RATE * 100).toFixed(1)}%)`, value: insurance });
    if (penalty > 0) deductionItems.push({ name: "Penalties / Fines", value: penalty });

    // ── Summary & metadata fields ──
    const grossNum = parseFloat(payslip.gross_salary || "0");
    const deductionsNum = parseFloat(payslip.deductions || "0");
    const netNum = parseFloat(payslip.net_salary || "0");
    const netPayInWords = numberToVietnameseWords(netNum);

    const employeeName = [
      payslip.employee?.first_name ?? "",
      payslip.employee?.last_name ?? "",
    ].filter(Boolean).join(" ") || "Employee";

    // prepared_by_name / prepared_by_department: resolve the HR admin who generated this payslip
    let preparedByName: string = "System";
    let preparedByDepartment: string = "Automated Process";
    if (payslip.created_by_id) {
      const creator = await this.employeeRepo.findOne({
        where: { employee_id: payslip.created_by_id },
        relations: ["department"],
      });
      if (creator) {
        preparedByName = `${creator.first_name ?? ""} ${creator.last_name ?? ""}`.trim() || "System";
        preparedByDepartment = (creator as any).department?.department_name || "Human Resources";
      }
    }

    return {
      ...payslip,
      // Legacy config still included for backward compat
      salaryConfig,
      // New optimized structure
      earnings,
      deduction_items: deductionItems,
      has_nonzero_allowances: hasNonzeroAllowances,
      has_bonus: bonus > 0,
      // Summary totals (explicit)
      total_income: grossNum,
      total_deductions: deductionsNum,
      // Amount in words
      net_pay_in_words: netPayInWords,
      // Signature metadata
      employee_name: employeeName,
      prepared_by_name: preparedByName,
      prepared_by_department: preparedByDepartment,
    };
  }

  // ============= PHASE 2: Enhanced Payroll Generation =============
  async generatePayslips(month: number, year: number, createdByUserId?: number) {
    const { start, end } = this.monthRange(month, year);

    // Find or create payroll period
    let period = await this.payrollPeriodRepo.findOne({ where: { month, year } });
    if (!period) {
      period = this.payrollPeriodRepo.create({ month, year, status: "Draft" as any, standard_work_days: 26 });
      period = await this.payrollPeriodRepo.save(period);
    }

    // All employees
    const employees = await this.employeeRepo.find({ relations: ["position", "department"] });

    // Timekeeping for the month
    const timekeepings = await this.timekeepingRepo.find({
      where: { work_date: Between(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)) },
      relations: ["employee"],
    });

    // Approved leave for the month (counts as paid working days)
    const leaveRequests = await this.leaveRequestRepo.find({
      where: {
        status: "Approved",
        start_date: Between(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)),
      },
      relations: ["employee", "leave_type"],
    });

    // Build attendance maps
    const workDaysMap: Record<number, number> = {};
    const absentDaysMap: Record<number, number> = {};
    timekeepings.forEach((tk) => {
      const id = tk.employee.employee_id;
      if (tk.status === "Present") {
        workDaysMap[id] = (workDaysMap[id] || 0) + 1;
      } else if (tk.status === "Half-day") {
        workDaysMap[id] = (workDaysMap[id] || 0) + 0.5;
        absentDaysMap[id] = (absentDaysMap[id] || 0) + 0.5;
      } else if (tk.status === "Absent") {
        absentDaysMap[id] = (absentDaysMap[id] || 0) + 1;
      }
    });
    leaveRequests.forEach((lr) => {
      const id = lr.employee.employee_id;
      const days =
        Math.floor((new Date(lr.end_date).getTime() - new Date(lr.start_date).getTime()) / 86400000) + 1;
      workDaysMap[id] = (workDaysMap[id] || 0) + days;
    });

    // Fetch SalaryAdjustments for this month (format "MM/YYYY")
    const appliedMonth = `${String(month).padStart(2, "0")}/${year}`;
    const adjustments = await this.adjustmentRepo.find({
      where: { applied_month: appliedMonth, status: AdjustmentStatus.APPROVED },
      relations: ["employee"],
    });
    const bonusMap: Record<number, number> = {};
    const penaltyMap: Record<number, number> = {};
    for (const adj of adjustments) {
      const id = adj.employee.employee_id;
      const amt = parseFloat(adj.amount);
      if (adj.type === "Bonus") bonusMap[id] = (bonusMap[id] || 0) + amt;
      else penaltyMap[id] = (penaltyMap[id] || 0) + amt;
    }

    const standardDays = period.standard_work_days;

    // Fetch dynamic insurance rate (fallback: 10.5%)
    let INSURANCE_RATE = 0.105;
    try {
      const rateSetting = await this.settingsRepo.findOne({ where: { key: "social_insurance_rate" } });
      if (rateSetting && rateSetting.value) {
        INSURANCE_RATE = parseFloat(rateSetting.value) / 100;
      }
    } catch (e) {
      console.warn("Failed to fetch insurance rate setting, using default 10.5%", e);
    }

    let totalGross = 0, totalDeductions = 0, totalNet = 0, totalBonus = 0, generated = 0;

    await this.dataSource.transaction(async (manager) => {
      for (const employee of employees) {
        const result = await this.calculateAndSavePayslip(
          manager,
          employee,
          period!,
          month,
          year,
          {
            timekeepings,
            workDaysMap,
            absentDaysMap,
            bonusMap,
            penaltyMap,
            insuranceRate: INSURANCE_RATE,
          },
          createdByUserId
        );

        if (result) {
          totalGross += result.grossIncome;
          totalDeductions += result.deductions;
          totalNet += result.netSalary;
          totalBonus += result.bonusAdj;
          generated += 1;
        }
      }
    });

    return {
      period_id: period.id, month, year, generated,
      total_gross: totalGross.toFixed(2), total_deductions: totalDeductions.toFixed(2),
      total_net: totalNet.toFixed(2), total_bonus: totalBonus.toFixed(2),
    };
  }

  async generateSinglePayslip(employeeId: number, month: number, year: number, createdByUserId: number) {
    const { start, end } = this.monthRange(month, year);
    const employee = await this.employeeRepo.findOne({ where: { employee_id: employeeId }, relations: ["position", "department"] });
    if (!employee) throw new NotFoundException(`Employee #${employeeId} not found`);

    let period = await this.payrollPeriodRepo.findOne({ where: { month, year } });
    if (!period) {
      period = this.payrollPeriodRepo.create({ month, year, status: "Draft" as any, standard_work_days: 26 });
      period = await this.payrollPeriodRepo.save(period);
    }

    const timekeepings = await this.timekeepingRepo.find({
      where: { employee: { employee_id: employeeId }, work_date: Between(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)) },
    });
    const leaveRequests = await this.leaveRequestRepo.find({
      where: { employee: { employee_id: employeeId }, status: "Approved", start_date: Between(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)) },
      relations: ["leave_type"],
    });

    const workDaysMap: Record<number, number> = { [employeeId]: 0 };
    const absentDaysMap: Record<number, number> = { [employeeId]: 0 };
    timekeepings.forEach((tk) => {
      if (tk.status === "Present") workDaysMap[employeeId]++;
      else if (tk.status === "Half-day") { workDaysMap[employeeId] += 0.5; absentDaysMap[employeeId] += 0.5; }
      else if (tk.status === "Absent") absentDaysMap[employeeId]++;
    });
    leaveRequests.forEach((lr) => {
      const days = Math.floor((new Date(lr.end_date).getTime() - new Date(lr.start_date).getTime()) / 86400000) + 1;
      workDaysMap[employeeId] += days;
    });

    const appliedMonth = `${String(month).padStart(2, "0")}/${year}`;
    const adjustments = await this.adjustmentRepo.find({ where: { employee: { employee_id: employeeId }, applied_month: appliedMonth, status: AdjustmentStatus.APPROVED } });
    const bonusAdj = adjustments.filter(a => a.type === "Bonus").reduce((sum, a) => sum + parseFloat(a.amount), 0);
    const penaltyAdj = adjustments.filter(a => a.type === "Penalty").reduce((sum, a) => sum + parseFloat(a.amount), 0);

    let insuranceRate = 0.105;
    const rateSetting = await this.settingsRepo.findOne({ where: { key: "social_insurance_rate" } });
    if (rateSetting?.value) insuranceRate = parseFloat(rateSetting.value) / 100;

    const result = await this.dataSource.transaction(async manager => {
      return this.calculateAndSavePayslip(manager, employee, period!, month, year, {
        timekeepings,
        workDaysMap,
        absentDaysMap,
        bonusMap: { [employeeId]: bonusAdj },
        penaltyMap: { [employeeId]: penaltyAdj },
        insuranceRate,
      }, createdByUserId);
    });

    if (!result) throw new BadRequestException("Failed to generate payslip (no salary configuration found)");
    
    // Return the payslip detail
    const payslip = await this.payslipRepo.findOne({
      where: { employee: { employee_id: employeeId }, payroll_period: { id: period.id } }
    });
    return this.getPayslipById(payslip!.payslip_id);
  }

  private async calculateAndSavePayslip(
    manager: any,
    employee: Employee,
    period: PayrollPeriod,
    month: number,
    year: number,
    ctx: {
      timekeepings: TimeKeeping[];
      workDaysMap: Record<number, number>;
      absentDaysMap: Record<number, number>;
      bonusMap: Record<number, number>;
      penaltyMap: Record<number, number>;
      insuranceRate: number;
    },
    createdByUserId?: number
  ) {
    const salaryConfig = await manager.getRepository(SalaryConfig).findOne({
      where: { employee: { employee_id: employee.employee_id } },
    });
    if (!salaryConfig) return null;

    const empId = employee.employee_id;
    const standardDays = period.standard_work_days;
    const baseSalary = parseFloat(salaryConfig.base_salary);
    const salaryPerDay = baseSalary / standardDays;

    const hasAttendanceData = ctx.timekeepings.some((tk) => (tk.employee?.employee_id || (tk as any).employee_id) === empId);
    const actualDays = hasAttendanceData ? Math.min(ctx.workDaysMap[empId] || 0, standardDays) : standardDays;
    const unpaidAbsentDays = ctx.absentDaysMap[empId] || 0;

    const allowances =
      parseFloat(salaryConfig.transport_allowance || "0") +
      parseFloat(salaryConfig.lunch_allowance || "0") +
      parseFloat(salaryConfig.responsibility_allowance || "0");

    const bonusAdj = ctx.bonusMap[empId] || 0;
    const penaltyAdj = ctx.penaltyMap[empId] || 0;

    // --- KPI Bonus Calculation ---
    let kpiBonus = 0;
    try {
      const kpiPeriod = await this.kpiService.getPeriodByMonthAndYear(month, year);
      if (kpiPeriod) {
        const kpiScore = await this.kpiService.calculateFinalKpiScore(empId, kpiPeriod.id);
        const targetBonus = parseFloat(salaryConfig.target_bonus || "0");
        kpiBonus = (kpiScore / 100) * targetBonus;
      }
    } catch (error) {
      console.error(`Failed to calculate KPI bonus for employee ${empId}:`, error);
    }

    const totalCalculatedBonus = bonusAdj + kpiBonus;
    const grossIncome = salaryPerDay * actualDays + allowances + totalCalculatedBonus;
    const deductions = baseSalary * ctx.insuranceRate + penaltyAdj + salaryPerDay * unpaidAbsentDays;
    const netSalary = Math.max(0, grossIncome - deductions);

    let payslip = await manager.getRepository(Payslip).findOne({
      where: { employee: { employee_id: empId }, payroll_period: { id: period.id } },
    });

    if (payslip) {
      Object.assign(payslip, {
        actual_work_days: actualDays,
        bonus: totalCalculatedBonus.toFixed(2),
        gross_salary: grossIncome.toFixed(2),
        deductions: deductions.toFixed(2),
        net_salary: netSalary.toFixed(2),
        status: PayslipStatus.PENDING,
        created_by_id: createdByUserId || payslip.created_by_id,
      });
    } else {
      payslip = manager.getRepository(Payslip).create({
        employee,
        payroll_period: period,
        pay_period: `${String(month).padStart(2, "0")}/${year}`,
        actual_work_days: actualDays,
        bonus: totalCalculatedBonus.toFixed(2),
        gross_salary: grossIncome.toFixed(2),
        deductions: deductions.toFixed(2),
        net_salary: netSalary.toFixed(2),
        status: PayslipStatus.PENDING,
        created_by_id: createdByUserId,
      });
    }
    await manager.getRepository(Payslip).save(payslip);

    return { grossIncome, deductions, netSalary, bonusAdj };
  }

  // ============= Payslip Approval & Payment =============

  async approvePayslip(payslipId: number) {
    const payslip = await this.payslipRepo.findOne({
      where: { payslip_id: payslipId },
      relations: ["employee", "payroll_period"],
    });
    if (!payslip) throw new NotFoundException(`Payslip #${payslipId} not found`);
    payslip.status = PayslipStatus.APPROVED;
    const saved = await this.payslipRepo.save(payslip);

    // Notify the employee
    const period = payslip.payroll_period;
    const periodLabel = period
      ? `${String(period.month).padStart(2, "0")}/${period.year}`
      : (payslip.pay_period ?? "this period");
    this.notificationsService.createNotification(
      payslip.employee.employee_id,
      "Payroll Approved",
      `Your payroll for ${periodLabel} has been approved.`,
      NotificationType.PAYROLL
    ).catch(() => {}); // fire-and-forget, never break the main flow

    return saved;
  }

  async markPayslipPaid(payslipId: number) {
    const payslip = await this.payslipRepo.findOne({
      where: { payslip_id: payslipId },
      relations: ["employee", "payroll_period"],
    });
    if (!payslip) throw new NotFoundException(`Payslip #${payslipId} not found`);
    payslip.status = PayslipStatus.PAID;
    const saved = await this.payslipRepo.save(payslip);

    // Notify the employee with net salary
    const period = payslip.payroll_period;
    const periodLabel = period
      ? `${String(period.month).padStart(2, "0")}/${period.year}`
      : (payslip.pay_period ?? "this period");
    const netFormatted = new Intl.NumberFormat("vi-VN").format(
      Math.round(parseFloat(payslip.net_salary || "0"))
    );
    this.notificationsService.createNotification(
      payslip.employee.employee_id,
      "Payslip Available",
      `Your payslip for ${periodLabel} is now available to view. Net Salary: ${netFormatted} VND.`,
      NotificationType.PAYROLL
    ).catch(() => {});

    return saved;
  }

  async approveAllPayslips(month: number, year: number) {
    const period = await this.payrollPeriodRepo.findOne({ where: { month, year } });
    if (!period) throw new NotFoundException("No payroll period found for this month/year");

    const payslips = await this.payslipRepo.find({
      where: { payroll_period: { id: period.id }, status: PayslipStatus.PENDING },
      relations: ["employee"],
    });
    for (const p of payslips) p.status = PayslipStatus.APPROVED;
    await this.payslipRepo.save(payslips);

    // Notify all affected employees
    const periodLabel = `${String(month).padStart(2, "0")}/${year}`;
    for (const p of payslips) {
      this.notificationsService.createNotification(
        p.employee.employee_id,
        "Payroll Approved",
        `Your payroll for ${periodLabel} has been approved.`,
        NotificationType.PAYROLL
      ).catch(() => {});
    }

    return { approved: payslips.length };
  }

  // ============= Salary Config Management =============
  async getAllSalaryConfigs() {
    try {
      const results = await this.employeeRepo
        .createQueryBuilder("employee")
        .leftJoin("employee.position", "position")
        .leftJoin("employee.department", "department")
        .leftJoin(SalaryConfig, "sc", "sc.employee_id = employee.employee_id")
        .select([
          "employee.employee_id", "employee.email", "employee.first_name", "employee.last_name", "employee.avatar_url",
          "position.position_id", "position.position_name",
          "department.department_id", "department.department_name",
          "sc.config_id", "sc.base_salary", "sc.transport_allowance", "sc.lunch_allowance", "sc.responsibility_allowance",
        ])
        .orderBy("employee.first_name", "ASC")
        .getRawMany();

      return results.map((row) => {
        const hasConfig = row.sc_config_id !== null && row.sc_config_id !== undefined;
        return {
          config_id: hasConfig ? row.sc_config_id : null,
          employee: {
            employee_id: row.employee_employee_id, email: row.employee_email,
            first_name: row.employee_first_name, last_name: row.employee_last_name,
            avatar_url: row.employee_avatar_url || null,
            position: row.position_position_id ? { position_id: row.position_position_id, position_name: row.position_position_name } : null,
            department: row.department_department_id ? { department_id: row.department_department_id, department_name: row.department_department_name } : null,
          },
          base_salary: hasConfig && row.sc_base_salary ? String(row.sc_base_salary) : "0.00",
          transport_allowance: hasConfig && row.sc_transport_allowance ? String(row.sc_transport_allowance) : "0.00",
          lunch_allowance: hasConfig && row.sc_lunch_allowance ? String(row.sc_lunch_allowance) : "0.00",
          responsibility_allowance: hasConfig && row.sc_responsibility_allowance ? String(row.sc_responsibility_allowance) : "0.00",
        };
      });
    } catch (error) {
      console.error("Error in getAllSalaryConfigs:", error);
      throw error;
    }
  }

  async getSalaryConfigByEmployeeId(employeeId: number) {
    try {
      if (!employeeId || isNaN(employeeId) || employeeId <= 0) throw new BadRequestException(`Invalid employee ID: ${employeeId}`);
      const config = await this.salaryConfigRepo
        .createQueryBuilder("sc")
        .leftJoinAndSelect("sc.employee", "employee")
        .where("employee.employee_id = :employeeId", { employeeId })
        .getOne();
      return config;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(`Failed to fetch salary configuration: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async updateSalaryConfig(
    employeeId: number,
    data: { base_salary: string; transport_allowance: string; lunch_allowance: string; responsibility_allowance: string }
  ) {
    try {
      if (!employeeId || isNaN(employeeId)) throw new BadRequestException("Invalid employee ID");
      if (!data.base_salary || data.transport_allowance === undefined || data.lunch_allowance === undefined || data.responsibility_allowance === undefined) {
        throw new BadRequestException("All salary fields are required");
      }
      let config = await this.salaryConfigRepo.findOne({ where: { employee: { employee_id: employeeId } }, relations: ["employee"] });
      if (!config) {
        const employee = await this.employeeRepo.findOne({ where: { employee_id: employeeId } });
        if (!employee) throw new NotFoundException(`Employee with ID ${employeeId} not found`);
        config = this.salaryConfigRepo.create({ employee, ...data });
      } else {
        Object.assign(config, data);
      }
      return await this.salaryConfigRepo.save(config);
    } catch (error) {
      console.error(`Error in updateSalaryConfig for employee ${employeeId}:`, error);
      throw error;
    }
  }

  // ============= Salary Adjustment CRUD =============

  async createAdjustment(data: {
    employee_id: number; type: AdjustmentType; amount: string;
    applied_month: string; reason?: string; created_by_id?: number;
  }) {
    const employee = await this.employeeRepo.findOne({ where: { employee_id: data.employee_id } });
    if (!employee) throw new NotFoundException(`Employee #${data.employee_id} not found`);
    const adj = this.adjustmentRepo.create({
      employee, type: data.type, amount: data.amount, applied_month: data.applied_month,
      reason: data.reason || "", status: AdjustmentStatus.PENDING, created_by_id: data.created_by_id,
    });
    const saved = await this.adjustmentRepo.save(adj);

    // Notify the employee about the new adjustment
    const amtFormatted = new Intl.NumberFormat("vi-VN").format(Math.round(parseFloat(data.amount || "0")));
    this.notificationsService.createNotification(
      data.employee_id,
      `New Salary Adjustment`,
      `A new salary adjustment (${data.type}: ${amtFormatted} VND) for ${data.applied_month} has been recorded. Status: Pending review.`,
      NotificationType.PAYROLL
    ).catch(() => {});

    return saved;
  }

  async getAllAdjustments(type?: AdjustmentType) {
    const qb = this.adjustmentRepo
      .createQueryBuilder("adj")
      .leftJoinAndSelect("adj.employee", "emp")
      .leftJoinAndSelect("emp.department", "dept")
      .orderBy("adj.created_at", "DESC");
    if (type) qb.where("adj.type = :type", { type });
    return qb.getMany();
  }

  async getAdjustmentById(id: number) {
    const adj = await this.adjustmentRepo.findOne({ where: { id }, relations: ["employee", "employee.department"] });
    if (!adj) throw new NotFoundException(`Adjustment #${id} not found`);
    return adj;
  }

  async updateAdjustment(id: number, data: Partial<{ type: AdjustmentType; amount: string; applied_month: string; reason: string; status: AdjustmentStatus }>) {
    const adj = await this.getAdjustmentById(id);
    const prevStatus = adj.status;
    Object.assign(adj, data);
    const saved = await this.adjustmentRepo.save(adj);

    // Notify employee when status changes to Approved or Rejected
    const newStatus = data.status;
    if (newStatus && newStatus !== prevStatus && (newStatus === AdjustmentStatus.APPROVED || newStatus === AdjustmentStatus.REJECTED)) {
      const amtFormatted = new Intl.NumberFormat("vi-VN").format(Math.round(parseFloat(adj.amount || "0")));
      this.notificationsService.createNotification(
        adj.employee.employee_id,
        `Salary Adjustment ${newStatus}`,
        `Your salary adjustment of ${amtFormatted} VND (${adj.applied_month}) has been ${newStatus.toLowerCase()}.`,
        NotificationType.PAYROLL
      ).catch(() => {});
    }

    return saved;
  }

  async deleteAdjustment(id: number) {
    const adj = await this.getAdjustmentById(id);
    await this.adjustmentRepo.remove(adj);
    return { deleted: true, id };
  }
}
