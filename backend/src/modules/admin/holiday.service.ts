import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { PublicHoliday } from "../../entities/public-holiday.entity";

@Injectable()
export class HolidayService {
  constructor(
    @InjectRepository(PublicHoliday)
    private holidayRepo: Repository<PublicHoliday>,
  ) {}

  // Get all holidays, optionally filter by year
  async getAllHolidays(year?: number) {
    if (year) {
      return this.holidayRepo.find({
        where: { year },
        order: { date: "ASC" },
      });
    }
    return this.holidayRepo.find({ order: { date: "ASC" } });
  }

  // Get holidays for current year + next year (for leave validation)
  async getUpcomingHolidays() {
    const currentYear = new Date().getFullYear();
    return this.holidayRepo.find({
      where: [{ year: currentYear }, { year: currentYear + 1 }],
      order: { date: "ASC" },
    });
  }

  // Create a holiday
  async createHoliday(data: {
    name: string;
    date: string;
    end_date?: string;
    type?: string;
    description?: string;
    is_recurring?: boolean;
    year?: number;
  }) {
    if (!data.name || !data.date) {
      throw new BadRequestException("Name and date are required");
    }

    const year = data.year || parseInt(data.date.split("-")[0]);

    const holiday = this.holidayRepo.create({
      name: data.name,
      date: data.date,
      end_date: data.end_date,
      type: data.type || "national",
      description: data.description,
      is_recurring: data.is_recurring ?? true,
      year,
    });

    return this.holidayRepo.save(holiday);
  }

  // Update a holiday
  async updateHoliday(id: number, data: Partial<{
    name: string;
    date: string;
    end_date: string;
    type: string;
    description: string;
    is_recurring: boolean;
    year: number;
  }>) {
    const holiday = await this.holidayRepo.findOne({ where: { id } });
    if (!holiday) throw new NotFoundException(`Holiday #${id} not found`);

    Object.assign(holiday, data);

    // Re-calculate year from date if date changed
    if (data.date) {
      holiday.year = parseInt(data.date.split("-")[0]);
    }

    return this.holidayRepo.save(holiday);
  }

  // Delete a holiday
  async deleteHoliday(id: number) {
    const holiday = await this.holidayRepo.findOne({ where: { id } });
    if (!holiday) throw new NotFoundException(`Holiday #${id} not found`);

    await this.holidayRepo.remove(holiday);
    return { message: "Holiday deleted successfully" };
  }

  // Bulk create - seed Vietnamese national holidays for a year
  async seedVietnameseHolidays(year: number) {
    const vietnameseHolidays = [
      { name: "New Year's Day (Tết Dương Lịch)", date: `${year}-01-01`, type: "national", is_recurring: true },
      { name: "Lunar New Year Eve (Tất Niên)", date: `${year}-01-28`, type: "national", is_recurring: false },
      { name: "Lunar New Year Day 1 (Mùng 1 Tết)", date: `${year}-01-29`, type: "national", is_recurring: false },
      { name: "Lunar New Year Day 2 (Mùng 2 Tết)", date: `${year}-01-30`, type: "national", is_recurring: false },
      { name: "Lunar New Year Day 3 (Mùng 3 Tết)", date: `${year}-01-31`, type: "national", is_recurring: false },
      { name: "Lunar New Year Day 4 (Mùng 4 Tết)", date: `${year}-02-01`, type: "national", is_recurring: false },
      { name: "Lunar New Year Day 5 (Mùng 5 Tết)", date: `${year}-02-02`, type: "national", is_recurring: false },
      { name: "Hung Kings Festival (Giỗ Tổ Hùng Vương)", date: `${year}-04-07`, type: "national", is_recurring: false, description: "10th day of 3rd lunar month" },
      { name: "Liberation Day (Ngày Giải Phóng)", date: `${year}-04-30`, type: "national", is_recurring: true },
      { name: "Labour Day (Ngày Quốc tế Lao động)", date: `${year}-05-01`, type: "national", is_recurring: true },
      { name: "National Day (Quốc Khánh)", date: `${year}-09-02`, type: "national", is_recurring: true },
      { name: "National Day Holiday", date: `${year}-09-03`, type: "national", is_recurring: false },
    ];

    const results = [];
    for (const h of vietnameseHolidays) {
      const existing = await this.holidayRepo.findOne({
        where: { date: h.date, name: h.name }
      });
      if (!existing) {
        const holiday = this.holidayRepo.create({ ...h, year });
        results.push(await this.holidayRepo.save(holiday));
      }
    }

    return {
      message: `Seeded ${results.length} Vietnamese holidays for ${year}`,
      seeded: results.length,
      skipped: vietnameseHolidays.length - results.length,
    };
  }

  // Get holiday stats
  async getStats() {
    const currentYear = new Date().getFullYear();
    const total = await this.holidayRepo.count({ where: { year: currentYear } });
    const national = await this.holidayRepo.count({ where: { year: currentYear, type: "national" } });
    const company = await this.holidayRepo.count({ where: { year: currentYear, type: "company" } });
    const optional = await this.holidayRepo.count({ where: { year: currentYear, type: "optional" } });

    return { total, national, company, optional, year: currentYear };
  }
}
