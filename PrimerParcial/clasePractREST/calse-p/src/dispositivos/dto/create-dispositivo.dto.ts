import { IsNumber, IsString, min } from "class-validator";

export class CreateDispositivoDto {
    @IsString()
    nombre: string
    @IsNumber()
    // @min(1)
    valor: number
    @IsString()
    tipo: string;
    
}
