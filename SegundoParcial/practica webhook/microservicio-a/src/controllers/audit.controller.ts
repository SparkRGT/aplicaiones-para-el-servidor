import { Controller, Get, Query, Param } from '@nestjs/common';
import { SupabaseAuditService } from '../services/supabase-audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: SupabaseAuditService) {}

  @Get('logs')
  async getAuditLogs(
    @Query('entityType') entityType?: string,
    @Query('operationType') operationType?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.getAuditLogs({
      entityType,
      operationType,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Get('entity/:type/:id')
  async getEntityHistory(
    @Param('type') entityType: string,
    @Param('id') entityId: string,
  ) {
    return this.auditService.getEntityHistory(entityType, parseInt(entityId));
  }
}
