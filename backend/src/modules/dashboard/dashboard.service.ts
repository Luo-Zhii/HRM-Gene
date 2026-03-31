import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from '../../entities/announcement.entity';
import { LeaveRequest } from '../../entities/leave-request.entity';
import { ResignationRequest, ResignationStatus } from '../../entities/resignation-request.entity';
import { Employee } from '../../entities/employee.entity';
import { AnnouncementsService } from '../announcements/announcements.service';

import { LeaveBalance } from '../../entities/leave-balance.entity';
import { LeaveType } from '../../entities/leave-type.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRepo: Repository<LeaveRequest>,
    @InjectRepository(ResignationRequest)
    private readonly resignationRepo: Repository<ResignationRequest>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(LeaveBalance)
    private readonly leaveBalanceRepo: Repository<LeaveBalance>,
    @InjectRepository(LeaveType)
    private readonly leaveTypeRepo: Repository<LeaveType>,
    private readonly announcementsService: AnnouncementsService,
  ) { }

  async getEmployeeData(user: any) {
    const recentAnnouncements = await this.announcementsService.getFeed(user);

    // TRUY VẤN THẬT: Lấy ID từ JWT (thử cả 2 trường hợp id hoặc employee_id)
    const empId = user.employee_id || user.id || user.sub;

    // Tìm số dư ngày phép đầu tiên tìm thấy của nhân viên này
    const balanceRecord = await this.leaveBalanceRepo.findOne({
      where: { employee: { employee_id: empId } },
      relations: ['leave_type']
    });

    const ptoBalance = balanceRecord ? balanceRecord.remaining_days : 0;

    return {
      stats: {
        ptoBalance: ptoBalance,
        daysWorkedThisMonth: 18,
      },
      nextHoliday: this.getNextHoliday(),
      recentAnnouncements: recentAnnouncements.slice(0, 3),
    };
  }
  getHolidayList() {
    return [
      { name: "New Year", date: "2026-01-01", color: "blue" },
      { name: "Tet Holiday", date: "2026-02-17", color: "amber" },
      { name: "Hung Kings' Festival", date: "2026-04-26", color: "emerald" },
      { name: "Reunification Day", date: "2026-04-30", color: "indigo" },
      { name: "International Workers' Day", date: "2026-05-01", color: "orange" },
      { name: "National Day", date: "2026-09-02", color: "rose" },
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private getNextHoliday() {
    const now = new Date();
    const holidays = this.getHolidayList();

    return holidays.find(h => new Date(h.date) >= now) || holidays[0];
  }

  async getAdminData() {
    // Count actual pending requests
    const pendingLeave = await this.leaveRepo.count({ where: { status: 'Pending' } });
    const pendingResignations = await this.resignationRepo.count({ where: { status: ResignationStatus.PENDING } });

    return {
      attendance: {
        total: 150,
        present: 142,
        absent: 5,
        late: 3,
      },
      pendingApprovals: {
        leaveRequests: pendingLeave,
        resignations: pendingResignations,
      },
    };
  }
}
