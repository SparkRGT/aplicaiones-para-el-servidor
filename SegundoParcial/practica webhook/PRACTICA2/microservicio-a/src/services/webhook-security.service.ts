import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WebhookSecurityService {
  /**
   * Genera firma HMAC-SHA256 para un payload
   * @param payload - Objeto a firmar
   * @param secret - Clave secreta compartida
   * @returns Firma en formato "sha256=hex"
   */
  generateSignature(payload: any, secret: string): string {
    // Serializar payload a JSON (sin espacios para consistency)
    const payloadString = JSON.stringify(payload);

    // Crear HMAC con SHA256
    const hmac = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');

    // Retornar con prefijo estándar
    return `sha256=${hmac}`;
  }

  /**
   * Genera timestamp actual en segundos Unix
   * @returns Timestamp en formato string
   */
  generateTimestamp(): string {
    return Math.floor(Date.now() / 1000).toString();
  }

  /**
   * Genera ID único para webhook
   * @returns UUID v4
   */
  generateWebhookId(): string {
    return `evt_${crypto.randomBytes(6).toString('hex')}`;
  }

  /**
   * Genera clave de idempotencia basada en evento
   * @param eventType - Tipo de evento
   * @param entityId - ID de la entidad
   * @param action - Acción realizada
   * @returns Clave de idempotencia única
   */
  generateIdempotencyKey(eventType: string, entityId: string | number, action: string): string {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return `${eventType}-${entityId}-${action}-${timestamp}`;
  }
}
