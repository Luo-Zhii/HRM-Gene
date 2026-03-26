import { IsString, IsOptional, IsEnum, IsNumber, IsArray, ValidateNested, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { KpiUnit } from "../../../entities/kpi-library.entity";

export class CreateKpiLibraryDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  calculation_formula?: string;

  @IsEnum(KpiUnit)
  unit!: KpiUnit;
}

export class CreateKpiPeriodDto {
  @IsString()
  name!: string;

  @IsString()
  start_date!: string;

  @IsString()
  end_date!: string;
}

export class KpiAssignmentDto {
  @IsNumber()
  kpi_library_id!: number;

  @IsNumber()
  target_value!: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  weight!: number;
}

export class AssignKpisDto {
  @IsNumber()
  employee_id!: number;

  @IsNumber()
  period_id!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KpiAssignmentDto)
  assignments!: KpiAssignmentDto[];
}

export class UpdateActualValueDto {
  @IsNumber()
  actual_value!: number;
}

export class ApproveAssignmentDto {
  @IsNumber()
  manager_score!: number;
}
