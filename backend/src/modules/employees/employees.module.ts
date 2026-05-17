import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmployeesService } from "./employees.service";
import { EmployeesController } from "./employees.controller";
import { StaffDirectoryController } from "./staff-directory.controller";
import { Employee } from "../../entities/employee.entity";
import { Department } from "../../entities/department.entity";
import { Position } from "../../entities/position.entity";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, Department, Position]),
    NotificationsModule,
  ],
  providers: [EmployeesService],
  controllers: [EmployeesController, StaffDirectoryController],
  exports: [EmployeesService],
})
export class EmployeesModule {}
