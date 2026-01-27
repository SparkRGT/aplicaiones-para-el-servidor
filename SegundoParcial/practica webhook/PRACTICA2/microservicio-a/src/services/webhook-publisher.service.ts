import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { WebhookSecurityService } from './webhook-security.service';
import { CircuitBreakerService } from './circuit-breaker.service';
import * as fs from 'fs';
import * as path from 'path';

interface WebhookPayload {
  event: string;
  version: string;
  id: string;
  idempotency_key: string;
  timestamp: string;
  data: any;
  metadata: {
    source: string;
    environment: string;
    correlation_id: string;
  };
}

interface WebhookSubscription {
  url: string;
  secret: string;
}

interface RetryConfig {
  maxAttempts: number;
  backoffType: string;
  initialDelayMs: number;
  maxDelayMs: number;
  timeoutMs: number;
}

@Injectable()
export class WebhookPublisherService {
  private readonly logger = new Logger(WebhookPublisherService.name);
  private webhooksConfig: any;
  private readonly retryDelays = [1, 5, 30, 120, 720]; // minutos

  constructor(
    private securityService: WebhookSecurityService,
    private circuitBreakerService: CircuitBreakerService,
  ) {
    this.loadWebhooksConfig();
  }

  /**
   * Carga la configuración de webhooks desde archivo
   */
  private loadWebhooksConfig(): void {
    try {
      const configPath = path.join(__dirname, '../config/webhooks.config.json');
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf-8');
        // Reemplazar variables de entorno
        const interpolatedContent = configContent
          .replace(/\${WEBHOOK_EVENT_LOGGER_URL}/g, process.env.WEBHOOK_EVENT_LOGGER_URL || 'http://localhost:3001')
          .replace(/\${WEBHOOK_SECRET_LOGGER}/g, process.env.WEBHOOK_SECRET_LOGGER || 'webhook_secret_logger')
          .replace(/\${WEBHOOK_EXTERNAL_NOTIFIER_URL}/g, process.env.WEBHOOK_EXTERNAL_NOTIFIER_URL || 'http://localhost:3002')
          .replace(/\${WEBHOOK_SECRET_NOTIFIER}/g, process.env.WEBHOOK_SECRET_NOTIFIER || 'webhook_secret_notifier');
        
        this.webhooksConfig = JSON.parse(interpolatedContent);
        this.logger.log('✅ Configuración de webhooks cargada');
      }
    } catch (error) {
      this.logger.error('❌ Error al cargar configuración de webhooks:', error);
      this.webhooksConfig = { webhooks: { enabled: false } };
    }
  }

  /**
   * Publica un webhook para un evento
   * @param eventType - Tipo de evento (ej. "producto.creado")
   * @param eventData - Datos del evento
   * @param entityId - ID de la entidad afectada
   */
  async publishWebhook(
    eventType: string,
    eventData: any,
    entityId: string | number,
  ): Promise<void> {
    if (!this.webhooksConfig.webhooks?.enabled) {
      this.logger.warn('⚠️ Webhooks deshabilitados en configuración');
      return;
    }

    try {
      // Buscar suscriptores para este evento
      const subscription = this.webhooksConfig.webhooks.subscriptions.find(
        (sub: any) => sub.eventType === eventType,
      );

      if (!subscription || !subscription.urls.length) {
        this.logger.log(`⚠️ No hay suscriptores para evento: ${eventType}`);
        return;
      }

      // Crear payload estándar
      const correlationId = `req_${uuidv4().substring(0, 12)}`;
      const webhookId = this.securityService.generateWebhookId();
      const idempotencyKey = this.securityService.generateIdempotencyKey(
        eventType,
        entityId,
        'published',
      );

      const payload: WebhookPayload = {
        event: eventType,
        version: '1.0',
        id: webhookId,
        idempotency_key: idempotencyKey,
        timestamp: new Date().toISOString(),
        data: eventData,
        metadata: {
          source: 'microservice-a',
          environment: process.env.NODE_ENV || 'development',
          correlation_id: correlationId,
        },
      };

      // Enviar a todos los suscriptores
      for (const subscriberUrl of subscription.urls) {
        await this.sendWebhookWithRetry(
          subscriberUrl,
          payload,
          eventType,
          this.webhooksConfig.webhooks.retryPolicy,
          this.webhooksConfig.webhooks.circuitBreaker,
        );
      }
    } catch (error) {
      this.logger.error(`❌ Error publicando webhook para ${eventType}:`, error);
    }
  }

  /**
   * Envía webhook con reintentos y Circuit Breaker
   */
  private async sendWebhookWithRetry(
    subscriber: WebhookSubscription,
    payload: WebhookPayload,
    eventType: string,
    retryConfig: RetryConfig,
    cbConfig: any,
  ): Promise<void> {
    const signature = this.securityService.generateSignature(payload, subscriber.secret);
    const timestamp = this.securityService.generateTimestamp();

    // Verificar Circuit Breaker
    if (!this.circuitBreakerService.canExecute(subscriber.url, cbConfig)) {
      this.logger.warn(
        `🔴 [Circuit Breaker] Solicitud rechazada para ${subscriber.url} (estado OPEN)`,
      );
      return;
    }

    let lastError: any;
    const maxAttempts = retryConfig.maxAttempts || 6;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const startTime = Date.now();

        this.logger.log(
          `📤 [Intento ${attempt}/${maxAttempts}] Enviando webhook a ${subscriber.url}`,
        );

        const response = await axios.post(subscriber.url, payload, {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Timestamp': timestamp,
            'X-Webhook-Id': payload.id,
            'X-Correlation-Id': payload.metadata.correlation_id,
          },
          timeout: retryConfig.timeoutMs || 10000,
        });

        const duration = Date.now() - startTime;

        this.logger.log(
          `✅ Webhook entregado a ${subscriber.url} (${duration}ms) - Status: ${response.status}`,
        );

        // Registrar éxito en Circuit Breaker
        this.circuitBreakerService.recordSuccess(subscriber.url, cbConfig);

        // Log de entrega exitosa
        this.logWebhookDelivery({
          url: subscriber.url,
          eventType,
          status: 'success',
          statusCode: response.status,
          attempt,
          durationMs: duration,
          payloadId: payload.id,
        });

        return; // Éxito, salir
      } catch (error: any) {
        lastError = error;
        const duration = error.config?.timeout || 0;

        this.logger.error(
          `❌ [Intento ${attempt}/${maxAttempts}] Fallo: ${error.message}`,
        );

        // Registrar fallo en Circuit Breaker
        this.circuitBreakerService.recordFailure(subscriber.url, cbConfig);

        // Log de fallo
        this.logWebhookDelivery({
          url: subscriber.url,
          eventType,
          status: 'failed',
          statusCode: error.response?.status || 0,
          attempt,
          durationMs: duration,
          payloadId: payload.id,
          errorMessage: error.message,
        });

        // Si es el último intento, registrar en Dead Letter
        if (attempt === maxAttempts) {
          this.logWebhookFailure({
            url: subscriber.url,
            eventType,
            payload,
            errorMessage: error.message,
            attempts: attempt,
          });
          break;
        }

        // Calcular delay con exponential backoff
        const delayMs = this.calculateBackoffDelay(attempt, retryConfig);
        this.logger.log(`⏳ Esperando ${delayMs}ms antes de reintentar...`);

        await this.sleep(delayMs);
      }
    }

    this.logger.error(
      `🔴 Webhook fallido después de ${maxAttempts} intentos para ${subscriber.url}`,
      lastError?.message,
    );
  }

  /**
   * Calcula el delay con exponential backoff
   */
  private calculateBackoffDelay(attempt: number, retryConfig: RetryConfig): number {
    if (retryConfig.backoffType === 'exponential') {
      const initialDelay = retryConfig.initialDelayMs || 60000;
      const maxDelay = retryConfig.maxDelayMs || 43200000;
      const delay = initialDelay * Math.pow(2, attempt - 1);
      return Math.min(delay, maxDelay);
    }
    return retryConfig.initialDelayMs || 60000;
  }

  /**
   * Registra una entrega de webhook
   */
  private logWebhookDelivery(info: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'webhook_delivery',
      ...info,
    };

    // Guardar en archivo local para auditoría
    const logPath = path.join(__dirname, '../../data/webhooks/deliveries.jsonl');
    const logDir = path.dirname(logPath);

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
    this.logger.debug(`📝 Registro de entrega guardado`);
  }

  /**
   * Registra un webhook que falló permanentemente
   */
  private logWebhookFailure(info: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'webhook_failure',
      ...info,
    };

    // Guardar en archivo local (Dead Letter Queue simulado)
    const logPath = path.join(__dirname, '../../data/webhooks/dead-letter-queue.jsonl');
    const logDir = path.dirname(logPath);

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
    this.logger.error(`⚰️ Webhook movido a Dead Letter Queue`);
  }

  /**
   * Utilidad para dormir
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Obtiene estadísticas de Circuit Breaker (para monitoreo)
   */
  getCircuitBreakerStats(): Record<string, any> {
    return this.circuitBreakerService.getAllStats();
  }
}
