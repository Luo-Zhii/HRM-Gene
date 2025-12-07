import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from "@nestjs/common";
import { PayrollService } from "./payroll.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Permissions } from "../auth/permissions.decorator";

@Controller("payroll")
export class PayrollController {
  constructor(private readonly svc: PayrollService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions("manage:payroll", "manage:system")
  @Post("generate")
  async generate(@Body() body: { month: number; year: number }) {
    const { month, year } = body;
    return this.svc.generatePayslips(month, year);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions("manage:payroll", "manage:system")
  @Get("list")
  async list(@Query("month") month: string, @Query("year") year: string) {
    const m = parseInt(month, 10) || new Date().getMonth() + 1;
    const y = parseInt(year, 10) || new Date().getFullYear();
    return this.svc.getPayslipsByPeriod(m, y);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions("manage:payroll", "manage:system")
  @Get("period")
  async getPeriodByMonthYear(
    @Query("month") month: string,
    @Query("year") year: string
  ) {
    const m = parseInt(month, 10) || new Date().getMonth() + 1;
    const y = parseInt(year, 10) || new Date().getFullYear();
    return this.svc.getPeriodByMonthYear(m, y);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions("manage:payroll", "manage:system")
  @Get("cycle/:id")
  async getCycleDetail(@Param("id", ParseIntPipe) id: number) {
    return this.svc.getPayslipsByPeriodId(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("my-payslips")
  async getMyPayslips(@Request() req: any) {
    const employeeId = req.user.employee_id;
    return this.svc.getEmployeePayslips(employeeId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions("manage:payroll", "manage:system")
  @Post("run")
  async run(@Body() body: { month: number; year: number }) {
    const { month, year } = body;
    return this.svc.runPayroll(month, year);
  }
}
