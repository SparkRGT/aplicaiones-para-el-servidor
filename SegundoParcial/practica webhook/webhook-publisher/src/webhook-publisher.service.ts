import { Injectable, Logger, OnModuleInit, Controller } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventPattern, Payload } from '@nestjs/microservices';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { WebhookSubscription } from './entities/webhook-subscription.entity';
import { WebhookDelivery } from './entities/webhook-delivery.entity';
import { WebhookEvent, WebhookPayload } from './interfaces/webhook-event.interface';
import { CircuitBreakerService } from './circuit-breaker.service';
import { TelegramNotificationService } from './telegram-notification.service';

@Controller()
@Injectable()
export class WebhookPublisherService implements OnModuleInit {
  private readonly logger = new Logger(WebhookPublisherService.name);

  constructor(
    @InjectRepository(WebhookSubscription, 'webhooks_db')
    private subscriptionRepository: Repository<WebhookSubscription>,
    @InjectRepository(WebhookDelivery, 'webhooks_db')
    private deliveryRepository: Repository<WebhookDelivery>,
    private readonly httpService: HttpService,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly telegramService: TelegramNotificationService,
  ) {}

  async onModuleInit() {
    this.logger.log('🚀 Webhook Publisher Service inicializado');
    this.logger.log('📱 Telegram Notifications enabled');
  }

  /**
   * Escucha eventos de RabbitMQ y los publica como webhooks + Telegram
   */
  @EventPattern('*')
  async handleRabbitMQEvent(@Payload() event: WebhookEvent) {
    this.logger.log(`📨 Evento recibido de RabbitMQ: ${event.eventType} - ${event.eventId}`);
    this.logger.log(`📦 Data: ${JSON.stringify(event.data)}`);

    try {
      // PRIMERO: Enviar notificación a Telegram (SIN ESPERAR suscripciones)
      this.logger.log(`📱 Enviando notificación a Telegram...`);
      await this.sendTelegramNotification(event);

      // SEGUNDO: Buscar suscripciones activas que coincidan con el tipo de evento
      const subscriptions = await this.findMatchingSubscriptions(event.eventType);

      if (subscriptions.length === 0) {
        this.logger.debug(`No hay suscripciones activas para el evento: ${event.eventType}`);
        return;
      }

      // TERCERO: Publicar webhook a cada suscripción
      const promises = subscriptions.map(subscription =>
        this.publishWebhook(subscription, event),
      );

      await Promise.allSettled(promises);
    } catch (error) {
      this.logger.error(`Error procesando evento ${event.eventId}:`, error.message);
    }
  }

  /**
   * Encuentra suscripciones que coincidan con el tipo de evento
   */
  private async findMatchingSubscriptions(eventType: string): Promise<WebhookSubscription[]> {
    const subscriptions = await this.subscriptionRepository.find({
      where: { active: true },
    });

    return subscriptions.filter(sub => {
      return sub.event_types.some(pattern => {
        // Soporte para wildcards: producto.*, orden.*, etc.
        if (pattern.endsWith('.*')) {
          const prefix = pattern.slice(0, -2);
          return eventType.startsWith(prefix + '.');
        }
        return pattern === eventType;
      });
    });
  }

  /**
   * Enviar notificación a Telegram de forma asincrónica sin bloquear
   */
  private async sendTelegramNotification(event: WebhookEvent): Promise<void> {
    try {
      this.logger.log(`📱 Intentando enviar notificación Telegram para evento: ${event.eventType}`);
      
      const telegramEvent = {
        id: event.eventId,
        type: event.eventType,
        timestamp: new Date().toISOString(),
        source: event.source,
        data: event.data,
        processed: false,
      };

      const sent = await this.telegramService.sendTelegramNotification(telegramEvent);
      
      if (sent) {
        this.logger.log(`✅ Notificación Telegram enviada correctamente para evento: ${event.eventId}`);
      } else {
        this.logger.warn(`⚠️  Notificación Telegram no se envió (pero no es un error crítico): ${event.eventId}`);
      }
    } catch (error) {
      this.logger.error(`❌ Error inesperado enviando notificación Telegram:`, error.message);
      // No relanzar el error para no bloquear el procesamiento del webhook
    }
  }

