import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

export interface AuditLogData {
  operationType: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ';
  entityType: string;
  entityId?: number;
  userId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class SupabaseAuditService {
  private supabase: SupabaseClient;
  private config: any;

  constructor() {
    this.loadConfig();
    this.initializeSupabase();
  }

  private loadConfig(): void {
    const configPath = path.join(__dirname, '../config/supabase.config.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    this.config = JSON.parse(configData);
  }

  private initializeSupabase(): void {
    const { supabaseUrl, supabaseServiceKey } = this.config;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('Supabase credentials not configured. Audit logging will be disabled.');
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  async logOperation(logData: AuditLogData): Promise<void> {
    if (!this.supabase || !this.config.edgeFunctions?.auditLogger?.enabled) {
      console.log('Audit logging disabled or not configured');
      return;
    }

    try {
      const auditEntry = {
        operation_type: logData.operationType,
        entity_type: logData.entityType,
        entity_id: logData.entityId || null,
        user_id: logData.userId || 'system',
        metadata: logData.metadata || {},
        timestamp: new Date().toISOString(),
        source: 'microservicio-a',
      };

      // Insertar directamente en la tabla usando el cliente de Supabase
      const { data, error } = await this.supabase
        .from('audit_logs')
        .insert([auditEntry])
        .select();

      if (error) {
        console.error('Error logging audit entry:', error);
        throw error;
      }

      console.log('Audit log created successfully:', data[0]?.id);
    } catch (error) {
      console.error('Failed to log operation to Supabase:', error.message);
      // No lanzamos el error para no interrumpir el flujo principal
    }
  }

  async getAuditLogs(filters?: {
    entityType?: string;
    entityId?: number;
    operationType?: string;
    limit?: number;
  }): Promise<any[]> {
    if (!this.supabase) {
      return [];
    }

    try {
      let query = this.supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters?.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }

      if (filters?.entityId) {
        query = query.eq('entity_id', filters.entityId);
      }

      if (filters?.operationType) {
        query = query.eq('operation_type', filters.operationType);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch audit logs:', error.message);
      return [];
    }
  }

  async getEntityHistory(entityType: string, entityId: number): Promise<any[]> {
    return this.getAuditLogs({ entityType, entityId });
  }
}
