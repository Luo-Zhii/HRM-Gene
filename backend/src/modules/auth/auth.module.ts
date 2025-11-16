import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { RolesGuard } from "./roles.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Employee } from "../../entities/employee.entity";
import { Position } from "../../entities/position.entity";
import { PositionPermission } from "../../entities/position-permission.entity";
import { Permission } from "../../entities/permission.entity";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || "CHANGE_ME",
      signOptions: { expiresIn: "1h" },
    }),
    TypeOrmModule.forFeature([
      Employee,
      Position,
      PositionPermission,
      Permission,
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {}
