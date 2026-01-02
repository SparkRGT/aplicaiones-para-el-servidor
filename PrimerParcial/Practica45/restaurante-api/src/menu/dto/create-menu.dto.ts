import { IsDateString } from "class-validator";
export class CreateMenuDto {
  @IsDateString() fecha: string;
}
