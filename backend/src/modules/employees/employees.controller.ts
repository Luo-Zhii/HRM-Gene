import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
  // UseGuards, // Bỏ comment nếu bạn muốn check quyền
} from "@nestjs/common";
import { EmployeesService } from "./employees.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
// import { JwtAuthGuard } from "../../auth/jwt-auth.guard"; // Import Guard của bạn
// import { RolesGuard } from "../../auth/roles.guard";       // Import Guard check Role/Permission
// import { Roles } from "../../auth/roles.decorator";        // Decorator check quyền

@Controller("employees") // Endpoint sẽ là /employees (hoặc /api/employees nếu có global prefix)
@UseInterceptors(ClassSerializerInterceptor)
// @UseGuards(JwtAuthGuard, RolesGuard) // Bỏ comment để bật bảo mật
export class EmployeesController {
  constructor(private readonly svc: EmployeesService) {}

  @Post()
  // @Roles("manage:employee") // Chỉ người có quyền này mới tạo được nhân viên
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateEmployeeDto) {
    return this.svc.create(dto);
  }

  @Get()
  // @Roles("manage:employee", "manage:system", "manage:payroll") // Các role được xem danh sách
  findAll() {
    // Service đã được update để lấy cả department, position, phone, address
    return this.svc.findAll();
  }

  @Get(":id")
  // @Roles("manage:employee", "manage:system")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(":id")
  // @Roles("manage:employee")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeDto // DTO này phải có field bank_info như Bước 1
  ) {
    // Service sẽ xử lý việc tách bank_info ra để lưu vào bảng riêng
    return this.svc.update(id, dto);
  }

  @Delete(":id")
  // @Roles("manage:employee")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}