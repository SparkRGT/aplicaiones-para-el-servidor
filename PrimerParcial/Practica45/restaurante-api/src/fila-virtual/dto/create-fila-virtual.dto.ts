import { IsNumber, IsDateString, IsString } from 'class-validator';

export class CreateFilaVirtualDto {
  @IsNumber()
  id_cliente: number;

  @IsDateString()
  fecha_hora_ingreso: string;

  @IsString()
  estado: string;
}
