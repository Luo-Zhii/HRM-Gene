import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ViolationsService } from "./violations.service";
import { ViolationsController } from "./violations.controller";
import { Violation } from "../../entities/violation.entity";
import { Employee } from "../../entities/employee.entity";
import { TimeKeeping } from "../../entities/timekeeping.entity";
import { Notification } from "../../entities/notification.entity";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Violation, Employee, TimeKeeping, Notification]),
    NotificationsModule
  ],
  providers: [ViolationsService],
  controllers: [ViolationsController],
  exports: [ViolationsService],
})
export class ViolationsModule {}

