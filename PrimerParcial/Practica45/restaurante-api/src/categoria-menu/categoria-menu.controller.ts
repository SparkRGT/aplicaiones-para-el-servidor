import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { CategoriaMenuService } from './categoria-menu.service';
import { CreateCategoriaMenuDto } from './dto/create-categoria-menu.dto';
import { UpdateCategoriaMenuDto } from './dto/update-categoria-menu.dto';

@Controller('categoria-menu')
export class CategoriaMenuController {
  constructor(private readonly service: CategoriaMenuService) {}

  @Post()
  create(@Body() dto: CreateCategoriaMenuDto) {
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoriaMenuDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
