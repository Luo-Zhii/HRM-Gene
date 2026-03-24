import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan } from "typeorm";
import { Violation, ViolationStatus, ViolationSeverity } from "../../entities/violation.entity";
import { Employee } from "../../entities/employee.entity";
import { TimeKeeping } from "../../entities/timekeeping.entity";
import { Notification, NotificationType } from "../../entities/notification.entity";
import { NotificationsGateway } from "../notifications/notifications.gateway";
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
    private timeKeepingRepo: Repository<TimeKeeping>,
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private notificationsGateway: NotificationsGateway
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

    const saved = await this.violationRepo.save(violation);

    const d = new Date(saved.violation_date);
    const mdyDate = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    const employeeFullName = `${employee.first_name} ${employee.last_name || ''}`.trim();

    const notif = this.notificationRepo.create({
      title: `Violation: ${saved.violation_type}`,
      message: `${employeeFullName} has an ${saved.violation_type} on ${mdyDate}. Severity: ${saved.severity}.`,
      type: NotificationType.DISCIPLINE,
      user: employee,
    });
    const savedNotif = await this.notificationRepo.save(notif);
    this.notificationsGateway.sendNotificationToUser(employee.employee_id, savedNotif);

    return saved;
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
    
    // Safely track original values before applying updateDto patches natively
    const oldStatus = violation.status;
    const oldSeverity = violation.severity;
    const oldDeduction = violation.deduction_amount;
    
    if (updateDto.deduction_amount !== undefined) {
      updateDto.deduction_amount = String(updateDto.deduction_amount).replace(/[^0-9.]/g, '') || "0.00";
    }

    Object.assign(violation, updateDto);
    const saved = await this.violationRepo.save(violation);

    const d = new Date(saved.violation_date);
    const mdyDate = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    const employeeFullName = `${violation.employee.first_name} ${violation.employee.last_name || ''}`.trim();

    // Determine payload conditionally natively natively
    let changeMsgs: string[] = [];
    if (updateDto.deduction_amount !== undefined && String(saved.deduction_amount) !== String(oldDeduction)) {
      changeMsgs.push(`Deduction set to $${saved.deduction_amount}`);
    }
    if (updateDto.status && updateDto.status !== oldStatus) {
      changeMsgs.push(`Status changed to ${saved.status}`);
    }
    if (updateDto.severity && updateDto.severity !== oldSeverity) {
      changeMsgs.push(`Severity changed to ${saved.severity}`);
    }

    let notifMessage = `Your record for '${saved.violation_type}' was updated.`;
    if (changeMsgs.length > 0) {
      notifMessage = `Your record for '${saved.violation_type}' was updated. ${changeMsgs.join('. ')}`;
    }

    const notifTitle = "Discipline Record Updated";

    const notif = this.notificationRepo.create({
      title: notifTitle,
      message: notifMessage,
      type: NotificationType.WARNING,
      user: violation.employee,
    });
    
    const savedNotif = await this.notificationRepo.save(notif);
    this.notificationsGateway.sendNotificationToUser(violation.employee.employee_id, savedNotif);

    return saved;
  }

  async remove(id: number, employeeId?: number) {
    const violation = await this.findOne(id, employeeId);
    await this.violationRepo.remove(violation);
    return { message: "Violation deleted successfully" };
  }
  async syncAttendance() {
    return this.handleDailyAttendanceSync();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyAttendanceSync() {
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

        const empNotif = this.notificationRepo.create({
          title: "Disciplinary Record Added",
          message: "An auto-drafted violation (Incomplete Shift) has been added to your profile.",
          type: NotificationType.DISCIPLINE,
          user: record.employee,
          isRead: false
        });
        await this.notificationRepo.save(empNotif);

        createdCount++;
      }
    }

    if (createdCount > 0) {
      // Create notification for Admins/HR
      const admins = await this.employeeRepo.find({
        relations: ["position"],
      });
      
      const hrAdmins = admins.filter(emp => {
        const p = emp.position?.position_name?.toLowerCase();
        return p === "admin" || p === "hr manager" || p === "hr" || p === "director";
      });

      const notifs = hrAdmins.map(admin => this.notificationRepo.create({
        title: "Attendance Sync Complete",
        message: `Auto-sync created ${createdCount} new violation drafts for incomplete shifts.`,
        type: NotificationType.DISCIPLINE,
        user: admin,
      }));

      if (notifs.length > 0) {
        await this.notificationRepo.save(notifs);
      }
    }

    return { message: "Sync complete", createdCount };
  }
}
