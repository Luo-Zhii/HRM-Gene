import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Payslip } from "../../entities/payslip.entity";
import { Employee } from "../../entities/employee.entity";
import { Department } from "../../entities/department.entity";
import { ReportsService } from "./reports.service";
import { ReportsController } from "./reports.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Payslip, Employee, Department])],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
