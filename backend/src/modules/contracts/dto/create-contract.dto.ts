import {
  IsString,
  IsEnum,
  IsDateString,
  IsDecimal,
  IsOptional,
  IsInt,
} from "class-validator";
import { ContractType, ContractStatus } from "../../../entities/contract.entity";

export class CreateContractDto {
  @IsInt()
  employee_id!: number;

  @IsString()
  contract_number!: string;

  @IsEnum(ContractType)
  contract_type!: ContractType;

  @IsDateString()
  start_date!: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsEnum(ContractStatus)
  @IsOptional()
  status?: ContractStatus;

  @IsDecimal()
  salary_rate!: string;

  @IsOptional()
  @IsString()
  file_url?: string;
}

