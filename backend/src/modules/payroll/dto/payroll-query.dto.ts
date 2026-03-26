import { IsOptional, IsString, IsNumberString } from "class-validator";

export class PayrollQueryDto {
  @IsOptional()
  @IsNumberString()
  month?: string;

  @IsOptional()
  @IsNumberString()
  year?: string;

  @IsOptional()
  @IsNumberString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
