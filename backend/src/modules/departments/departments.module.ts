import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DepartmentsService } from "./departments.service";
import { DepartmentsController } from "./departments.controller";
import { Department } from "../../entities/department.entity";
import { Position } from "@/entities/position.entity";
import { Permission } from "@/entities/permission.entity";
import { PositionPermission } from "@/entities/position-permission.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Department,
      Position,
      Permission,
      PositionPermission,
    ]),
  ],
  providers: [DepartmentsService],
  controllers: [DepartmentsController],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
