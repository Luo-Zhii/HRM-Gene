import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "@nestjs/cache-manager";
import { AuthModule } from "./modules/auth/auth.module";
import { TimeKeepingModule } from "./modules/timekeeping/timekeeping.module";
import { AdminModule } from "./modules/admin/admin.module";
import { LeaveModule } from "./modules/leave/leave.module";
import { PayrollModule } from "./modules/payroll/payroll.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { ContractsModule } from "./modules/contracts/contracts.module";
import { ViolationsModule } from "./modules/violations/violations.module";

import * as path from "path";
import { ConfigModule } from "@nestjs/config";
import { EmployeesModule } from "./modules/employees/employees.module";

@Module({
  imports: [
    // ConfigModule.forRoot({
    //   isGlobal: true, // Giúp .env dùng được ở mọi nơi trong app
    // }),
    CacheModule.register({
      store: "redis",
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      ttl: 10, // default TTL in seconds
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432", 10),
      username: process.env.DB_USER || "postgres",
      password: process.env.DB_PASS || "postgres",
      database: process.env.DB_NAME || "hrm",
      entities: [path.join(__dirname, "/entities/*.js")],
      migrations: [path.join(__dirname, "/migrations/*.js")],
      synchronize: false,
    } as any),
    AuthModule,
    TimeKeepingModule,
    AdminModule,
    LeaveModule,
    PayrollModule,
    ReportsModule,
    ContractsModule,
    ViolationsModule,
    EmployeesModule
  ],
})
export class AppModule {}
