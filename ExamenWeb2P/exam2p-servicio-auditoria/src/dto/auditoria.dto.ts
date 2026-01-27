import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export class CreateAuditoriaDto {
  @IsString()
  exam2p_entidad: string;

  @IsNumber()
  exam2p_registroAfectadoId: number;

  @IsIn(['CREAR', 'MODIFICAR', 'ELIMINAR'])
  exam2p_accion: 'CREAR' | 'MODIFICAR' | 'ELIMINAR';

  @IsOptional()
  @IsString()
  exam2p_detalle?: string;
}

export class RegistroEliminadoEventDto {
  @IsString()
  entidad: string;

  @IsNumber()
  registroId: number;

  @IsOptional()
  @IsString()
  detalle?: string;

  @IsOptional()
  timestamp?: Date;
}
