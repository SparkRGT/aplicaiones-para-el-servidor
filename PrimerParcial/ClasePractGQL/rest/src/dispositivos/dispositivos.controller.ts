import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DispositivosService } from './dispositivos.service';
import { CreateDispositivoDto } from './dto/create-dispositivo.dto';
import { UpdateDispositivoDto } from './dto/update-dispositivo.dto';

@Controller('dispositivos')
export class DispositivosController {
  constructor(private readonly dispositivosService: DispositivosService) {}


  @Get()
  findAll() {
    return this.dispositivosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dispositivosService.findOne(id);
  }


}
