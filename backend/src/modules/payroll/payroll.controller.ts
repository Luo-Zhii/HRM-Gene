import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PayrollService } from "./payroll.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Permissions } from "../auth/permissions.decorator";
import { AdjustmentType, AdjustmentStatus } from "@/entities/salary-adjustment.entity";

@Controller("payroll")
@UseGuards(JwtAuthGuard, RolesGuard) // Đưa Guard lên đây để bảo vệ toàn bộ API trong file
export class PayrollController {
  constructor(private readonly svc: PayrollService) { }

  @Permissions("manage:payroll")
  @Post("generate")
  async generate(@Body() body: { month: number; year: number }) {
    return this.svc.generatePayslips(body.month, body.year);
  }

  @Permissions("manage:payroll")
  @Get("list")
  async list(@Query("month") month: string, @Query("year") year: string) {
    const m = parseInt(month, 10) || new Date().getMonth() + 1;
    const y = parseInt(year, 10) || new Date().getFullYear();
    return this.svc.getPayslipsByPeriod(m, y);
  }

  @Permissions("manage:payroll")
  @Get("period")
  async getPeriodByMonthYear(@Query("month") month: string, @Query("year") year: string) {
    const m = parseInt(month, 10) || new Date().getMonth() + 1;
    const y = parseInt(year, 10) || new Date().getFullYear();
    return this.svc.getPeriodByMonthYear(m, y);
  }

  @Permissions("manage:payroll")
  @Get("cycle/:id")
  async getCycleDetail(@Param("id", ParseIntPipe) id: number) {
    return this.svc.getPayslipsByPeriodId(id);
  }

  // API này cho cá nhân xem lương nên KHÔNG cần quyền manage:payroll, chỉ cần đăng nhập
  @Get("my-payslips")
  async getMyPayslips(@Request() req: any) {
    return this.svc.getEmployeePayslips(req.user.employee_id);
  }

  @Permissions("manage:payroll")
  @Get(":id")
  async getPayslipDetail(@Param("id", ParseIntPipe) id: number) {
    return this.svc.getPayslipById(id);
  }

  @Permissions("manage:payroll")
  @Post("run")
  async run(@Body() body: { month: number; year: number }) {
    return this.svc.runPayroll(body.month, body.year);
  }

  // ============= Payslip Approval & Payment =============

  @Permissions("manage:payroll")
  @Patch(":id/approve")
  async approvePayslip(@Param("id", ParseIntPipe) id: number) {
    return this.svc.approvePayslip(id);
  }

  @Permissions("manage:payroll")
  @Patch(":id/mark-paid")
  async markPayslipPaid(@Param("id", ParseIntPipe) id: number) {
    return this.svc.markPayslipPaid(id);
  }

  @Permissions("manage:payroll")
  @Post("approve-all")
  async approveAllPayslips(@Body() body: { month: number; year: number }) {
    return this.svc.approveAllPayslips(body.month, body.year);
  }

  // ============= Salary Config Management =============

  @Permissions("manage:payroll")
  @Get("config")
  async getSalaryConfigs() {
    return this.svc.getAllSalaryConfigs();
  }

  @Permissions("manage:payroll")
  @Get("config/:employeeId")
  async getSalaryConfig(@Param("employeeId", ParseIntPipe) employeeId: number) {
    if (!employeeId || isNaN(employeeId) || employeeId <= 0) {
      throw new BadRequestException(`Invalid employee ID: ${employeeId}`);
    }
    const config = await this.svc.getSalaryConfigByEmployeeId(employeeId);
    if (!config) throw new NotFoundException(`Salary configuration not found for employee ID: ${employeeId}`);
    return config;
  }

  @Permissions("manage:payroll")
  @Patch("config/:employeeId")
  async updateSalaryConfig(
    @Param("employeeId", ParseIntPipe) employeeId: number,
    @Body() body: { base_salary: string; transport_allowance: string; lunch_allowance: string; responsibility_allowance: string }
  ) {
    if (!employeeId || isNaN(employeeId)) throw new BadRequestException("Invalid employee ID");
    return this.svc.updateSalaryConfig(employeeId, body);
  }

  // ============= Salary Adjustment CRUD =============

  @Permissions("manage:payroll")
  @Post("adjustments")
  async createAdjustment(
    @Request() req: any,
    @Body() body: { employee_id: number; type: AdjustmentType; amount: string; applied_month: string; reason?: string }
  ) {
    return this.svc.createAdjustment({ ...body, created_by_id: req.user.employee_id });
  }

  @Permissions("manage:payroll")
  @Get("adjustments")
  async getAllAdjustments(@Query("type") type?: string) {
    return this.svc.getAllAdjustments(type as AdjustmentType | undefined);
  }

  @Permissions("manage:payroll")
  @Get("adjustments/:id")
  async getAdjustment(@Param("id", ParseIntPipe) id: number) {
    return this.svc.getAdjustmentById(id);
  }

  @Permissions("manage:payroll")
  @Patch("adjustments/:id")
  async updateAdjustment(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: Partial<{ type: AdjustmentType; amount: string; applied_month: string; reason: string; status: AdjustmentStatus }>
  ) {
    return this.svc.updateAdjustment(id, body);
  }

  @Permissions("manage:payroll")
  @Delete("adjustments/:id")
  async deleteAdjustment(@Param("id", ParseIntPipe) id: number) {
    return this.svc.deleteAdjustment(id);
  }
}