import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "@nestjs/cache-manager";
import { TimeKeepingService } from "./timekeeping.service";
import { TimeKeepingController } from "./timekeeping.controller";
import { IPWhitelistGuard } from "./ip-whitelist.guard";
import { CompanySettings } from "../../entities/company-settings.entity";
import { TimeKeeping } from "../../entities/timekeeping.entity";
import { Employee } from "../../entities/employee.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanySettings, TimeKeeping, Employee]),
    CacheModule.register(),
  ],
  providers: [TimeKeepingService, IPWhitelistGuard],
  controllers: [TimeKeepingController],
})
export class TimeKeepingModule {}
