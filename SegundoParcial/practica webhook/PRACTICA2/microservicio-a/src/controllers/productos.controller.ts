import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ProductosService } from '../services/productos.service';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  async crear(@Body() producto: any) {
    return this.productosService.crear(producto);
  }

  @Get()
  async listar() {
    return this.productosService.listar();
  }

  @Get(':id')
  async obtener(@Param('id') id: string) {
    return this.productosService.obtener(parseInt(id));
  }

  @Put(':id')
  async actualizar(@Param('id') id: string, @Body() producto: any) {
    return this.productosService.actualizar(parseInt(id), producto);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return this.productosService.eliminar(parseInt(id));
  }

  @Post(':id/ordenes')
  async crearOrden(@Param('id') productoId: string, @Body() orden: any) {
    return this.productosService.crearOrden(parseInt(productoId), orden);
  }
}

