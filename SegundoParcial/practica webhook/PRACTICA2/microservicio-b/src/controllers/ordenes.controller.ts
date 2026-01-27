import { Controller, Get, Param } from '@nestjs/common';
import { OrdenesService } from '../services/ordenes.service';

@Controller('ordenes')
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  @Get()
  async listar() {
    return this.ordenesService.listar();
  }

  @Get(':id')
  async obtener(@Param('id') id: string) {
    return this.ordenesService.obtener(parseInt(id));
  }
}

