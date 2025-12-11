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
  Query,
  ParseIntPipe,
} from "@nestjs/common";
import { ContractsService } from "./contracts.service";
import { CreateContractDto } from "./dto/create-contract.dto";
import { UpdateContractDto } from "./dto/update-contract.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Permissions } from "../auth/permissions.decorator";

@Controller("contracts")
@UseGuards(JwtAuthGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Permissions("manage:employees", "manage:system")
  create(@Body() createDto: CreateContractDto) {
    return this.contractsService.create(createDto);
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
    return this.contractsService.findAll(targetEmployeeId);
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
    return this.contractsService.findOne(id, employeeId);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Permissions("manage:employees", "manage:system")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDto: UpdateContractDto
  ) {
    return this.contractsService.update(id, updateDto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Permissions("manage:employees", "manage:system")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.contractsService.remove(id);
  }
}

