import { Controller, BadRequestException } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { ReservaService } from './reserva.service';

@Controller()
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  // Endpoint para validar si la reserva existe
  @MessagePattern('reserva.validar')
  async validarReserva(@Payload() data: any) {
    const reserva = await this.reservaService.obtenerReservaPorId(data.reserva_id);
    return {
      reserva_id: data.reserva_id,
      existe: !!reserva,
    };
  }

  // Endpoint para validar si la mesa existe
  @MessagePattern('mesa.validar')
  async validarMesa(@Payload() data: any) {
    const mesa = await this.reservaService.obtenerMesaPorId(data.mesa_id);
    return {
      mesa_id: data.mesa_id,
      existe: !!mesa,
    };
  }

  // Endpoint para crear una reserva
  @MessagePattern('reserva.crear')
  async crear(@Payload() data: any) {
    return this.reservaService.crearReserva(data);
  }

  // Endpoint para listar reservas
  @MessagePattern('reserva.listar')
  async listar() {
    return this.reservaService.obtenerReservas();
  }

  // Endpoint para obtener reserva por ID
  @MessagePattern('reserva.obtener')
  async obtener(@Payload() data: any) {
    return this.reservaService.obtenerReservaPorId(data.id);
  }

  // Endpoint para crear una mesa
  @MessagePattern('mesa.crear')
  async crearMesa(@Payload() data: any) {
    return this.reservaService.crearMesa(data);
  }

  // Endpoint para listar mesas
  @MessagePattern('mesa.listar')
  async listarMesas() {
    return this.reservaService.obtenerMesas();
  }

  // Endpoint para obtener mesa por ID
  @MessagePattern('mesa.obtener')
  async obtenerMesa(@Payload() data: any) {
    return this.reservaService.obtenerMesaPorId(data.id);
  }

  // Endpoint para crear un cliente
  @MessagePattern('cliente.crear')
  async crearCliente(@Payload() data: any) {
    return this.reservaService.crearCliente(data);
  }

  // Endpoint para listar clientes
  @MessagePattern('cliente.listar')
  async listarClientes() {
    return this.reservaService.obtenerClientes();
  }

  // Endpoint para obtener cliente por ID
  @MessagePattern('cliente.obtener')
  async obtenerCliente(@Payload() data: any) {
    return this.reservaService.obtenerClientePorId(data.id);
  }

  // Event handler para recibir evento de plato creado
  @EventPattern('plato.creado')
  alPlatoCreado(@Payload() data: any) {
    console.log('📢 Evento recibido: plato.creado', data);
    return { procesado: true };
  }
}

