import { IsString,IsNumber } from 'class-validator';


export class CreateMesaDto {
  @IsNumber() numero: number;
  @IsNumber() capacidad: number;
  @IsString() estado: string;
}
