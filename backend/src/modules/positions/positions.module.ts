import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PositionsService } from "./positions.service";
import { PositionsController } from "./positions.controller";
import { Position } from "../../entities/position.entity";
import { PositionPermission } from "@/entities/position-permission.entity";
import { Permission } from "@/entities/permission.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Position, PositionPermission, Permission]),
  ],
  providers: [PositionsService],
  controllers: [PositionsController],
  exports: [PositionsService],
})
export class PositionsModule {}
