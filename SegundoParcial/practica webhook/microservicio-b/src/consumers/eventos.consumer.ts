import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OrdenesService } from '../services/ordenes.service';

@Controller()
export class EventosConsumer {
  constructor(private readonly ordenesService: OrdenesService) {}

  @EventPattern('orden.solicitada')
  async handleOrdenSolicitada(@Payload() evento: any) {
    console.log(`📨 Evento recibido: orden.solicitada - ${evento.eventId}`);
    
    try {
      await this.ordenesService.procesarOrdenSolicitada(evento);
    } catch (error) {
      console.error(`❌ Error procesando orden solicitada:`, error.message);
      // En producción, aquí se podría implementar Dead Letter Queue
    }
  }

  @EventPattern('producto.*')
  async handleProductoEvent(@Payload() evento: any) {
    console.log(`📨 Evento recibido: ${evento.eventType} - ${evento.eventId}`);
    // Microservicio B puede escuchar eventos de productos si es necesario
  }
}

