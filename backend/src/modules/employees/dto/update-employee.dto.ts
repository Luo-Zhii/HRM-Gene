import { PartialType } from "@nestjs/mapped-types";
import { CreateEmployeeDto } from "./create-employee.dto";
import { IsOptional, IsObject } from "class-validator";

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  // Thêm trường này để Controller nhận được cục data bank_info từ Frontend
  @IsOptional()
  @IsObject()
  bank_info?: {
    bank_name: string;
    account_number: string;
    account_holder_name: string;
  };
}