import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CompanySettings } from "../../entities/company-settings.entity";

@Injectable()
export class IPWhitelistGuard implements CanActivate {
  constructor(
    @InjectRepository(CompanySettings)
    private settingsRepo: Repository<CompanySettings>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    let ip = req.ip;
    if (!ip && req.headers["x-forwarded-for"]) {
      ip = req.headers["x-forwarded-for"].split(",")[0].trim();
    }
    if (!ip) ip = req.connection?.remoteAddress;

    // Allow localhost IPs for development
    const localhostIPs = ["127.0.0.1", "::1", "::ffff:127.0.0.1"];
    if (localhostIPs.includes(ip)) return true;

    // Read COMPANY_IP_WHITELIST from DB
    const setting = await this.settingsRepo.findOneBy({
      key: "COMPANY_IP_WHITELIST",
    });
    const whitelist = setting?.value || "";
    const allowed = whitelist
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (allowed.includes(ip)) return true;
    throw new ForbiddenException("You must check in from the company network.");
  }
}
