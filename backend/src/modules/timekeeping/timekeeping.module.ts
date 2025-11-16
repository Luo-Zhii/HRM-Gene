import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TimeKeepingService } from "./timekeeping.service";
import { TimeKeepingController } from "./timekeeping.controller";
import { IPWhitelistGuard } from "./ip-whitelist.guard";
import { CompanySettings } from "../../entities/company-settings.entity";

@Module({
  imports: [TypeOrmModule.forFeature([CompanySettings])],
  providers: [TimeKeepingService, IPWhitelistGuard],
  controllers: [TimeKeepingController],
})
export class TimeKeepingModule {}
