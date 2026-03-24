import {
  IsString,
  IsDateString,
  IsDecimal,
  IsEnum,
  IsOptional,
} from "class-validator";
import {
  ViolationStatus,
  ViolationSeverity,
} from "../../../entities/violation.entity";

export class UpdateViolationDto {
  @IsOptional()
  @IsDateString()
  violation_date?: string;

  @IsOptional()
  @IsString()
  violation_type?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  deduction_amount?: any;

  @IsOptional()
  @IsEnum(ViolationSeverity)
  severity?: ViolationSeverity;

  @IsOptional()
  @IsEnum(ViolationStatus)
  status?: ViolationStatus;
}

