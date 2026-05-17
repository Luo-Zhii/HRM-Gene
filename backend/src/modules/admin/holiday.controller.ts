import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { HolidayService } from "./holiday.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { EndpointPermissionsGuard } from "../auth/endpoint-permissions.guard";

@Controller("admin/holidays")
@UseGuards(JwtAuthGuard, EndpointPermissionsGuard)
export class HolidayController {
  constructor(private readonly svc: HolidayService) {}

  @Get()
  async getAllHolidays(@Query("year") year?: string) {
    return this.svc.getAllHolidays(year ? parseInt(year) : undefined);
  }

  @Get("upcoming")
  async getUpcomingHolidays() {
    return this.svc.getUpcomingHolidays();
  }

  @Get("stats")
  async getStats() {
    return this.svc.getStats();
  }

  @Post()
  async createHoliday(@Body() body: {
    name: string;
    date: string;
    end_date?: string;
    type?: string;
    description?: string;
    is_recurring?: boolean;
    year?: number;
  }) {
    return this.svc.createHoliday(body);
  }

  @Put(":id")
  async updateHoliday(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.svc.updateHoliday(id, body);
  }

  @Delete(":id")
  async deleteHoliday(@Param("id", ParseIntPipe) id: number) {
    return this.svc.deleteHoliday(id);
  }

  @Post("seed/vietnam/:year")
  async seedVietnameseHolidays(@Param("year", ParseIntPipe) year: number) {
    return this.svc.seedVietnameseHolidays(year);
  }
}
