import { PartialType } from '@nestjs/swagger';
import { CreateFilaVirtualDto } from './create-fila-virtual.dto';

export class UpdateFilaVirtualDto extends PartialType(CreateFilaVirtualDto) {}
