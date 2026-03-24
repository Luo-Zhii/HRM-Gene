import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "@nestjs/cache-manager";
import { TimeKeepingService } from "./timekeeping.service";
import { TimeKeepingController } from "./timekeeping.controller";
import { AttendanceAdminController } from "./attendance.controller";
import { IPWhitelistGuard } from "./ip-whitelist.guard";
import { CompanySettings } from "../../entities/company-settings.entity";
import { TimeKeeping } from "../../entities/timekeeping.entity";
import { Employee } from "../../entities/employee.entity";
import { Notification } from "../../entities/notification.entity";
import { Violation } from "../../entities/violation.entity";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanySettings, TimeKeeping, Employee, Notification, Violation]),
    CacheModule.register(),
    NotificationsModule,
  ],
  providers: [TimeKeepingService, IPWhitelistGuard],
  controllers: [TimeKeepingController, AttendanceAdminController],
})
export class TimeKeepingModule {}
