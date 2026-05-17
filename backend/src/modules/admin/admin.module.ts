import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { CompanySettings } from "../../entities/company-settings.entity";
import { Department } from "../../entities/department.entity";
import { Position } from "../../entities/position.entity";
import { Permission } from "../../entities/permission.entity";
import { PositionPermission } from "../../entities/position-permission.entity";
import { Employee } from "../../entities/employee.entity";
import { Contract } from "../../entities/contract.entity";
import { SalaryHistory } from "../../entities/salary-history.entity";
import { Payslip } from "../../entities/payslip.entity";
import { PayrollPeriod } from "../../entities/payroll-period.entity";
import { SalaryConfig } from "../../entities/salary-config.entity";
import { DepartmentsController } from "../departments/departments.controller";
import { PositionsController } from "../positions/positions.controller";
import { DepartmentsService } from "../departments/departments.service";
import { PositionsService } from "../positions/positions.service";
import { PublicHoliday } from "../../entities/public-holiday.entity";
import { HolidayService } from "./holiday.service";
import { HolidayController } from "./holiday.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompanySettings,
      Department,
      Position,
      Permission,
      PositionPermission,
      Employee,
      Contract,
      SalaryHistory,
      Payslip,
      PayrollPeriod,
      SalaryConfig,
      PublicHoliday,
    ]),
  ],
  providers: [AdminService, DepartmentsService, PositionsService, HolidayService],
  controllers: [AdminController, 
    DepartmentsController, PositionsController, HolidayController],
  exports: [HolidayService],
})
export class AdminModule {}
