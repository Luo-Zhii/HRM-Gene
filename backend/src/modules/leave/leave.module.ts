import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LeaveRequest } from "../../entities/leave-request.entity";
import { LeaveBalance } from "../../entities/leave-balance.entity";
import { LeaveType } from "../../entities/leave-type.entity";
import { Employee } from "../../entities/employee.entity";
import { PositionPermission } from "../../entities/position-permission.entity";
import { Permission } from "../../entities/permission.entity";
import { LeaveService } from "./leave.service";
import { LeaveController } from "./leave.controller";
import { Position } from "@/entities/position.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LeaveRequest,
      LeaveBalance,
      LeaveType,
      Employee,
      PositionPermission,
      Permission,
      Position,
    ]),
  ],
  providers: [LeaveService],
  controllers: [LeaveController],
})
export class LeaveModule {}
