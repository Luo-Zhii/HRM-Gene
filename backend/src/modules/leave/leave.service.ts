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
  ) {}

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

  // Manager/HR: Get all pending leave requests for review
  async getPendingRequests() {
    const requests = await this.leaveReqRepo.find({
      where: [{ status: "Pending" }, { status: "Approved_By_Manager" }],
      relations: ["leave_type", "employee", "manager_approver"],
      order: { request_id: "DESC" },
    });

    return requests.map((r) => ({
      request_id: r.request_id,
      employee_email: r.employee?.email,
      employee_name: `${r.employee?.first_name} ${r.employee?.last_name}`,
      leave_type_name: r.leave_type?.name,
      start_date: r.start_date,
      end_date: r.end_date,
      reason: r.reason,
      status: r.status,
      manager_approver: r.manager_approver?.email,
    }));
  }

  // Manager/HR: Approve or reject a leave request
  // CRITICAL LOGIC: If status is 'Approved', deduct days from LeaveBalance
  async approveLeaveRequest(
    requestId: number,
    newStatus: string,
    managerId: number
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

    // Get manager details
    const manager = await this.employeeRepo.findOne({
      where: { employee_id: managerId },
    });

    // Update leave request status
    leaveRequest.status = newStatus;
    leaveRequest.manager_approver = manager ?? undefined;
    await this.leaveReqRepo.save(leaveRequest);

    // Call WebSocket Notification Service
    await this.notificationsService.createNotification(
      leaveRequest.employee.employee_id,
      "Leave Request Update",
      `Your leave request from ${leaveRequest.start_date} to ${leaveRequest.end_date} has been ${newStatus.toLowerCase()}.`,
      NotificationType.LEAVE
    );

    // CRITICAL LOGIC: If status is 'Approved', deduct days from LeaveBalance
    if (newStatus === "Approved") {
      // Calculate number of days (including start and end date)
      const start = new Date(leaveRequest.start_date);
      const end = new Date(leaveRequest.end_date);
      const daysRequested =
        Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1;

      // Find the corresponding LeaveBalance record
      const balance = await this.balanceRepo.findOne({
        where: {
          employee: { employee_id: leaveRequest.employee.employee_id },
          leave_type: { leave_type_id: leaveRequest.leave_type.leave_type_id },
        },
      });

      if (balance) {
        // Deduct days from remaining_days
        balance.remaining_days -= daysRequested;
        if (balance.remaining_days < 0) {
          balance.remaining_days = 0; // Prevent negative balance
        }
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
