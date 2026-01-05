import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { MenuGatewayService } from './menu.service';
import { randomUUID } from 'crypto';

@Controller('menus')
export class MenuGatewayController {

  constructor(private menu: MenuGatewayService) {}

  // Platos
  @Post('platos')
  crearPlato(@Body() body: any) {
    const payload = {
      idempotency_key: randomUUID(),
      ...body
    };
    return this.menu.crearPlato(payload);
  }

  @Get('platos')
  listarPlatos() {
    return this.menu.listarPlatos();
  }

  @Get('platos/:id')
  obtenerPlato(@Param('id') id: number) {
    return this.menu.obtenerPlato(id);
  }

  @Get(':menu_id/platos')
  listarPlatosPorMenu(@Param('menu_id') menu_id: number) {
    return this.menu.listarPlatosPorMenu(menu_id);
  }

  // Menús
  @Post()
  crearMenu(@Body() body: any) {
    return this.menu.crearMenu(body);
  }

  @Get()
  listarMenus() {
    return this.menu.listarMenus();
  }

  @Get(':id')
  obtenerMenu(@Param('id') id: number) {
    return this.menu.obtenerMenu(id);
  }

  // Categorías
  @Post('categorias')
  crearCategoria(@Body() body: any) {
    return this.menu.crearCategoria(body);
  }

  @Get('categorias')
  listarCategorias() {
    return this.menu.listarCategorias();
  }

  @Get('categorias/:id')
  obtenerCategoria(@Param('id') id: number) {
    return this.menu.obtenerCategoria(id);
  }
}

