import { Controller, BadRequestException } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { ServicioService } from './servicio.service';

@Controller()
export class ServicioController {
  constructor(private readonly servicioService: ServicioService) {}

  // Endpoint para validar si el servicio existe (idempotente)
  @MessagePattern('servicio.validar')
  async validarServicio(@Payload() data: any) {
    // Usar obtenerServicioPorId para determinar existencia (más compatible con el servicio)
    const servicio = await this.servicioService.obtenerServicioPorId(data.servicio_id);

    return {
      servicio_id: data.servicio_id,
      existe: !!servicio,
    };
  }

  // Endpoint para crear un servicio (idempotente)
  @MessagePattern('servicio.crear')
  async crear(@Payload() data: any) {
    // The service now builds its own idempotency key (or you can include it in payload)
    return this.servicioService.crearServicio(data);
  }

  // Endpoint para listar servicios
  @MessagePattern('servicio.listar')
  async listar() {
    return this.servicioService.obtenerServicios();
  }

  // Endpoint para obtener servicio por ID
  @MessagePattern('servicio.obtener')
  async obtener(@Payload() data: any) {
    return this.servicioService.obtenerServicioPorId(data.id);
  }

  // Event handler para recibir evento de comentario creado
  @EventPattern('comentario.creado')
  alComentarioCreado(@Payload() data: any) {
    // Aquí puedes manejar eventos relacionados a comentario
    console.log('📢 Evento recibido: comentario.creado', data);
    return { procesado: true };
  }
}
