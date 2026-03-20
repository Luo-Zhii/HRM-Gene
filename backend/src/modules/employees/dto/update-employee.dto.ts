import { PartialType } from "@nestjs/mapped-types";
import { CreateEmployeeDto } from "./create-employee.dto";
import { IsOptional, IsObject, IsString, IsBoolean } from "class-validator";

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  // Thêm trường này để Controller nhận được cục data bank_info từ Frontend
  @IsOptional()
  @IsObject()
  bank_info?: {
    bank_name: string;
    account_number: string;
    account_holder_name: string;
  };

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  email_notifications?: boolean;

  @IsOptional()
  @IsBoolean()
  push_notifications?: boolean;

  @IsOptional()
  @IsBoolean()
  task_reminders?: boolean;

  @IsOptional()
  @IsBoolean()
  announcements?: boolean;

  @IsOptional()
  @IsBoolean()
  daily_reports?: boolean;

  @IsOptional()
  @IsBoolean()
  dark_mode?: boolean;

  @IsOptional()
  @IsBoolean()
  two_factor_auth?: boolean;
}