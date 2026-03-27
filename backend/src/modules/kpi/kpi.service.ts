import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { KpiLibrary } from "../../entities/kpi-library.entity";
import { KpiPeriod, KpiPeriodStatus } from "../../entities/kpi-period.entity";
import { KpiAssignment, KpiAssignmentStatus } from "../../entities/kpi-assignment.entity";
import { Employee } from "../../entities/employee.entity";
import {
  CreateKpiLibraryDto,
  CreateKpiPeriodDto,
  AssignKpisDto,
} from "./dto/kpi.dto";
import { NotificationsService } from "../notifications/notifications.service";
import { NotificationType } from "../../entities/notification.entity";
import { In } from "typeorm";

@Injectable()
export class KpiService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(KpiLibrary) private kpiLibraryRepo: Repository<KpiLibrary>,
    @InjectRepository(KpiPeriod) private kpiPeriodRepo: Repository<KpiPeriod>,
    @InjectRepository(KpiAssignment) private kpiAssignmentRepo: Repository<KpiAssignment>,
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
    private notificationsService: NotificationsService
  ) { }

  // --- Library ---
  async createLibrary(dto: CreateKpiLibraryDto, creatorId: number) {
    const creator = await this.employeeRepo.findOne({ where: { employee_id: creatorId } });
    if (!creator) throw new NotFoundException("Creator employee not found");

    const kpi = this.kpiLibraryRepo.create({ ...dto, created_by: creator });
    return this.kpiLibraryRepo.save(kpi);
  }

  async getLibrary() {
    return this.kpiLibraryRepo.find({ relations: ["created_by"] });
  }

  // --- Periods ---
  async createPeriod(dto: CreateKpiPeriodDto) {
    const period = this.kpiPeriodRepo.create(dto);
    return this.kpiPeriodRepo.save(period);
  }

  async getPeriods() {
    return this.kpiPeriodRepo.find({ order: { start_date: "DESC" } });
  }

  async getPeriodByMonthAndYear(month: number, year: number) {
    const periodName = `${new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(year, month - 1))} ${year}`;
    // Fallback: look for a period that contains the 15th of that month
    const targetDate = `${year}-${String(month).padStart(2, "0")}-15`;

    let period = await this.kpiPeriodRepo.findOne({ where: { name: periodName } });
    if (!period) {
      period = await this.kpiPeriodRepo
        .createQueryBuilder("p")
        .where(":targetDate BETWEEN p.start_date AND p.end_date", { targetDate })
        .getOne();
    }
    return period;
  }

  async updateLibrary(id: number, dto: any) {
    // kpiLibraryRepo hoặc tên repository thư viện KPI của sếp
    await this.kpiLibraryRepo.update(id, dto);
    return { success: true, message: "KPI updated successfully" };
  }

  // --- Assignments ---
  async assignKpis(dto: AssignKpisDto) {
    const totalWeight = dto.assignments.reduce((sum, a) => sum + a.weight, 0);
    if (totalWeight !== 100) {
      throw new BadRequestException(`Total weight must be 100% (currently ${totalWeight}%)`);
    }

    const employee = await this.employeeRepo.findOne({ where: { employee_id: dto.employee_id } });
    if (!employee) throw new NotFoundException("Employee not found");

    const period = await this.kpiPeriodRepo.findOne({ where: { id: dto.period_id } });
    if (!period) throw new NotFoundException("KPI Period not found");

    return this.dataSource.transaction(async (manager) => {
      // Clear existing assignments for this employee/period if any
      await manager.delete(KpiAssignment, {
        employee: { employee_id: dto.employee_id },
        period: { id: dto.period_id },
      });

      const assignments = [];
      const kpiNames: string[] = [];

      for (const a of dto.assignments) {
        const kpiLib = await manager.findOne(KpiLibrary, { where: { id: a.kpi_library_id } });
        if (!kpiLib) throw new NotFoundException(`KPI Library #${a.kpi_library_id} not found`);

        kpiNames.push(kpiLib.name);

        const assignment = manager.create(KpiAssignment, {
          employee,
          period,
          kpi_library: kpiLib,
          target_value: a.target_value,
          weight: a.weight,
          actual_value: 0, // Explicitly set to 0 to avoid any null/undefined issues
          status: KpiAssignmentStatus.ASSIGNED,
        });
        assignments.push(assignment);
      }
      const savedAssignments = await manager.save(assignments);

      // Trigger notification to employee
      try {
        const kpiNamesStr = kpiNames.length > 2
          ? `${kpiNames[0]}, ${kpiNames[1]} and ${kpiNames.length - 2} more`
          : kpiNames.join(", ");

        await this.notificationsService.createNotification(
          employee.employee_id,
          "New KPI Assigned",
          `New KPIs (${kpiNamesStr}) have been assigned for the period: ${period.name}`,
          NotificationType.KPI
        );
      } catch (error) {
        console.error("Failed to send KPI assignment notification:", error);
      }

      return savedAssignments;
    });
  }

  async updateActual(id: number, actualValue: number) {
    const assignment = await this.kpiAssignmentRepo.findOne({ where: { id } });
    if (!assignment) throw new NotFoundException("Assignment not found");

    // Ensure actualValue is a valid number, default to 0 if NaN or null
    const safeValue = (actualValue === null || isNaN(actualValue)) ? 0 : actualValue;

    assignment.actual_value = safeValue;
    assignment.status = KpiAssignmentStatus.SUBMITTED;
    return this.kpiAssignmentRepo.save(assignment);
  }

  async gradeAssignment(id: number, managerScore: number) {
    const assignment = await this.kpiAssignmentRepo.findOne({ where: { id } });
    if (!assignment) throw new NotFoundException("Assignment not found");

    // manager_score is nullable, but if it's NaN we should probably keep it null or set to 0.
    // If it's NaN from frontend (parseFloat("")), we treat it as null (unset).
    assignment.manager_score = isNaN(managerScore) ? undefined : managerScore;
    assignment.status = KpiAssignmentStatus.APPROVED;
    return this.kpiAssignmentRepo.save(assignment);
  }

  async getEmployeeAssignments(employeeId: number, periodId: number) {
    return this.kpiAssignmentRepo.find({
      where: { employee: { employee_id: employeeId }, period: { id: periodId } },
      relations: ["kpi_library", "period"],
    });
  }
  async deleteAssignment(id: number) {
    await this.kpiAssignmentRepo.delete(id);
    return { success: true, message: "Assignment deleted" };
  }
  // --- Final Score Calculation ---
  async calculateFinalKpiScore(employeeId: number, periodId: number): Promise<number> {
    // 1. Lấy tất cả KPI trong tháng (bao gồm cả Assigned và Submitted để hiển thị điểm tạm tính)
    const assignments = await this.kpiAssignmentRepo.find({
      where: {
        employee: { employee_id: employeeId },
        period: { id: periodId },
        status: In([
          KpiAssignmentStatus.ASSIGNED,
          KpiAssignmentStatus.SUBMITTED,
          KpiAssignmentStatus.APPROVED
        ])
      }
    });

    if (!assignments || assignments.length === 0) return 0;

    // 2. Tính điểm chuẩn
    let totalScore = 0;
    for (const a of assignments) {
      // Dùng điểm Manager chấm, nếu chưa chấm thì dùng Actual
      const actual = a.manager_score ?? a.actual_value;
      const target = a.target_value;

      let achievement = 0;
      if (target > 0) {
        // Tính % hoàn thành và giới hạn tối đa 120% (Max trần)
        achievement = Math.min(120, (actual / target) * 100);
      }

      // Cộng dồn theo Trọng số (Weight)
      totalScore += (achievement * a.weight) / 100;
    }

    return parseFloat(totalScore.toFixed(1)); // Trả về số với 1 chữ số thập phân
  }
}
