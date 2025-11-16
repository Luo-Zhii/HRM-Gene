import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { CompanySettings } from "../../entities/company-settings.entity";
import { Department } from "../../entities/department.entity";
import { Position } from "../../entities/position.entity";
import { Permission } from "../../entities/permission.entity";
import { PositionPermission } from "../../entities/position-permission.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompanySettings,
      Department,
      Position,
      Permission,
      PositionPermission,
    ]),
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
