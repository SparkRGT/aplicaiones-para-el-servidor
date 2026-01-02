import { IsString } from "class-validator";
export class CreateRestauranteDto {
  @IsString() nombre: string;
  @IsString() direccion: string;
  @IsString() telefono: string;
}
