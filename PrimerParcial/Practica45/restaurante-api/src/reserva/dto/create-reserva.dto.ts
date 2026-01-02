import { IsNumber, IsDateString, IsString } from 'class-validator';

export class CreateReservaDto {
  @IsNumber()
  id_cliente: number;

  @IsNumber()
  id_mesa: number;

  @IsDateString()
  fecha: string;

  @IsDateString()
  hora_inicio: string;

  @IsDateString()
  hora_fin: string;

  @IsString()
  estado: string;
}
