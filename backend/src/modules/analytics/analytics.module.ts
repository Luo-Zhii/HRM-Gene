import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Employee } from '../../entities/employee.entity';
import { Contract } from '../../entities/contract.entity';
import { Payslip } from '../../entities/payslip.entity';
import { KpiAssignment } from '../../entities/kpi-assignment.entity';
import { Department } from '../../entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Contract, Payslip, KpiAssignment, Department])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
