import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
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

  // ============= Organization Management =============
  @Get("organization/stats")
  async getOrganizationStats() {
    return this.svc.getOrganizationStats();
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

  @Put("departments/:id")
  async updateDepartment(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { department_name: string; manager_id: number | null }
  ) {
    return this.svc.updateDepartment(id, body.department_name, body.manager_id);
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

  // ============= Employee Management =============
  @Get("employees")
  async getAllEmployees() {
    return this.svc.getAllEmployees();
  }

  @Get("employees/basic")
  async getBasicEmployees() {
    return this.svc.getBasicEmployees();
  }

  @Put("employees/:id/transfer")
  async transferEmployee(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { department_id: number; position_id: number }
  ) {
    return this.svc.transferEmployee(id, body.department_id, body.position_id);
  }

  // ============= Seed Demo Data =============
  @Post("seed/demo-data")
  async seedDemoData(@Body() body?: { employee_id?: number }) {
    return this.svc.seedDemoData(body?.employee_id);
  }
}
