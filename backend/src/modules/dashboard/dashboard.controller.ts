import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Permissions } from '../auth/permissions.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('employee')
  async getEmployeeData(@Req() req: any) {
    console.log("DEBUG: Controller User Payload:", req.user);
    return this.dashboardService.getEmployeeData(req.user);
  }

  @Get('admin')
  @Permissions('manage:system')
  @UseGuards(RolesGuard)
  async getAdminData() {
    return this.dashboardService.getAdminData();
  }

  @Get('holidays')
  async getHolidays() {
    return this.dashboardService.getHolidayList();
  }
}
