import {
  Controller,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common";
import { TimeKeepingService } from "./timekeeping.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Permissions } from "../auth/permissions.decorator";

@Controller("attendance")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceAdminController {
  constructor(private readonly svc: TimeKeepingService) {}

  /**
   * Admin/HR view of ALL employee attendance records
   * GET /api/attendance/admin/all?page=1&limit=50
   */
  @Get("admin/all")
  @Permissions("manage:system", "manage:leave")
  async getAllForAdmin(
    @Query("page") page: string,
    @Query("limit") limit: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    const pageNum = Math.max(1, parseInt(page || "1", 10) || 1);
    const limitNum = Math.min(
      200,
      Math.max(1, parseInt(limit || "50", 10) || 50)
    );

    return this.svc.getAllForAdmin(pageNum, limitNum, startDate, endDate);
  }
}


