import { IsEnum, IsOptional } from 'class-validator';
import { ResignationStatus } from '../../../entities/resignation-request.entity';
import { ResignationReason } from '../../../entities/employee.entity';

export class UpdateResignationDto {
  @IsEnum(ResignationStatus)
  status!: ResignationStatus;

  @IsOptional()
  @IsEnum(ResignationReason)
  resignation_category?: ResignationReason;
}
