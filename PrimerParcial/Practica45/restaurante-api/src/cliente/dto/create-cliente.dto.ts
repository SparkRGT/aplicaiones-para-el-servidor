import { IsString, IsEmail } from "class-validator";
export class CreateClienteDto {
  @IsString() nombre: string;
  @IsEmail() correo: string;
  @IsString() telefono: string;
}
