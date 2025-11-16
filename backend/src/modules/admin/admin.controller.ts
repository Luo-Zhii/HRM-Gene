import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Permissions } from "../auth/permissions.decorator";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Permissions("manage:system")
export class AdminController {
  constructor(private readonly svc: AdminService) {}

  // ============= System Settings =============
  @Get("settings")
  async getAllSettings() {
    return this.svc.getAllSettings();
  }

  @Get("settings/:key")
  async getSetting(@Param("key") key: string) {
    return this.svc.getSetting(key);
  }

  @Patch("settings")
  async updateSetting(@Body() body: { key: string; value: string }) {
    return this.svc.updateSetting(body.key, body.value);
  }

  // ============= Department Management =============
  @Get("departments")
  async getAllDepartments() {
    return this.svc.getAllDepartments();
  }

  @Post("departments")
  async createDepartment(@Body() body: { department_name: string }) {
    return this.svc.createDepartment(body.department_name);
  }

  // ============= Position Management =============
  @Get("positions")
  async getAllPositions() {
    return this.svc.getAllPositions();
  }

  @Post("positions")
  async createPosition(@Body() body: { position_name: string }) {
    return this.svc.createPosition(body.position_name);
  }

  // ============= Permission Matrix Management =============
  @Get("permissions/matrix")
  async getPermissionMatrix() {
    return this.svc.getPermissionMatrix();
  }

  @Post("permissions/assign")
  async assignPermission(
    @Body() body: { position_id: number; permission_id: number }
  ) {
    return this.svc.assignPermissionToPosition(
      body.position_id,
      body.permission_id
    );
  }

  @Post("permissions/revoke")
  async revokePermission(
    @Body() body: { position_id: number; permission_id: number }
  ) {
    return this.svc.revokePermissionFromPosition(
      body.position_id,
      body.permission_id
    );
  }
}
