import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return {
      status: 'OK',
      service: 'exam2p-servicio-auditoria',
      framework: 'NestJS',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get()
  info() {
    return {
      service: 'Microservicio de Auditoría - Exam 2P',
      version: '1.0.0',
      framework: 'NestJS',
      features: [
        'RabbitMQ con @nestjs/microservices',
        'PostgreSQL con TypeORM',
        'Entidad exam2pRegistroAuditoria',
        'Evento exam2p.registro.eliminado',
        '@EventPattern para escuchar eventos',
      ],
      endpoints: {
        'GET /health': 'Estado del servicio',
        'GET /auditorias': 'Listar todas las auditorías',
        'POST /auditorias': 'Crear auditoría',
        'GET /auditorias/:id': 'Obtener auditoría por ID',
        'GET /auditorias/accion/:accion': 'Filtrar por acción',
        'GET /auditorias/entidad/:entidad': 'Filtrar por entidad',
        'GET /auditorias/estadisticas': 'Estadísticas',
        'POST /auditorias/emitir-eliminado': 'Emitir evento exam2p.registro.eliminado',
      },
    };
  }
}
