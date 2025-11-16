import { Injectable, Inject } from "@nestjs/common";
import { Repository } from "typeorm";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { v4 as uuidv4 } from "uuid";
import { TimeKeeping } from "../../entities/timekeeping.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Employee } from "../../entities/employee.entity";

@Injectable()
export class TimeKeepingService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(TimeKeeping) private tkRepo: Repository<TimeKeeping>,
    @InjectRepository(Employee) private empRepo: Repository<Employee>
  ) {}

  async recordCheckInByQR(employeeId: number, qrPayload: string) {
    // validate payload elsewhere, then record
    const tk = new TimeKeeping();
    tk.employee = { employee_id: employeeId } as any;
    tk.check_in_time = new Date();
    tk.work_date = new Date().toISOString().slice(0, 10);
    tk.status = "Present";
    tk.qr_payload = qrPayload;
    // persist via repository
    return tk;
  }

  async recordCheckInByIP(employeeId: number, ip: string) {
    const tk = new TimeKeeping();
    tk.employee = { employee_id: employeeId } as any;
    tk.check_in_time = new Date();
    tk.work_date = new Date().toISOString().slice(0, 10);
    tk.status = "Present";
    tk.ip_address = ip;
    return tk;
  }

  async generateDynamicQr(): Promise<{ token: string }> {
    const token = uuidv4();
    await this.cacheManager.set(`qr-token-${token}`, true, 100000); // 10 seconds TTL
    return { token: token };
  }
  async recordCheckInByDynamicQr(
    employeeId: number,
    token: string
  ): Promise<TimeKeeping> {
    const isValid = await this.cacheManager.get(`qr-token-${token}`);
    if (!isValid) {
      throw new Error("Invalid or expired QR token");
    }
    // Remove token after use
    await this.cacheManager.del(`qr-token-${token}`);

    // Fetch employee details
    const employee = await this.empRepo.findOne({
      where: { employee_id: employeeId },
    });
    if (!employee) {
      throw new Error("Employee not found");
    }

    const tk = new TimeKeeping();
    tk.employee = employee;
    tk.check_in_time = new Date();
    tk.work_date = new Date().toISOString().slice(0, 10);
    tk.status = "Present";
    tk.qr_payload = token;

    // Save to database
    const savedTk = await this.tkRepo.save(tk);

    // Return with employee details
    return (await this.tkRepo.findOne({
      where: { timekeeping_id: savedTk.timekeeping_id },
      relations: ["employee"],
    })) as TimeKeeping;
  }
}
