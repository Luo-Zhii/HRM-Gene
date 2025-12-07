import {
  IsString,
  IsEnum,
  IsDateString,
  IsDecimal,
  IsOptional,
} from "class-validator";
import { ContractType, ContractStatus } from "../../../entities/contract.entity";

export class UpdateContractDto {
  @IsOptional()
  @IsString()
  contract_number?: string;

  @IsOptional()
  @IsEnum(ContractType)
  contract_type?: ContractType;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @IsOptional()
  @IsDecimal()
  salary_rate?: string;

  @IsOptional()
  @IsString()
  file_url?: string;
}

