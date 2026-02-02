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
import { LectoresService } from './lectores.service';
import { CreateLectorDto } from './dto/create-lector.dto';
import { UpdateLectorDto } from './dto/update-lector.dto';

@Controller('recup-lectores')
export class LectoresController {
  constructor(private readonly lectoresService: LectoresService) {}

  @Post()
  create(@Body() createLectorDto: CreateLectorDto) {
    return this.lectoresService.create(createLectorDto);
  }

  @Get()
  findAll() {
    return this.lectoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lectoresService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLectorDto: UpdateLectorDto,
  ) {
    return this.lectoresService.update(id, updateLectorDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lectoresService.remove(id);
  }
}
