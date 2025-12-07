import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  Patch,
  UseGuards,
  Request,
  ParseIntPipe,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
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

  // ============= Salary Config Management =============
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions("manage:payroll", "manage:system")
  @Get("config")
  async getSalaryConfigs() {
    try {
      return await this.svc.getAllSalaryConfigs();
    } catch (error) {
      console.error("Error fetching salary configs:", error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions("manage:payroll", "manage:system")
  @Get("config/:employeeId")
  async getSalaryConfig(@Param("employeeId", ParseIntPipe) employeeId: number) {
    try {
      if (!employeeId || isNaN(employeeId) || employeeId <= 0) {
        throw new BadRequestException(`Invalid employee ID: ${employeeId}`);
      }

      const config = await this.svc.getSalaryConfigByEmployeeId(employeeId);
      if (!config) {
        throw new NotFoundException(
          `Salary configuration not found for employee ID: ${employeeId}`
        );
      }
      return config;
    } catch (error) {
      console.error(`Error fetching salary config for employee ${employeeId}:`, error);
      // Re-throw NestJS exceptions as-is (they have proper HTTP status codes)
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      // Wrap unexpected errors
      throw new BadRequestException(
        error instanceof Error ? error.message : "Failed to fetch salary configuration"
      );
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions("manage:payroll", "manage:system")
  @Patch("config/:employeeId")
  async updateSalaryConfig(
    @Param("employeeId", ParseIntPipe) employeeId: number,
    @Body() body: {
      base_salary: string;
      transport_allowance: string;
      lunch_allowance: string;
      responsibility_allowance: string;
    }
  ) {
    try {
      if (!employeeId || isNaN(employeeId)) {
        throw new BadRequestException("Invalid employee ID");
      }

      return await this.svc.updateSalaryConfig(employeeId, body);
    } catch (error) {
      console.error(`Error updating salary config for employee ${employeeId}:`, error);
      // Re-throw NestJS exceptions as-is, wrap others
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : "Failed to update salary configuration"
      );
    }
  }
}
