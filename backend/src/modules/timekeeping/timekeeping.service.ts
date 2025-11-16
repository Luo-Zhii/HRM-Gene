import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { TimeKeeping } from "../../entities/timekeeping.entity";

@Injectable()
export class TimeKeepingService {
  constructor(/* inject repository */) {}

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
}
