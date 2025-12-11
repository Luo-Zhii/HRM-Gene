import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Payslip } from "../../entities/payslip.entity";
import { Employee } from "../../entities/employee.entity";
import { Department } from "../../entities/department.entity";
import { PayrollPeriod } from "../../entities/payroll-period.entity";
import { Contract } from "../../entities/contract.entity";
import { SalaryConfig } from "../../entities/salary-config.entity";
import { ReportsService } from "./reports.service";
import { ReportsController } from "./reports.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payslip,
      Employee,
      Department,
      PayrollPeriod,
      Contract,
      SalaryConfig,
    ]),
  ],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
