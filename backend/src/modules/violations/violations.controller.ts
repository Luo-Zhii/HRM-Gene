import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { ViolationsService } from "./violations.service";
import { CreateViolationDto } from "./dto/create-violation.dto";
import { UpdateViolationDto } from "./dto/update-violation.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Permissions } from "../auth/permissions.decorator";

@Controller("violations")
@UseGuards(JwtAuthGuard)
export class ViolationsController {
  constructor(private readonly violationsService: ViolationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Permissions("manage:employees", "manage:system")
  create(@Body() createDto: CreateViolationDto) {
    return this.violationsService.create(createDto);
  }

  @Get()
  async findAll(@Request() req: any, @Query("employeeId") employeeId?: string) {
    const user = req.user;
    const isAdmin =
      user.permissions?.includes("manage:employees") ||
      user.permissions?.includes("manage:system");

    // Admin/HR can filter by employeeId or see all, employees can only see their own
    const targetEmployeeId = isAdmin
      ? employeeId
        ? parseInt(employeeId, 10)
        : undefined
      : user.employee_id;
    return this.violationsService.findAll(targetEmployeeId);
  }

  @Get(":id")
  async findOne(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: any
  ) {
    const user = req.user;
    const isAdmin =
      user.permissions?.includes("manage:employees") ||
      user.permissions?.includes("manage:system");

    // Admin/HR can see any, employees can only see their own
    const employeeId = isAdmin ? undefined : user.employee_id;
    return this.violationsService.findOne(id, employeeId);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Permissions("manage:employees", "manage:system")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDto: UpdateViolationDto
  ) {
    return this.violationsService.update(id, updateDto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Permissions("manage:employees", "manage:system")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.violationsService.remove(id);
  }
}

