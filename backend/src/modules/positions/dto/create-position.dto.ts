import { IsNotEmpty, IsString } from "class-validator";

export class CreatePositionDto {
  @IsString()
  @IsNotEmpty()
  position_name!: string;
}
