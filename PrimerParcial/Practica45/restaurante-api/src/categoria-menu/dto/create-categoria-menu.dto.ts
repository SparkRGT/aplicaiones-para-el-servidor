import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoriaMenuDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;
}
