import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { EmployeesService } from "./employees.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("staff-directory")
@UseGuards(JwtAuthGuard)
export class StaffDirectoryController {
  constructor(private readonly svc: EmployeesService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.svc.findAllPublic(req.user);
  }
}
