import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LeaveRequest } from "../../entities/leave-request.entity";
import { LeaveBalance } from "../../entities/leave-balance.entity";
import { LeaveType } from "../../entities/leave-type.entity";
import { Employee } from "../../entities/employee.entity";
import { NotificationsService } from "../notifications/notifications.service";
import { NotificationType } from "../../entities/notification.entity";

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveRequest)
    private leaveReqRepo: Repository<LeaveRequest>,
    @InjectRepository(LeaveBalance)
    private balanceRepo: Repository<LeaveBalance>,
    @InjectRepository(LeaveType) private leaveTypeRepo: Repository<LeaveType>,
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
    private notificationsService: NotificationsService
  ) { }

  // Get all leave types (for dropdown/selection)
  async getLeaveTypes() {
    const types = await this.leaveTypeRepo.find();
    // Remove duplicates by name
    const uniqueTypes: LeaveType[] = [];
    const seenNames = new Set<string>();
    for (const type of types) {
      if (!seenNames.has(type.name)) {
        seenNames.add(type.name);
        uniqueTypes.push(type);
      }
    }
    return uniqueTypes.map((t) => ({
      leave_type_id: t.leave_type_id,
      name: t.name,
      default_days_allocated: t.default_days_allocated,
    }));
  }

  // Employee: Get leave balance for the logged-in employee
  async getBalance(employeeId: number) {
    const balances = await this.balanceRepo.find({
      where: { employee: { employee_id: employeeId } },
      relations: ["leave_type"],
    });
    return balances.map((b) => ({
      balance_id: b.balance_id,
      leave_type_name: b.leave_type?.name,
      remaining_days: b.remaining_days,
    }));
  }

  // Employee: Get all leave requests submitted by the logged-in employee
  async getMyRequests(employeeId: number) {
    const requests = await this.leaveReqRepo.find({
      where: { employee: { employee_id: employeeId } },
      relations: ["leave_type", "employee", "manager_approver"],
      order: { request_id: "DESC" },
    });
    return requests.map((r) => ({
      request_id: r.request_id,
      leave_type_name: r.leave_type?.name,
      start_date: r.start_date,
      end_date: r.end_date,
      reason: r.reason,
      status: r.status,
      manager_approver: r.manager_approver?.email,
      admin_note: r.admin_note, // <--- THÊM DÒNG NÀY ĐỂ TRẢ VỀ LỜI NHẮN CỦA HR
    }));
  }
  // Employee: Submit a new leave request
  async submitRequest(
    employeeId: number,
    leaveTypeId: number,
    startDate: string,
    endDate: string,
    reason?: string
  ) {
    // Validate that leave type exists
    const leaveType = await this.leaveTypeRepo.findOne({
      where: { leave_type_id: leaveTypeId },
    });
    if (!leaveType) {
      throw new BadRequestException("Leave type not found");
    }

    // Validate that employee exists
    const employee = await this.employeeRepo.findOne({
      where: { employee_id: employeeId },
    });
    if (!employee) {
      throw new BadRequestException("Employee not found");
    }

    // Validate overlapping dates for approved/accepted requests
    const overlappingRequest = await this.leaveReqRepo
      .createQueryBuilder("req")
      .where("req.employee.employee_id = :employeeId", { employeeId })
      .andWhere("req.status IN (:...statuses)", { statuses: ["Approved", "Approved_By_Manager"] })
      .andWhere("req.start_date <= :endDate AND req.end_date >= :startDate", {
        startDate,
        endDate,
      })
      .getOne();

    if (overlappingRequest) {
      throw new BadRequestException(
        `You already have an approved leave request during this period (${overlappingRequest.start_date} to ${overlappingRequest.end_date})`
      );
    }

    // Create new leave request with default status 'Pending'
    const leaveRequest = this.leaveReqRepo.create({
      employee,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      reason: reason ?? undefined,
      status: "Pending",
    });

    await this.leaveReqRepo.save(leaveRequest);

    // Notify all Admins / HR / manage:system users
    try {
      const adminsAndHrs = await this.employeeRepo
        .createQueryBuilder("emp")
        .leftJoinAndSelect("emp.position", "pos")
        .leftJoin("pos.permissions", "pp")
        .leftJoin("pp.permission", "perm")
        .where("LOWER(pos.position_name) LIKE :admin", { admin: "%admin%" })
        .orWhere("LOWER(pos.position_name) LIKE :hr", { hr: "%hr%" })
        .orWhere("LOWER(pos.position_name) LIKE :director", { director: "%director%" })
        .orWhere("perm.permission_name = :permName", { permName: "manage:system" })
        .getMany();

      const uniqueAdmins = Array.from(new Set(adminsAndHrs.map(a => a.employee_id)))
        .map(id => adminsAndHrs.find(a => a.employee_id === id));

      const notifyPromises = uniqueAdmins.map((admin) => {
        if (!admin) return Promise.resolve();
        return this.notificationsService.createNotification(
          admin.employee_id,
          "New Leave Request",
          `${employee.first_name} ${employee.last_name} has submitted a new ${leaveType.name} request for ${startDate}.`,
          NotificationType.LEAVE_REQUEST
        );
      });

      await Promise.all(notifyPromises);
    } catch (err) {
      console.error("Failed to notify admins of new leave request", err);
    }

    return {
      request_id: leaveRequest.request_id,
      status: leaveRequest.status,
      message: "Leave request submitted successfully",
    };
  }

  // Manager/HR: Get all leave requests for review (formerly just pending)
  async getPendingRequests() {
    const requests = await this.leaveReqRepo.find({
      relations: [
        "leave_type",
        "employee",
        "employee.department",
        "employee.position",
        "manager_approver"
      ],
      order: { request_id: "DESC" },
    });

    // Calculate stats across all requests
    const allRequests = await this.leaveReqRepo.find({ select: ["status"] });
    let total = allRequests.length;
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    for (const req of allRequests) {
      if (req.status === "Pending" || req.status === "Approved_By_Manager") pending++;
      else if (req.status === "Approved") approved++;
      else if (req.status === "Rejected") rejected++;
    }

    const data = await Promise.all(
      requests.map(async (r) => {
        let remainingDays = 0;
        if (r.employee && r.leave_type) {
          const balance = await this.balanceRepo.findOne({
            where: {
              employee: { employee_id: r.employee.employee_id },
              leave_type: { leave_type_id: r.leave_type.leave_type_id },
            },
          });
          remainingDays = balance ? balance.remaining_days : r.leave_type.default_days_allocated;
        }

        return {
          request_id: r.request_id,
          employee_id: r.employee?.employee_id,
          employee_email: r.employee?.email,
          employee_name: `${r.employee?.first_name} ${r.employee?.last_name}`,
          employee_avatar: r.employee?.avatar_url,
          employee_department: r.employee?.department?.department_name,
          employee_position: r.employee?.position?.position_name,
          leave_type_name: r.leave_type?.name,
          start_date: r.start_date,
          end_date: r.end_date,
          reason: r.reason,
          status: r.status,
          manager_approver: r.manager_approver?.email,
          remaining_leave_days: remainingDays,
        };
      })
    );

    return {
      data,
      stats: { total, pending, approved, rejected }
    };
  }

  // Manager/HR: Approve or reject a leave request
  // CRITICAL LOGIC: If status is 'Approved', deduct days from LeaveBalance
  // Manager/HR: Approve or reject a leave request
  // CRITICAL LOGIC: If status is 'Approved', deduct days from LeaveBalance
  async approveLeaveRequest(
    requestId: number,
    newStatus: string,
    managerId: number,
    adminNote?: string // Thêm tham số hứng note từ Controller
  ) {
    // Validate new status
    if (!["Approved", "Rejected", "Approved_By_Manager"].includes(newStatus)) {
      throw new BadRequestException(
        "Invalid status. Must be 'Approved', 'Approved_By_Manager', or 'Rejected'"
      );
    }

    // Find the leave request
    const leaveRequest = await this.leaveReqRepo.findOne({
      where: { request_id: requestId },
      relations: ["employee", "leave_type"],
    });

    if (!leaveRequest) {
      throw new BadRequestException("Leave request not found");
    }

    // Save original status before mutation (needed for restore logic)
    const previousStatus = leaveRequest.status;

    // Get manager details
    const manager = await this.employeeRepo.findOne({
      where: { employee_id: managerId },
    });

    // Update leave request status AND save the admin note
    leaveRequest.status = newStatus;
    leaveRequest.manager_approver = manager ?? undefined;
    if (adminNote) {
      leaveRequest.admin_note = adminNote;
    }

    await this.leaveReqRepo.save(leaveRequest);

    // Xây dựng nội dung thông báo động có chứa lý do
    let notifMessage = `Your leave request from ${leaveRequest.start_date} to ${leaveRequest.end_date} has been ${newStatus.toLowerCase()}.`;
    if (adminNote && adminNote.trim() !== '') {
      notifMessage += ` Note from Admin: "${adminNote}"`;
    }

    // Call WebSocket Notification Service
    await this.notificationsService.createNotification(
      leaveRequest.employee.employee_id,
      "Leave Request Update",
      notifMessage,
      NotificationType.LEAVE
    );

    // CRITICAL LOGIC: If status is 'Approved', deduct days from LeaveBalance
    if (newStatus === "Approved") {
      // Calculate number of working days (excluding weekends)
      const start = new Date(leaveRequest.start_date);
      const end = new Date(leaveRequest.end_date);
      
      // Count working days (Mon-Fri)
      let daysRequested = 0;
      const current = new Date(start);
      while (current <= end) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0=Sun, 6=Sat
          daysRequested++;
        }
        current.setDate(current.getDate() + 1);
      }
      // Fallback: if all days are weekend, use calendar days
      if (daysRequested === 0) {
        daysRequested = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }

      // Find the corresponding LeaveBalance record
      let balance = await this.balanceRepo.findOne({
        where: {
          employee: { employee_id: leaveRequest.employee.employee_id },
          leave_type: { leave_type_id: leaveRequest.leave_type.leave_type_id },
        },
      });

      if (!balance) {
        // Auto-create balance record if it doesn't exist yet
        const defaultDays = leaveRequest.leave_type?.default_days_allocated || 0;
        balance = this.balanceRepo.create({
          employee: leaveRequest.employee,
          leave_type: leaveRequest.leave_type,
          remaining_days: defaultDays - daysRequested,
        });
        await this.balanceRepo.save(balance);
      } else {
        // Deduct days from remaining_days (allows negative balance)
        balance.remaining_days = balance.remaining_days - daysRequested;
        await this.balanceRepo.save(balance);
      }
    }

    // If revoking (back to Pending/Rejected from Approved), restore balance
    if (newStatus === "Rejected" && previousStatus === "Approved") {
      // Recalculate days to restore
      const start = new Date(leaveRequest.start_date);
      const end = new Date(leaveRequest.end_date);
      let daysToRestore = 0;
      const current = new Date(start);
      while (current <= end) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) daysToRestore++;
        current.setDate(current.getDate() + 1);
      }
      if (daysToRestore === 0) {
        daysToRestore = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }

      const balance = await this.balanceRepo.findOne({
        where: {
          employee: { employee_id: leaveRequest.employee.employee_id },
          leave_type: { leave_type_id: leaveRequest.leave_type.leave_type_id },
        },
      });

      if (balance) {
        const leaveType = await this.leaveTypeRepo.findOne({
          where: { leave_type_id: leaveRequest.leave_type.leave_type_id }
        });
        const maxDays = leaveType?.default_days_allocated || 999;
        balance.remaining_days = Math.min(maxDays, balance.remaining_days + daysToRestore);
        await this.balanceRepo.save(balance);
      }
    }

    return {
      request_id: leaveRequest.request_id,
      status: leaveRequest.status,
      message: `Leave request ${newStatus.toLowerCase()}`,
    };
  }
}
