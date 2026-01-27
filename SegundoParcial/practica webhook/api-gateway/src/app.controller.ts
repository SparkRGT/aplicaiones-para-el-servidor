import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  health() {
    return { status: 'ok', service: 'api-gateway' };
  }

  @Post('microservicio-a/productos')
  async crearProducto(@Body() producto: any) {
    return this.appService.crearProducto(producto);
  }

  @Get('microservicio-a/productos')
  async listarProductos() {
    return this.appService.listarProductos();
  }

  @Get('microservicio-a/productos/:id')
  async obtenerProducto(@Param('id') id: string) {
    return this.appService.obtenerProducto(id);
  }

  @Post('microservicio-a/productos/:id/ordenes')
  async crearOrden(@Param('id') productoId: string, @Body() orden: any) {
    return this.appService.crearOrden(productoId, orden);
  }
}

