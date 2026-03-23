import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ViolationsService } from "./violations.service";
import { ViolationsController } from "./violations.controller";
import { Violation } from "../../entities/violation.entity";
import { Employee } from "../../entities/employee.entity";
import { TimeKeeping } from "../../entities/timekeeping.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Violation, Employee, TimeKeeping])],
  providers: [ViolationsService],
  controllers: [ViolationsController],
  exports: [ViolationsService],
})
export class ViolationsModule {}

