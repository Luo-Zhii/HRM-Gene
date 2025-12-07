import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ContractsService } from "./contracts.service";
import { ContractsController } from "./contracts.controller";
import { SalaryHistoryController } from "./salary-history.controller";
import { Contract } from "../../entities/contract.entity";
import { Employee } from "../../entities/employee.entity";
import { SalaryHistory } from "../../entities/salary-history.entity";
import { SalaryConfig } from "../../entities/salary-config.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contract,
      Employee,
      SalaryHistory,
      SalaryConfig,
    ]),
  ],
  providers: [ContractsService],
  controllers: [ContractsController, SalaryHistoryController],
  exports: [ContractsService],
})
export class ContractsModule {}

