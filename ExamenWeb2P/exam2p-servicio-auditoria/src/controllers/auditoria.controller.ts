import { Controller, Get, Post, Body, Param, HttpCode, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { AuditoriaService } from '../services/auditoria.service';
import { CreateAuditoriaDto, RegistroEliminadoEventDto } from '../dto/auditoria.dto';

@Controller('auditorias')
export class AuditoriaController {
  private readonly logger = new Logger(AuditoriaController.name);

  constructor(private readonly auditoriaService: AuditoriaService) {}

  // ==================== HTTP ENDPOINTS ====================

  @Post()
  @HttpCode(201)
  async crear(@Body() dto: CreateAuditoriaDto) {
    this.logger.log(`📝 POST /auditorias - Creando auditoría para ${dto.exam2p_entidad}`);
    const auditoria = await this.auditoriaService.crear(dto);
    return {
      success: true,
      data: auditoria,
    };
  }

  @Get()
  async obtenerTodas() {
    const auditorias = await this.auditoriaService.obtenerTodas();
    return {
      success: true,
      count: auditorias.length,
      data: auditorias,
    };
  }

  @Get('estadisticas')
  async obtenerEstadisticas() {
    const stats = await this.auditoriaService.obtenerEstadisticas();
    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    const auditoria = await this.auditoriaService.obtenerPorId(id);
    if (!auditoria) {
      return {
        success: false,
        message: 'Auditoría no encontrada',
      };
    }
    return {
      success: true,
      data: auditoria,
    };
  }

  @Get('accion/:accion')
  async obtenerPorAccion(@Param('accion') accion: string) {
    const auditorias = await this.auditoriaService.obtenerPorAccion(accion);
    return {
      success: true,
      count: auditorias.length,
      data: auditorias,
    };
  }

  @Get('entidad/:entidad')
  async obtenerPorEntidad(@Param('entidad') entidad: string) {
    const auditorias = await this.auditoriaService.obtenerPorEntidad(entidad);
    return {
      success: true,
      count: auditorias.length,
      data: auditorias,
    };
  }

  // ==================== ENDPOINT PARA EMITIR EVENTO ====================

  @Post('emitir-eliminado')
  @HttpCode(200)
  async emitirEventoEliminado(@Body() dto: RegistroEliminadoEventDto) {
    this.logger.log(`📤 POST /auditorias/emitir-eliminado - Emitiendo evento para ${dto.entidad}:${dto.registroId}`);
    this.auditoriaService.emitirEventoEliminado(dto);
    return {
      success: true,
      message: 'Evento exam2p.registro.eliminado emitido correctamente',
      data: dto,
    };
  }

  // ==================== RABBITMQ EVENT LISTENER ====================

  /**
   * Escucha el evento exam2p.registro.eliminado con @EventPattern
   * Cuando se recibe este evento, guarda un registro de auditoría
   */
  @EventPattern('exam2p.registro.eliminado')
  async handleRegistroEliminado(
    @Payload() data: RegistroEliminadoEventDto,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`🎯 @EventPattern('exam2p.registro.eliminado') - Evento recibido`);
    
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const auditoria = await this.auditoriaService.procesarRegistroEliminado(data);
      
      // Acknowledge the message
      channel.ack(originalMsg);
      
      this.logger.log(`✅ Evento procesado y auditoría guardada: ${auditoria.registroId}`);
    } catch (error) {
      this.logger.error(`❌ Error procesando evento: ${error.message}`);
      // Reject the message and requeue
      channel.nack(originalMsg, false, true);
    }
  }
}
