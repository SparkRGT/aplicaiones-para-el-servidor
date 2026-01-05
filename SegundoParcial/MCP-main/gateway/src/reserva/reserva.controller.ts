import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ReservaGatewayService } from './reserva.service';
import { MenuGatewayService } from '../menu/menu.service';

@Controller('reservas')
export class ReservaGatewayController {

  constructor(
    private reserva: ReservaGatewayService,
    private menu: MenuGatewayService
  ) {}

  @Post()
  crear(@Body() body: any) {
    return this.reserva.crearReserva(body);
  }

  @Get()
  listar() {
    return this.reserva.listarReservas();
  }

  @Get(':id')
  obtener(@Param('id') id: number) {
    return this.reserva.obtenerReserva(id);
  }

  // Mesas
  @Post('mesas')
  crearMesa(@Body() body: any) {
    return this.reserva.crearMesa(body);
  }

  @Get('mesas')
  listarMesas() {
    return this.reserva.listarMesas();
  }

  @Get('mesas/:id')
  obtenerMesa(@Param('id') id: number) {
    return this.reserva.obtenerMesa(id);
  }

  // Clientes
  @Post('clientes')
  crearCliente(@Body() body: any) {
    return this.reserva.crearCliente(body);
  }

  @Get('clientes')
  listarClientes() {
    return this.reserva.listarClientes();
  }

  @Get('clientes/:id')
  obtenerCliente(@Param('id') id: number) {
    return this.reserva.obtenerCliente(id);
  }
}

