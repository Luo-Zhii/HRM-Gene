import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
  Delete,
} from "@nestjs/common";
import { KpiService } from "./kpi.service";
import {
  CreateKpiLibraryDto,
  CreateKpiPeriodDto,
  AssignKpisDto,
  UpdateActualValueDto,
  ApproveAssignmentDto,
} from "./dto/kpi.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Permissions } from "../auth/permissions.decorator";

@Controller("kpi")
@UseGuards(JwtAuthGuard, RolesGuard)
export class KpiController {
  constructor(private readonly kpiService: KpiService) { }

  @Post("library")
  @Permissions("manage:system")
  createLibrary(@Body() dto: CreateKpiLibraryDto, @Req() req: any) {
    return this.kpiService.createLibrary(dto, req.user.employee_id);
  }

  @Get("library")
  getLibrary() {
    return this.kpiService.getLibrary();
  }

  @Delete("assignment/:id")
  @Permissions("manage:system")
  deleteAssignment(@Param("id", ParseIntPipe) id: number) {
    return this.kpiService.deleteAssignment(id);
  }

  @Post("period")
  @Permissions("manage:system")
  createPeriod(@Body() dto: CreateKpiPeriodDto) {
    return this.kpiService.createPeriod(dto);
  }
  @Get(["period", "periods"])
  getPeriods() {
    return this.kpiService.getPeriods();
  }

  @Post("assign")
  @Permissions("manage:system")
  assignKpis(@Body() dto: AssignKpisDto) {
    return this.kpiService.assignKpis(dto);
  }

  @Patch("library/:id")
  @Permissions("manage:system")
  updateLibrary(@Param("id", ParseIntPipe) id: number, @Body() dto: any) {
    return this.kpiService.updateLibrary(id, dto);
  }

  @Patch("assignment/:id/actual")
  updateActual(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateActualValueDto
  ) {
    return this.kpiService.updateActual(id, dto.actual_value);
  }

  @Patch("assignment/:id/grade")
  @Permissions("manage:system")
  gradeAssignment(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ApproveAssignmentDto
  ) {
    return this.kpiService.gradeAssignment(id, dto.manager_score);
  }

  @Get("assignments")
  getEmployeeAssignments(
    @Query("employee_id", ParseIntPipe) employeeId: number,
    @Query("period_id", ParseIntPipe) periodId: number
  ) {
    return this.kpiService.getEmployeeAssignments(employeeId, periodId);
  }

  @Get("my-performance")
  getMyPerformance(@Req() req: any, @Query("period_id", ParseIntPipe) periodId: number) {
    return this.kpiService.getEmployeeAssignments(req.user.employee_id, periodId);
  }

  @Get("calculate-score")
  calculateScore(
    @Query("employee_id", ParseIntPipe) employeeId: number,
    @Query("period_id", ParseIntPipe) periodId: number
  ) {
    return this.kpiService.calculateFinalKpiScore(employeeId, periodId);
  }
}
