import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Orden } from '../entities/orden.entity';
import { EventosProcesado } from '../entities/eventos-procesado.entity';
import { RabbitMQPublisherService } from '../publishers/rabbitmq-publisher.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdenesService {
  constructor(
    @InjectRepository(Orden, 'microservicio_b_db')
    private ordenRepository: Repository<Orden>,
    @InjectRepository(EventosProcesado, 'microservicio_b_db')
    private eventosProcesadosRepository: Repository<EventosProcesado>,
    private rabbitMQPublisher: RabbitMQPublisherService,
  ) {}

  async procesarOrdenSolicitada(evento: any): Promise<Orden> {
    // Verificar idempotencia
    const eventoProcesado = await this.eventosProcesadosRepository.findOne({
      where: { event_id: evento.eventId },
    });

    if (eventoProcesado) {
      console.log(`⚠️ Evento ${evento.eventId} ya fue procesado (idempotencia)`);
      throw new Error('Evento ya procesado');
    }

    // Crear orden
    const orden = this.ordenRepository.create({
      producto_id: evento.data.productoId,
      cantidad: evento.data.cantidad,
      precio_unitario: evento.data.precioUnitario,
      total: evento.data.cantidad * evento.data.precioUnitario,
      estado: 'procesada',
    });

    const ordenGuardada = await this.ordenRepository.save(orden) as unknown as Orden;

    // Marcar evento como procesado
    const eventoProcesadoEntity = this.eventosProcesadosRepository.create({
      event_id: evento.eventId,
      event_type: evento.eventType,
    });
    await this.eventosProcesadosRepository.save(eventoProcesadoEntity);

    // Publicar evento de orden procesada
    await this.rabbitMQPublisher.publicarEvento({
      eventId: uuidv4(),
      eventType: 'orden.procesada',
      source: 'microservicio-b',
      timestamp: new Date().toISOString(),
      data: {
        ordenId: ordenGuardada.id,
        productoId: ordenGuardada.producto_id,
        cantidad: ordenGuardada.cantidad,
        total: ordenGuardada.total,
      },
    });

    console.log(`✅ Orden ${ordenGuardada.id} procesada exitosamente`);

    return ordenGuardada;
  }

  async listar(): Promise<Orden[]> {
    return this.ordenRepository.find();
  }

  async obtener(id: number): Promise<Orden> {
    const orden = await this.ordenRepository.findOne({
      where: { id },
    });

    if (!orden) {
      throw new Error(`Orden con id ${id} no encontrada`);
    }

    return orden;
  }
}

