import {
  IsString,
  IsDateString,
  IsDecimal,
  IsEnum,
  IsOptional,
} from "class-validator";
import { ViolationStatus } from "../../../entities/violation.entity";

export class UpdateViolationDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  violation_type?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDecimal()
  penalty_amount?: string;

  @IsOptional()
  @IsEnum(ViolationStatus)
  status?: ViolationStatus;
}

