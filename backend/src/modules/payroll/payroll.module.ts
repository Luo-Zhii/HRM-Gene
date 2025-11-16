import { Module } from "@nestjs/common";
import { PayrollService } from "./payroll.service";
import { PayrollController } from "./payroll.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Contract } from "@/entities/contract.entity";
import { TimeKeeping } from "@/entities/timekeeping.entity";
import { Payslip } from "@/entities/payslip.entity";
import { Employee } from "@/entities/employee.entity";
import { PositionPermission } from "@/entities/position-permission.entity";
import { Permission } from "@/entities/permission.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contract,
      TimeKeeping,
      Payslip,
      Employee,
      PositionPermission,
      Permission,
    ]),
  ],
  providers: [PayrollService],
  controllers: [PayrollController],
})
export class PayrollModule {}
