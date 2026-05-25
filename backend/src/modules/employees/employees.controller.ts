import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  ParseIntPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from "@nestjs/common";
import { EmployeesService } from "./employees.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { EndpointPermissionsGuard } from "../auth/endpoint-permissions.guard";
import { Public } from "../auth/public.decorator";

@Controller("employees")
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard, EndpointPermissionsGuard)
export class EmployeesController {
  constructor(private readonly svc: EmployeesService) {}

  @Post()
  // @Roles("manage:employee") // Chỉ người có quyền này mới tạo được nhân viên
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateEmployeeDto) {
    return this.svc.create(dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.svc.findAll(req.user);
  }

  /**
   * PUBLIC DIRECTORY ENDPOINT — available to all authenticated users.
   * Returns only safe, work-related fields (no phone, no address).
   * Sensitive filtering is performed at the SERVICE layer, not here.
   */
  @Public()
  @Get("directory")
  findAllPublic(@Req() req: any) {
    return this.svc.findAllPublic(req.user);
  }

  @Public()
  @Get("staff-directory")
  staffDirectory(@Req() req: any) {
    return this.svc.findAllPublic(req.user);
  }

  @Get("search")
  search(@Query("q") q: string, @Req() req: any) {
    if (!q || q.trim().length < 2) return [];
    return this.svc.search(q.trim(), req.user);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
    return this.svc.findOne(id, req.user);
  }

  @Patch(":id/offboard")
  offboard(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeDto,
    @Req() req: any,
  ) {
    return this.svc.update(id, dto, req.user);
  }

  @Patch(":id/onboard")
  onboard(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.svc.onboard(id, req.user);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeDto,
    @Req() req: any,
  ) {
    return this.svc.update(id, dto, req.user);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
    return this.svc.remove(id, req.user);
  }
}