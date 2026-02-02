import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { HistorialPrestamoService } from './historial-prestamo.service';
import { CreateHistorialPrestamoDto } from './dto';

@Controller()
export class HistorialPrestamoController {
  constructor(
    private readonly historialPrestamoService: HistorialPrestamoService,
  ) {}

  @EventPattern('recup_prestamo.estado.cambiado')
  async handleEstadoCambiado(@Payload() data: CreateHistorialPrestamoDto) {
    console.log('Evento recibido: recup_prestamo.estado.cambiado', data);

    await this.historialPrestamoService.registrarCambioEstado({
      prestamoId: data.prestamoId,
      estadoAnterior: data.estadoAnterior,
      estadoNuevo: data.estadoNuevo,
      fechaCambio: data.fechaCambio,
      comentario: data.comentario,
    });

    console.log('Registro de auditoría creado exitosamente');
  }
}
