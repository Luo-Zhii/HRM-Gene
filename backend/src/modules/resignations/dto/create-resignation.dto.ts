import { IsString, IsNotEmpty } from 'class-validator';

export class CreateResignationDto {
  @IsNotEmpty()
  @IsString()
  requested_last_day!: string;

  @IsNotEmpty()
  @IsString()
  reason_text!: string;
}
