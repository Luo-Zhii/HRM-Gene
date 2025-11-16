import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("reports")
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Get("payroll-summary")
  async payrollSummary(
    @Query("month") month: string,
    @Query("year") year: string
  ) {
    const m = parseInt(month, 10) || new Date().getMonth() + 1;
    const y = parseInt(year, 10) || new Date().getFullYear();
    return this.svc.payrollSummary(m, y);
  }
}
