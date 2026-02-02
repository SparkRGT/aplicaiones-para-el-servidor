import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Recup_Prestamo } from './entities/recup_prestamo.entity';
import { CreateRecupPrestamoDto } from './dto/create-recup-prestamo.dto';
import { UpdateRecupPrestamoDto } from './dto/update-recup-prestamo.dto';

@Injectable()
export class PrestamosService {
  private readonly logger = new Logger(PrestamosService.name);
  private readonly N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/recup_prestamo.notificacion';

  constructor(
    @InjectRepository(Recup_Prestamo)
    private readonly prestamoRepository: Repository<Recup_Prestamo>,
    @Inject('AUDIT_SERVICE')
    private readonly auditClient: ClientProxy,
  ) {}

  /**
   * Envía notificación al webhook de n8n cuando cambia el estado de un préstamo
   * Evento: recup_prestamo.notificacion
   */
  private async sendN8nWebhook(payload: {
    prestamoId: number;
    recup_codigo: string;
    estadoAnterior: string | null;
    estadoNuevo: string;
    lector: {
      recup_nombreCompleto: string;
      recup_email: string;
      recup_telefono: string;
    };
    libro: {
      recup_titulo: string;
      recup_autor: string;
    };
    recup_fechaPrestamo: Date;
    recup_fechaDevolucion: Date;
    fechaCambio: Date;
  }): Promise<void> {
    try {
      const response = await fetch(this.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        this.logger.log(`Webhook recup_prestamo.notificacion enviado exitosamente para préstamo ${payload.prestamoId}`);
      } else {
        this.logger.warn(`Webhook n8n respondió con status ${response.status}`);
      }
    } catch (error) {
      this.logger.error(`Error al enviar webhook a n8n: ${error.message}`);
    }
  }

  async create(createPrestamoDto: CreateRecupPrestamoDto): Promise<Recup_Prestamo> {
    const prestamo = this.prestamoRepository.create(createPrestamoDto);
    const saved = await this.prestamoRepository.save(prestamo);

    // Cargar relaciones para el webhook
    const prestamoConRelaciones = await this.findOne(saved.prestamoId);

    // Emitir evento de creación (estado inicial) a RabbitMQ para auditoría
    this.auditClient.emit('recup_prestamo.estado-cambiado', {
      prestamoId: saved.prestamoId,
      estadoAnterior: null,
      estadoNuevo: saved.recup_estado || 'SOLICITADO',
      fechaCambio: new Date(),
      comentario: 'Préstamo creado',
    });

    // Enviar notificación a n8n webhook (recup_prestamo.notificacion)
    await this.sendN8nWebhook({
      prestamoId: saved.prestamoId,
      recup_codigo: saved.recup_codigo,
      estadoAnterior: null,
      estadoNuevo: saved.recup_estado || 'SOLICITADO',
      lector: {
        recup_nombreCompleto: prestamoConRelaciones.lector?.recup_nombreCompleto || '',
        recup_email: prestamoConRelaciones.lector?.recup_email || '',
        recup_telefono: prestamoConRelaciones.lector?.recup_telefono || '',
      },
      libro: {
        recup_titulo: prestamoConRelaciones.libro?.recup_titulo || '',
        recup_autor: prestamoConRelaciones.libro?.recup_autor || '',
      },
      recup_fechaPrestamo: saved.recup_fechaPrestamo,
      recup_fechaDevolucion: saved.recup_fechaDevolucion,
      fechaCambio: new Date(),
    });

    return saved;
  }

  async findAll(): Promise<Recup_Prestamo[]> {
    return await this.prestamoRepository.find({
      relations: ['lector', 'libro'],
    });
  }

  async findOne(id: number): Promise<Recup_Prestamo> {
    const prestamo = await this.prestamoRepository.findOne({
      where: { prestamoId: id },
      relations: ['lector', 'libro'],
    });
    if (!prestamo) {
      throw new NotFoundException(`Recup_Prestamo con ID ${id} no encontrado`);
    }
    return prestamo;
  }

  async update(id: number, updatePrestamoDto: UpdateRecupPrestamoDto): Promise<Recup_Prestamo> {
    const prestamo = await this.findOne(id);
    const estadoAnterior = prestamo.recup_estado;

    Object.assign(prestamo, updatePrestamoDto);
    const updated = await this.prestamoRepository.save(prestamo);

    // Si el estado cambió, emitir eventos
    if (updatePrestamoDto.recup_estado && estadoAnterior !== updatePrestamoDto.recup_estado) {
      // Cargar relaciones para el webhook
      const prestamoConRelaciones = await this.findOne(updated.prestamoId);

      // Emitir evento a RabbitMQ para auditoría (recup_prestamo.estado-cambiado)
      this.auditClient.emit('recup_prestamo.estado-cambiado', {
        prestamoId: updated.prestamoId,
        estadoAnterior: estadoAnterior,
        estadoNuevo: updatePrestamoDto.recup_estado,
        fechaCambio: new Date(),
        comentario: `Estado cambiado de ${estadoAnterior} a ${updatePrestamoDto.recup_estado}`,
      });

      // Enviar notificación a n8n webhook (recup_prestamo.notificacion)
      await this.sendN8nWebhook({
        prestamoId: updated.prestamoId,
        recup_codigo: updated.recup_codigo,
        estadoAnterior: estadoAnterior,
        estadoNuevo: updatePrestamoDto.recup_estado,
        lector: {
          recup_nombreCompleto: prestamoConRelaciones.lector?.recup_nombreCompleto || '',
          recup_email: prestamoConRelaciones.lector?.recup_email || '',
          recup_telefono: prestamoConRelaciones.lector?.recup_telefono || '',
        },
        libro: {
          recup_titulo: prestamoConRelaciones.libro?.recup_titulo || '',
          recup_autor: prestamoConRelaciones.libro?.recup_autor || '',
        },
        recup_fechaPrestamo: updated.recup_fechaPrestamo,
        recup_fechaDevolucion: updated.recup_fechaDevolucion,
        fechaCambio: new Date(),
      });
    }

    return updated;
  }

  async remove(id: number): Promise<void> {
    const prestamo = await this.findOne(id);
    await this.prestamoRepository.remove(prestamo);
  }
}
