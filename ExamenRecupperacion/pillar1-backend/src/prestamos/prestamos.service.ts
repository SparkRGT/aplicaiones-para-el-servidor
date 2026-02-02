import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Recup_Prestamo } from './entities/recup_prestamo.entity';
import { CreateRecupPrestamoDto } from './dto/create-recup-prestamo.dto';
import { UpdateRecupPrestamoDto } from './dto/update-recup-prestamo.dto';

@Injectable()
export class PrestamosService {
  private readonly logger = new Logger(PrestamosService.name);
  private readonly n8nWebhookUrl: string;

  constructor(
    @InjectRepository(Recup_Prestamo)
    private readonly prestamoRepository: Repository<Recup_Prestamo>,
    @Inject('AUDIT_SERVICE')
    private readonly auditClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {
    this.n8nWebhookUrl = this.configService.get<string>('N8N_WEBHOOK_URL') || 'http://localhost:5678/webhook/recup_prestamo.notificacion';
  }

  /**
   * Envía webhook a n8n para notificación de cambio de estado
   * Evento: recup_prestamo.notificacion
   */
  private async sendWebhookToN8n(prestamo: Recup_Prestamo, estadoAnterior: string, estadoNuevo: string): Promise<void> {
    try {
      const payload = {
        evento: 'recup_prestamo.estado-cambiado',
        prestamoId: prestamo.prestamoId,
        recup_codigo: prestamo.recup_codigo,
        estadoAnterior,
        estadoNuevo,
        fechaCambio: new Date().toISOString(),
        lector: prestamo.lector ? {
          lectorId: prestamo.lector.lectorId,
          recup_nombreCompleto: prestamo.lector.recup_nombreCompleto,
          recup_email: prestamo.lector.recup_email,
          recup_tipoLector: prestamo.lector.recup_tipoLector,
        } : null,
        libro: prestamo.libro ? {
          libroId: prestamo.libro.libroId,
          recup_titulo: prestamo.libro.recup_titulo,
          recup_autor: prestamo.libro.recup_autor,
          recup_isbn: prestamo.libro.recup_isbn,
        } : null,
      };

      const response = await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        this.logger.log(`Webhook enviado exitosamente a n8n para préstamo ${prestamo.prestamoId}`);
      } else {
        this.logger.warn(`Webhook a n8n respondió con status ${response.status}`);
      }
    } catch (error) {
      this.logger.error(`Error enviando webhook a n8n: ${error.message}`);
      // No lanzamos el error para no afectar la operación principal
    }
  }

  async create(createPrestamoDto: CreateRecupPrestamoDto): Promise<Recup_Prestamo> {
    const prestamo = this.prestamoRepository.create(createPrestamoDto);
    const saved = await this.prestamoRepository.save(prestamo);

    // Cargar relaciones para el webhook
    const prestamoConRelaciones = await this.findOne(saved.prestamoId);

    // Emitir evento de creación (estado inicial) a RabbitMQ
    this.auditClient.emit('recup_prestamo.estado-cambiado', {
      prestamoId: saved.prestamoId,
      estadoAnterior: null,
      estadoNuevo: saved.recup_estado || 'SOLICITADO',
      fechaCambio: new Date(),
      comentario: 'Préstamo creado',
    });

    // Enviar webhook a n8n (recup_prestamo.notificacion)
    await this.sendWebhookToN8n(prestamoConRelaciones, 'NINGUNO', saved.recup_estado || 'SOLICITADO');

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

    // Emitir evento si el estado cambió
    if (updatePrestamoDto.recup_estado && estadoAnterior !== updatePrestamoDto.recup_estado) {
      // Cargar relaciones actualizadas para el webhook
      const prestamoConRelaciones = await this.findOne(updated.prestamoId);

      // Emitir evento a RabbitMQ (recup_prestamo.estado-cambiado)
      this.auditClient.emit('recup_prestamo.estado-cambiado', {
        prestamoId: updated.prestamoId,
        estadoAnterior: estadoAnterior,
        estadoNuevo: updatePrestamoDto.recup_estado,
        fechaCambio: new Date(),
        comentario: `Estado cambiado de ${estadoAnterior} a ${updatePrestamoDto.recup_estado}`,
      });

      // Enviar webhook a n8n (recup_prestamo.notificacion)
      await this.sendWebhookToN8n(prestamoConRelaciones, estadoAnterior, updatePrestamoDto.recup_estado);
    }

    return updated;
  }

  async remove(id: number): Promise<void> {
    const prestamo = await this.findOne(id);
    await this.prestamoRepository.remove(prestamo);
  }
}
