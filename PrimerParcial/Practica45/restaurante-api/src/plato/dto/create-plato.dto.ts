import { IsString, IsNumber,IsBoolean } from "class-validator";
export class CreatePlatoDto {
  @IsString() nombre: string;
  @IsString() descripcion: string;
  @IsNumber() precio: number;
  @IsBoolean() disponible: boolean;
}
