import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Announcement } from '../../entities/announcement.entity';
import { LeaveRequest } from '../../entities/leave-request.entity';
import { ResignationRequest } from '../../entities/resignation-request.entity';
import { Employee } from '../../entities/employee.entity';
import { AnnouncementsModule } from '../announcements/announcements.module';

import { LeaveBalance } from '../../entities/leave-balance.entity';
import { LeaveType } from '../../entities/leave-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Announcement, LeaveRequest, ResignationRequest, Employee, LeaveBalance, LeaveType]),
    AnnouncementsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
