import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ViolationsService } from "./violations.service";
import { ViolationsController } from "./violations.controller";
import { Violation } from "../../entities/violation.entity";
import { Employee } from "../../entities/employee.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Violation, Employee])],
  providers: [ViolationsService],
  controllers: [ViolationsController],
  exports: [ViolationsService],
})
export class ViolationsModule {}

