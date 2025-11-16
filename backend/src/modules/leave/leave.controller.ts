import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { LeaveService } from "./leave.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Permissions } from "../auth/permissions.decorator";

@Controller("leave")
@UseGuards(JwtAuthGuard)
export class LeaveController {
  constructor(private readonly svc: LeaveService) {}

  @Get("types")
  async getLeaveTypes() {
    return this.svc.getLeaveTypes();
  }

  // === Employee Endpoints ===

  @Get("balance")
  async getBalance(@Request() req: any) {
    const employeeId = req.user?.employee_id;
    return this.svc.getBalance(employeeId);
  }

  @Get("my-requests")
  async getMyRequests(@Request() req: any) {
    const employeeId = req.user?.employee_id;
    return this.svc.getMyRequests(employeeId);
  }

  @Post("request")
  async submitLeaveRequest(@Request() req: any, @Body() body: any) {
    const employeeId = req.user?.employee_id;
    const { leave_type_id, start_date, end_date, reason } = body;
    return this.svc.submitRequest(
      employeeId,
      leave_type_id,
      start_date,
      end_date,
      reason
    );
  }

  // === Manager/HR Endpoints (Protected) ===

  @Get("pending-requests")
  @UseGuards(RolesGuard)
  @Permissions("manage:leave")
  async getPendingRequests() {
    return this.svc.getPendingRequests();
  }

  @Patch("request/:id/approve")
  @UseGuards(RolesGuard)
  @Permissions("manage:leave")
  async approveLeaveRequest(
    @Param("id") requestId: string,
    @Request() req: any,
    @Body() body: any
  ) {
    const managerId = req.user?.employee_id;
    const { status } = body;
    return this.svc.approveLeaveRequest(
      parseInt(requestId, 10),
      status,
      managerId
    );
  }
}
