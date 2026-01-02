import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { FilaVirtualService } from './fila-virtual.service';
import { CreateFilaVirtualDto } from './dto/create-fila-virtual.dto';
import { UpdateFilaVirtualDto } from './dto/update-fila-virtual.dto';

@Controller('fila-virtual')
export class FilaVirtualController {
  constructor(private readonly service: FilaVirtualService) {}

  @Post()
  create(@Body() dto: CreateFilaVirtualDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFilaVirtualDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
