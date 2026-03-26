import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { KpiLibrary } from "../../entities/kpi-library.entity";
import { KpiPeriod } from "../../entities/kpi-period.entity";
import { KpiAssignment } from "../../entities/kpi-assignment.entity";
import { Employee } from "../../entities/employee.entity";
import { KpiService } from "./kpi.service";
import { KpiController } from "./kpi.controller";

@Module({
  imports: [TypeOrmModule.forFeature([KpiLibrary, KpiPeriod, KpiAssignment, Employee])],
  controllers: [KpiController],
  providers: [KpiService],
  exports: [KpiService],
})
export class KpiModule {}
