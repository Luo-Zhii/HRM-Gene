import { Module } from "@nestjs/common";
import { PayrollService } from "./payroll.service";
import { PayrollController } from "./payroll.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TimeKeeping } from "@/entities/timekeeping.entity";
import { Payslip } from "@/entities/payslip.entity";
import { Employee } from "@/entities/employee.entity";
import { SalaryConfig } from "@/entities/salary-config.entity";
import { PayrollPeriod } from "@/entities/payroll-period.entity";
import { LeaveRequest } from "@/entities/leave-request.entity";
import { PositionPermission } from "@/entities/position-permission.entity";
import { Permission } from "@/entities/permission.entity";
import { Contract } from "@/entities/contract.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TimeKeeping,
      Payslip,
      Employee,
      SalaryConfig,
      PayrollPeriod,
      LeaveRequest,
      PositionPermission,
      Permission,
      Contract
    ]),
  ],
  providers: [PayrollService],
  controllers: [PayrollController],
})
export class PayrollModule {}
