import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { PrestamosService } from './prestamos.service';
import { CreateRecupPrestamoDto } from './dto/create-recup-prestamo.dto';
import { UpdateRecupPrestamoDto } from './dto/update-recup-prestamo.dto';

@Controller('recup-prestamos')
export class PrestamosController {
  constructor(private readonly prestamosService: PrestamosService) {}

  @Post()
  create(@Body() createPrestamoDto: CreateRecupPrestamoDto) {
    return this.prestamosService.create(createPrestamoDto);
  }

  @Get()
  findAll() {
    return this.prestamosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.prestamosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePrestamoDto: UpdateRecupPrestamoDto,
  ) {
    return this.prestamosService.update(id, updatePrestamoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.prestamosService.remove(id);
  }
}
