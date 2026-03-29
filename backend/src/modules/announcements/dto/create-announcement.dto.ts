import { IsString, IsArray, IsOptional, IsDateString } from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsString()
  type!: string;

  @IsString()
  target_audience!: string;

  @IsString()
  priority!: string;

  @IsString()
  status!: string;

  @IsOptional()
  @IsArray()
  delivery_methods?: string[];

  @IsOptional()
  @IsDateString()
  scheduled_at?: string;
}
