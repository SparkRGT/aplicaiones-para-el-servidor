import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaMenuDto } from './create-categoria-menu.dto';

export class UpdateCategoriaMenuDto extends 
PartialType(CreateCategoriaMenuDto) {}
