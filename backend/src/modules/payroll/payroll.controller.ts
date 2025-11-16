import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { PayrollService } from "./payroll.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Permissions } from "../auth/permissions.decorator";

@Controller("payroll")
export class PayrollController {
  constructor(private readonly svc: PayrollService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions("manage:payroll")
  @Post("run")
  async run(@Body() body: { month: number; year: number }) {
    const { month, year } = body;
    return this.svc.runPayroll(month, year);
  }
}