  /**
   * Publica un webhook a una suscripción específica
   */
  async publishWebhook(subscription: WebhookSubscription, event: WebhookEvent): Promise<void> {
    // Verificar Circuit Breaker
    const canExecute = await this.circuitBreaker.canExecute(subscription.url);
    if (!canExecute) {
      this.logger.warn(`Circuit Breaker OPEN para ${subscription.url}, omitiendo webhook`);
      return;
    }

    // Crear payload firmado
    const payload = this.createSignedPayload(event, subscription.secret);

    // Crear registro de entrega
    const delivery = this.deliveryRepository.create({
      subscription_id: subscription.id,
      event_id: event.eventId,
      event_type: event.eventType,
      url: subscription.url,
      payload: payload,
      status: 'pending',
      attempt_number: 1,
    });

    const savedDelivery = await this.deliveryRepository.save(delivery);

    // Intentar enviar con retry
    await this.sendWithRetry(subscription, savedDelivery, payload);
  }

  /**
   * Crea un payload firmado con HMAC-SHA256
   */
  private createSignedPayload(event: WebhookEvent, secret: string): WebhookPayload {
    const timestamp = Date.now();
    const payload = {
      event,
      timestamp,
    };

    const payloadString = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');

    return {
      ...payload,
      signature,
    };
  }

  /**
   * Envía webhook con retry y exponential backoff
   */
  private async sendWithRetry(
    subscription: WebhookSubscription,
    delivery: WebhookDelivery,
    payload: WebhookPayload,
  ): Promise<void> {
    const retryConfig = subscription.retry_config || {
      maxAttempts: 6,
      delays: [60000, 300000, 1800000, 7200000, 43200000], // 1min, 5min, 30min, 2h, 12h
    };

    let attempt = delivery.attempt_number;
    let lastError: Error | null = null;

    while (attempt <= retryConfig.maxAttempts) {
      try {
        // Verificar Circuit Breaker antes de cada intento
        const canExecute = await this.circuitBreaker.canExecute(subscription.url);
        if (!canExecute) {
          this.logger.warn(`Circuit Breaker OPEN para ${subscription.url}, abortando retry`);
          delivery.status = 'failed';
          delivery.error_message = 'Circuit Breaker OPEN';
          await this.deliveryRepository.save(delivery);
          return;
        }

        // Actualizar estado de entrega
        delivery.status = attempt > 1 ? 'retrying' : 'pending';
        delivery.attempt_number = attempt;
        await this.deliveryRepository.save(delivery);

        // Enviar HTTP POST
        const response = await firstValueFrom(
          this.httpService.post(subscription.url, payload, {
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Signature': payload.signature,
              'X-Webhook-Timestamp': payload.timestamp.toString(),
            },
            timeout: 10000, // 10 segundos timeout
          }),
        );

        // Éxito
        delivery.status = 'success';
        delivery.http_status_code = response.status;
        delivery.response_body = JSON.stringify(response.data);
        delivery.delivered_at = new Date();
        await this.deliveryRepository.save(delivery);

        // Registrar éxito en Circuit Breaker
        await this.circuitBreaker.recordSuccess(subscription.url);

        this.logger.log(
          `✅ Webhook entregado exitosamente: ${subscription.url} - Intento ${attempt}`,
        );
        return;
      } catch (error: any) {
        lastError = error;
        const statusCode = error.response?.status || 0;
        const errorMessage = error.message || 'Unknown error';

        this.logger.warn(
          `❌ Intento ${attempt}/${retryConfig.maxAttempts} falló para ${subscription.url}: ${errorMessage}`,
        );

        // Registrar fallo en Circuit Breaker
        await this.circuitBreaker.recordFailure(subscription.url);

        // Si es el último intento, marcar como fallido
        if (attempt >= retryConfig.maxAttempts) {
          delivery.status = 'failed';
          delivery.http_status_code = statusCode;
          delivery.error_message = errorMessage;
          await this.deliveryRepository.save(delivery);
          this.logger.error(`❌ Webhook falló después de ${retryConfig.maxAttempts} intentos`);
          return;
        }

        // Esperar antes del siguiente intento (exponential backoff)
        const delay = retryConfig.delays[attempt - 1] || retryConfig.delays[retryConfig.delays.length - 1];
        this.logger.log(`⏳ Esperando ${delay / 1000}s antes del siguiente intento...`);
        await this.sleep(delay);

        attempt++;
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    if (lastError) {
      delivery.status = 'failed';
      delivery.error_message = lastError.message;
      await this.deliveryRepository.save(delivery);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

