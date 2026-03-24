import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan } from "typeorm";
import { Violation, ViolationStatus, ViolationSeverity } from "../../entities/violation.entity";
import { Employee } from "../../entities/employee.entity";
import { TimeKeeping } from "../../entities/timekeeping.entity";
import { CreateViolationDto } from "./dto/create-violation.dto";
import { UpdateViolationDto } from "./dto/update-violation.dto";

@Injectable()
export class ViolationsService {
  constructor(
    @InjectRepository(Violation)
    private violationRepo: Repository<Violation>,
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    @InjectRepository(TimeKeeping)
    private timeKeepingRepo: Repository<TimeKeeping>
  ) { }

  async create(createDto: CreateViolationDto) {
    // Verify employee exists
    const employee = await this.employeeRepo.findOne({
      where: { employee_id: createDto.employee_id },
    });
    if (!employee) {
      throw new NotFoundException("Employee not found");
    }

    const violation = this.violationRepo.create({
      employee,
      violation_date: createDto.violation_date,
      violation_type: createDto.violation_type,
      description: createDto.description,
      deduction_amount: createDto.deduction_amount || "0.00",
      severity: createDto.severity || ViolationSeverity.NORMAL,
      status: createDto.status || ViolationStatus.PENDING,
    });

    return this.violationRepo.save(violation);
  }

  async findAll(employeeId?: number) {
    const where: any = {};
    if (employeeId) {
      where.employee = { employee_id: employeeId };
    }

    const records = await this.violationRepo.find({
      where,
      relations: ["employee"],
      order: { violation_date: "DESC" },
    });

    const total = records.length;
    const resolved = records.filter(r => r.status === ViolationStatus.RESOLVED).length;

    return { records, stats: { total, resolved } };
  }

  async findOne(id: number, employeeId?: number) {
    const where: any = { violation_id: id };
    if (employeeId) {
      where.employee = { employee_id: employeeId };
    }

    const violation = await this.violationRepo.findOne({
      where,
      relations: ["employee"],
    });

    if (!violation) {
      throw new NotFoundException("Violation not found");
    }

    return violation;
  }

  async update(id: number, updateDto: UpdateViolationDto, employeeId?: number) {
    const violation = await this.findOne(id, employeeId);
    Object.assign(violation, updateDto);
    return this.violationRepo.save(violation);
  }

  async remove(id: number, employeeId?: number) {
    const violation = await this.findOne(id, employeeId);
    await this.violationRepo.remove(violation);
    return { message: "Violation deleted successfully" };
  }
  async syncAttendance() {
    const attendanceRecords = await this.timeKeepingRepo.find({
      where: { hours_worked: LessThan(8) },
      relations: ["employee"]
    });

    let createdCount = 0;
    for (const record of attendanceRecords) {
      if (!record.employee) continue;

      // CRITICAL FIX: Convert string to Date object
      const workDateObj = new Date(record.work_date);

      const existing = await this.violationRepo.findOne({
        where: {
          employee: { employee_id: record.employee.employee_id },
          violation_date: workDateObj,
        }
      });

      if (!existing) {
        const violation = this.violationRepo.create({
          employee: record.employee,
          violation_date: workDateObj,
          violation_type: "Incomplete Shift",
          description: `Auto-drafted: Employee worked ${record.hours_worked} hours on ${record.work_date}. Minimum required is 8 hours.`,
          deduction_amount: "0.00",
          severity: ViolationSeverity.NORMAL,
          status: ViolationStatus.PENDING
        });
        await this.violationRepo.save(violation);
        createdCount++;
      }
    }

    return { message: "Sync complete", createdCount };
  }
}
