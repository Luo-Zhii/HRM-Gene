import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { Repository, DataSource, Between } from "typeorm";
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
    @InjectRepository(Employee) private empRepo: Repository<Employee>,
    private dataSource: DataSource
  ) {}

  /**
   * Get today's date range in UTC (00:00:00 to 23:59:59)
   */
  private getTodayRange(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
    );
    const end = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
        999
      )
    );
    return { start, end };
  }

  /**
   * Check if last action was within debounce period (1 minute)
   */
  private async checkDebounce(
    employeeId: number,
    actionType: "check_in" | "check_out"
  ): Promise<void> {
    const cacheKey = `timekeeping-debounce-${employeeId}-${actionType}`;
    const lastAction = await this.cacheManager.get<number>(cacheKey);

    if (lastAction) {
      const timeSinceLastAction = Date.now() - lastAction;
      const debouncePeriod = 60 * 1000; // 1 minute in milliseconds

      if (timeSinceLastAction < debouncePeriod) {
        const remainingSeconds = Math.ceil(
          (debouncePeriod - timeSinceLastAction) / 1000
        );
        throw new BadRequestException(
          `Too many requests. Please wait ${remainingSeconds} seconds before scanning again.`
        );
      }
    }

    // Set debounce cache (expires in 2 minutes)
    await this.cacheManager.set(cacheKey, Date.now(), 120000);
  }

  /**
   * Calculate hours worked between two timestamps
   */
  private calculateHours(checkIn: Date, checkOut: Date): number {
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const diffHours = diffMs / (1000 * 60 * 60); // Convert to hours
    return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Intelligent check-in/check-out logic for QR scanning
   */
  async recordCheckInByDynamicQr(
    employeeId: number,
    token: string
  ): Promise<{
    status: "CHECK_IN" | "CHECK_OUT";
    time: Date;
    duration?: number;
    message: string;
    timekeeping_id: number;
  }> {
    // Validate QR token
    const isValid = await this.cacheManager.get(`qr-token-${token}`);
    if (!isValid) {
      throw new BadRequestException("Invalid or expired QR token");
    }
    // Remove token after use
    await this.cacheManager.del(`qr-token-${token}`);

    // Fetch employee details
    const employee = await this.empRepo.findOne({
      where: { employee_id: employeeId },
    });
    if (!employee) {
      throw new NotFoundException("Employee not found");
    }

    // Use transaction for atomicity
    return await this.dataSource.transaction(async (manager) => {
      const tkRepo = manager.getRepository(TimeKeeping);
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const { start, end } = this.getTodayRange();

      // Fetch today's latest record
      const latestRecord = await tkRepo.findOne({
        where: {
          employee: { employee_id: employeeId },
          check_in_time: Between(start, end),
        },
        order: { check_in_time: "DESC" },
        relations: ["employee"],
      });

      // CASE 1: Check-IN
      // No record exists OR latest record has check_out_time (previous shift finished)
      if (!latestRecord || latestRecord.check_out_time) {
        // Check debounce for check-in
        await this.checkDebounce(employeeId, "check_in");

        // Create new check-in record
        const newRecord = tkRepo.create({
          employee: employee,
          check_in_time: now,
          work_date: today,
          check_out_time: undefined,
          hours_worked: 0,
          status: "Present",
          qr_payload: token,
        });

        const saved = await tkRepo.save(newRecord);

        return {
          status: "CHECK_IN",
          time: now,
          message: "Good morning! Checked in successfully.",
          timekeeping_id: saved.timekeeping_id,
        };
      }

      // CASE 2: Check-OUT
      // Record exists and check_out_time is NULL (currently working)
      if (latestRecord && !latestRecord.check_out_time) {
        // Check debounce for check-out
        await this.checkDebounce(employeeId, "check_out");

        // Update existing record with check-out
        latestRecord.check_out_time = now;
        latestRecord.hours_worked = this.calculateHours(
          latestRecord.check_in_time,
          now
        );

        // Update status based on hours worked
        if (latestRecord.hours_worked >= 8) {
          latestRecord.status = "Present";
        } else if (latestRecord.hours_worked >= 4) {
          latestRecord.status = "Half-day";
        } else {
          latestRecord.status = "Present"; // Still count as present even if short
        }

        const updated = await tkRepo.save(latestRecord);

        return {
          status: "CHECK_OUT",
          time: now,
          duration: updated.hours_worked,
          message: "Checked out. See you tomorrow!",
          timekeeping_id: updated.timekeeping_id,
        };
      }

      // Fallback (should not reach here)
      throw new BadRequestException("Unable to process timekeeping record");
    });
  }

  /**
   * Intelligent check-in/check-out logic for IP-based check-in
   */
  async recordCheckInByIP(
    employeeId: number,
    ip: string
  ): Promise<{
    status: "CHECK_IN" | "CHECK_OUT";
    time: Date;
    duration?: number;
    message: string;
    timekeeping_id: number;
  }> {
    // Fetch employee details
    const employee = await this.empRepo.findOne({
      where: { employee_id: employeeId },
    });
    if (!employee) {
      throw new NotFoundException("Employee not found");
    }

    // Use transaction for atomicity
    return await this.dataSource.transaction(async (manager) => {
      const tkRepo = manager.getRepository(TimeKeeping);
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const { start, end } = this.getTodayRange();

      // Fetch today's latest record
      const latestRecord = await tkRepo.findOne({
        where: {
          employee: { employee_id: employeeId },
          check_in_time: Between(start, end),
        },
        order: { check_in_time: "DESC" },
        relations: ["employee"],
      });

      // CASE 1: Check-IN
      if (!latestRecord || latestRecord.check_out_time) {
        // Check debounce for check-in
        await this.checkDebounce(employeeId, "check_in");

        // Create new check-in record
        const newRecord = tkRepo.create({
          employee: employee,
          check_in_time: now,
          work_date: today,
          check_out_time: undefined,
          hours_worked: 0,
          status: "Present",
          ip_address: ip,
        });

        const saved = await tkRepo.save(newRecord);

        return {
          status: "CHECK_IN",
          time: now,
          message: "Good morning! Checked in successfully.",
          timekeeping_id: saved.timekeeping_id,
        };
      }

      // CASE 2: Check-OUT
      if (latestRecord && !latestRecord.check_out_time) {
        // Check debounce for check-out
        await this.checkDebounce(employeeId, "check_out");

        // Update existing record with check-out
        latestRecord.check_out_time = now;
        latestRecord.hours_worked = this.calculateHours(
          latestRecord.check_in_time,
          now
        );

        // Update status based on hours worked
        if (latestRecord.hours_worked >= 8) {
          latestRecord.status = "Present";
        } else if (latestRecord.hours_worked >= 4) {
          latestRecord.status = "Half-day";
        } else {
          latestRecord.status = "Present";
        }

        const updated = await tkRepo.save(latestRecord);

        return {
          status: "CHECK_OUT",
          time: now,
          duration: updated.hours_worked,
          message: "Checked out. See you tomorrow!",
          timekeeping_id: updated.timekeeping_id,
        };
      }

      // Fallback
      throw new BadRequestException("Unable to process timekeeping record");
    });
  }

  async recordCheckInByQR(employeeId: number, qrPayload: string) {
    // Legacy method - redirect to dynamic QR logic
    return this.recordCheckInByDynamicQr(employeeId, qrPayload);
  }

  async generateDynamicQr(): Promise<{ token: string }> {
    const token = uuidv4();
    await this.cacheManager.set(`qr-token-${token}`, true, 10000); // 10 seconds TTL
    return { token: token };
  }

  /**
   * Admin/HR: Get all attendance records with employee info
   */
  async getAllForAdmin(
    page: number,
    limit: number,
    startDate?: string,
    endDate?: string
  ): Promise<{
    data: TimeKeeping[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const parseDateOnly = (value?: string): Date | undefined => {
      if (!value) return undefined;
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return undefined;
      return new Date(
        Date.UTC(
          parsed.getUTCFullYear(),
          parsed.getUTCMonth(),
          parsed.getUTCDate()
        )
      );
    };

    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);

    let rangeStart: Date;
    let rangeEnd: Date;

    if (start && end) {
      rangeStart = start;
      rangeEnd = end;
    } else if (start && !end) {
      // Single day filter
      rangeStart = start;
      rangeEnd = start;
    } else {
      // Default to last 30 days to avoid over-fetching
      const now = new Date();
      rangeEnd = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
      );
      rangeStart = new Date(rangeEnd);
      rangeStart.setUTCDate(rangeStart.getUTCDate() - 29);
    }

    const rangeStartStr = rangeStart.toISOString().slice(0, 10);
    const rangeEndStr = rangeEnd.toISOString().slice(0, 10);

    const [items, total] = await this.tkRepo
      .createQueryBuilder("tk")
      .leftJoinAndSelect("tk.employee", "employee")
      .where("tk.work_date BETWEEN :start AND :end", {
        start: rangeStartStr,
        end: rangeEndStr,
      })
      .orderBy("tk.work_date", "DESC")
      .addOrderBy("tk.check_in_time", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.max(1, Math.ceil(total / limit) || 1);

    return {
      data: items,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
