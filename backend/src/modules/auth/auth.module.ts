import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config"; // <--- 1. Import thêm cái này
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
    // 2. Sửa đoạn này: Dùng registerAsync thay vì register thường
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        // Lấy secret từ .env thông qua ConfigService
        // Đảm bảo file .env đã load xong mới lấy giá trị -> Không lo bị undefined
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "1h" },
      }),
      inject: [ConfigService],
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
