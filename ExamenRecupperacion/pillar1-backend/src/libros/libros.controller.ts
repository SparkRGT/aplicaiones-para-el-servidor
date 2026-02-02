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
import { LibrosService } from './libros.service';
import { CreateLibroDto } from './dto/create-libro.dto';
import { UpdateLibroDto } from './dto/update-libro.dto';

@Controller('recup-libros')
export class LibrosController {
  constructor(private readonly librosService: LibrosService) {}

  @Post()
  create(@Body() createLibroDto: CreateLibroDto) {
    return this.librosService.create(createLibroDto);
  }

  @Get()
  findAll() {
    return this.librosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.librosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLibroDto: UpdateLibroDto,
  ) {
    return this.librosService.update(id, updateLibroDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.librosService.remove(id);
  }
}
