import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { TimeKeepingService } from "./timekeeping.service";
import { IPWhitelistGuard } from "./ip-whitelist.guard";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";

@Controller("timekeeping")
export class TimeKeepingController {
  constructor(private readonly svc: TimeKeepingService) {}

  @UseGuards(JwtAuthGuard)
  @Get("dynamic-qr")
  async getDynamicQr(@Req() req: any) {
    const user = req.user;
    if (!user) throw new ForbiddenException("Unauthorized");
    return this.svc.generateDynamicQr();
  }

  @UseGuards(JwtAuthGuard)
  @Post("check-in/qr")
  async checkInQr(@Req() req: any, @Body("payload") payload: string) {
    // req.user should be set by auth
    const user = req.user;
    if (!user) throw new ForbiddenException("Unauthorized");
    // Validate UUID payload from dynamic QR
    return this.svc.recordCheckInByDynamicQr(user.employee_id, payload);
  }

  @UseGuards(JwtAuthGuard, IPWhitelistGuard)
  @Post("check-in/ip")
  async checkInIp(@Req() req: any) {
    const user = req.user;
    if (!user) throw new ForbiddenException("Unauthorized");
    const ip =
      req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress;
    return this.svc.recordCheckInByIP(user.employee_id, ip as string);
  }
}
