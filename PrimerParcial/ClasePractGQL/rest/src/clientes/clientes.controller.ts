import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  

  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientesService.findOne(id);
  }

  
}
