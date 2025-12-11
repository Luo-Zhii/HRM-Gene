import {
  Controller,
  Get,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
  Param,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SalaryHistory } from "../../entities/salary-history.entity";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("salary-history")
@UseGuards(JwtAuthGuard)
export class SalaryHistoryController {
  constructor(
    @InjectRepository(SalaryHistory)
    private salaryHistoryRepo: Repository<SalaryHistory>
  ) {}

  @Get()
  async findAll(@Request() req: any, @Query("employeeId") employeeId?: string) {
    const user = req.user;
    const isAdmin =
      user.permissions?.includes("manage:employees") ||
      user.permissions?.includes("manage:system");

    // Admin/HR can see any employee's history, employees can only see their own
    const targetEmployeeId = isAdmin
      ? employeeId
        ? parseInt(employeeId, 10)
        : undefined
      : user.employee_id;

    const where: any = {};
    if (targetEmployeeId) {
      where.employee = { employee_id: targetEmployeeId };
    }

    return this.salaryHistoryRepo.find({
      where,
      relations: ["employee"],
      order: { change_date: "DESC" },
    });
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number, @Request() req: any) {
    const user = req.user;
    const isAdmin =
      user.permissions?.includes("manage:employees") ||
      user.permissions?.includes("manage:system");

    const where: any = { history_id: id };
    if (!isAdmin) {
      where.employee = { employee_id: user.employee_id };
    }

    const history = await this.salaryHistoryRepo.findOne({
      where,
      relations: ["employee"],
    });

    if (!history) {
      throw new NotFoundException("Salary history not found");
    }

    return history;
  }
}

