import {
  IsInt,
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

export class CreateViolationDto {
  @IsInt()
  employee_id!: number;

  @IsDateString()
  violation_date!: string;

  @IsString()
  violation_type!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsDecimal()
  deduction_amount?: string;

  @IsOptional()
  @IsEnum(ViolationSeverity)
  severity?: ViolationSeverity;

  @IsOptional()
  @IsEnum(ViolationStatus)
  status?: ViolationStatus;
}

