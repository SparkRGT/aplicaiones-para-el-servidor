import { PartialType } from '@nestjs/mapped-types';
import { CreateRecupPrestamoDto } from './create-recup-prestamo.dto';

export class UpdateRecupPrestamoDto extends PartialType(CreateRecupPrestamoDto) {}
