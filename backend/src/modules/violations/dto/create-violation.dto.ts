import {
  IsInt,
  IsString,
  IsDateString,
  IsDecimal,
  IsEnum,
  IsOptional,
} from "class-validator";
import { ViolationStatus } from "../../../entities/violation.entity";

export class CreateViolationDto {
  @IsInt()
  employee_id!: number;

  @IsDateString()
  date!: string;

  @IsString()
  violation_type!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsDecimal()
  penalty_amount?: string;

  @IsOptional()
  @IsEnum(ViolationStatus)
  status?: ViolationStatus;
}

