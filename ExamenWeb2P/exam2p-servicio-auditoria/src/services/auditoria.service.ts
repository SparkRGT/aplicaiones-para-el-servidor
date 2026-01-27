import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Exam2pRegistroAuditoria } from '../entities/exam2p-registro-auditoria.entity';
import { CreateAuditoriaDto, RegistroEliminadoEventDto } from '../dto/auditoria.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuditoriaService {
  private readonly logger = new Logger(AuditoriaService.name);

  constructor(
    @InjectRepository(Exam2pRegistroAuditoria)
    private readonly auditoriaRepository: Repository<Exam2pRegistroAuditoria>,
    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitClient: ClientProxy,
  ) {}

  /**
   * Crear un nuevo registro de auditoría
   */
  async crear(dto: CreateAuditoriaDto): Promise<Exam2pRegistroAuditoria> {
    const auditoria = this.auditoriaRepository.create({
      registroId: uuidv4(),
      exam2p_entidad: dto.exam2p_entidad,
      exam2p_registroAfectadoId: dto.exam2p_registroAfectadoId,
      exam2p_accion: dto.exam2p_accion,
      exam2p_fechaHora: new Date(),
      exam2p_detalle: dto.exam2p_detalle || '',
    });

    const saved = await this.auditoriaRepository.save(auditoria);
    this.logger.log(`✅ Auditoría creada: ${saved.registroId}`);

    return saved;
  }

  /**
   * Obtener todas las auditorías
   */
  async obtenerTodas(): Promise<Exam2pRegistroAuditoria[]> {
    return this.auditoriaRepository.find({
      order: { exam2p_fechaHora: 'DESC' },
    });
  }

  /**
   * Obtener auditoría por ID
   */
  async obtenerPorId(id: string): Promise<Exam2pRegistroAuditoria | null> {
    return this.auditoriaRepository.findOne({ where: { registroId: id } });
  }

  /**
   * Obtener auditorías por acción
   */
  async obtenerPorAccion(accion: string): Promise<Exam2pRegistroAuditoria[]> {
    return this.auditoriaRepository.find({
      where: { exam2p_accion: accion as 'CREAR' | 'MODIFICAR' | 'ELIMINAR' },
      order: { exam2p_fechaHora: 'DESC' },
    });
  }

  /**
   * Obtener auditorías por entidad
   */
  async obtenerPorEntidad(entidad: string): Promise<Exam2pRegistroAuditoria[]> {
    return this.auditoriaRepository.find({
      where: { exam2p_entidad: entidad },
      order: { exam2p_fechaHora: 'DESC' },
    });
  }

  /**
   * Emitir evento exam2p.registro.eliminado
   */
  emitirEventoEliminado(data: RegistroEliminadoEventDto): void {
    const eventData = {
      ...data,
      timestamp: data.timestamp || new Date(),
    };

    this.rabbitClient.emit('exam2p.registro.eliminado', eventData);
    this.logger.log(`📤 Evento emitido: exam2p.registro.eliminado - Entidad: ${data.entidad}, ID: ${data.registroId}`);
  }

  /**
   * Procesar evento de registro eliminado (escuchado con @EventPattern)
   * Este método es llamado cuando se recibe el evento exam2p.registro.eliminado
   */
  async procesarRegistroEliminado(data: RegistroEliminadoEventDto): Promise<Exam2pRegistroAuditoria> {
    this.logger.log(`📥 Evento recibido: exam2p.registro.eliminado - Entidad: ${data.entidad}, ID: ${data.registroId}`);

    // Guardar registro de auditoría cuando se recibe el evento
    const auditoria = await this.crear({
      exam2p_entidad: data.entidad,
      exam2p_registroAfectadoId: data.registroId,
      exam2p_accion: 'ELIMINAR',
      exam2p_detalle: data.detalle || `Registro ${data.registroId} eliminado de ${data.entidad}`,
    });

    this.logger.log(`💾 Auditoría guardada para eliminación: ${auditoria.registroId}`);
    return auditoria;
  }

  /**
   * Obtener estadísticas
   */
  async obtenerEstadisticas(): Promise<any> {
    const total = await this.auditoriaRepository.count();
    const porAccion = await this.auditoriaRepository
      .createQueryBuilder('a')
      .select('a.exam2p_accion', 'accion')
      .addSelect('COUNT(*)', 'cantidad')
      .groupBy('a.exam2p_accion')
      .getRawMany();

    return {
      total,
      porAccion,
    };
  }
}
