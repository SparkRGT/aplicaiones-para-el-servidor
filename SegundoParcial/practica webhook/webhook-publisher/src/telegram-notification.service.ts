import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as axios from 'axios';
import telegramConfig from './config/telegram.config.json';

// FORZAR CARGA DE .ENV DESDE MÚLTIPLES UBICACIONES
const possiblePaths = [
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), '..', '.env'),
  path.join(process.cwd(), '..', '..', '.env'),
  path.join(__dirname, '..', '..', '.env'),
  path.join(__dirname, '..', '..', '..', '.env'),
];

let envLoaded = false;
for (const envPath of possiblePaths) {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim();
        if (key.startsWith('TELEGRAM')) {
          process.env[key.trim()] = value;
        }
      }
    });
    console.log(`✅ Variables Telegram cargadas desde: ${envPath}`);
    envLoaded = true;
    break;
  }
}

interface WebhookEvent {
  id: string;
  type: string;
  timestamp: string;
  source: string;
  data: any;
  processed: boolean;
  telegramSent?: boolean;
  error?: string;
}

interface ProcessedWebhook {
  idempotencyKey: string;
  eventId: string;
  timestamp: string;
  telegramSent: boolean;
}

@Injectable()
export class TelegramNotificationService {
  private readonly logger = new Logger(TelegramNotificationService.name);
  private eventsDir = path.join(process.cwd(), 'data', 'webhooks');
  private processedFile = path.join(this.eventsDir, 'processed.json');
  private telegramToken: string;
  private telegramChatId: string;
  private telegramConfig: any;
  private environment: string;
  private isEnabled: boolean = false;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.telegramConfig = telegramConfig[this.environment] || telegramConfig['development'];
    
    // Leer directamente del .env, ignorando placeholders en config.json
    this.telegramToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.telegramChatId = process.env.TELEGRAM_CHAT_ID || '';
    
    // Validar configuración
    this.isEnabled = this.telegramToken.length > 0 && this.telegramChatId.length > 0;
    
    this.initializePaths();
    
    // Logging detallado para diagnóstico
    this.logger.log(`🤖 Telegram Notification Service inicializado`);
    this.logger.log(`📋 Entorno: ${this.environment}`);
    this.logger.log(`🔐 Token configurado: ${this.isEnabled ? '✅ SÍ' : '❌ NO'}`);
    this.logger.log(`💬 Chat ID configurado: ${this.isEnabled ? '✅ SÍ' : '❌ NO'}`);
    
    if (!this.isEnabled) {
      this.logger.warn(`⚠️  TELEGRAM NO CONFIGURADO CORRECTAMENTE`);
      this.logger.warn(`📝 Variables requeridas en .env:`);
      this.logger.warn(`   - TELEGRAM_BOT_TOKEN=<tu_token>`);
      this.logger.warn(`   - TELEGRAM_CHAT_ID=<tu_chat_id>`);
    } else {
      this.logger.log(`✅ Telegram está listo para enviar notificaciones`);
      this.logger.debug(`   Token: ${this.telegramToken.substring(0, 10)}...`);
      this.logger.debug(`   Chat ID: ${this.telegramChatId}`);
    }
  }

  private initializePaths() {
    // Crear directorios si no existen
    if (!fs.existsSync(this.eventsDir)) {
      fs.mkdirSync(this.eventsDir, { recursive: true });
    }

    // Crear archivo de processed si no existe
    if (!fs.existsSync(this.processedFile)) {
      fs.writeFileSync(this.processedFile, JSON.stringify([], null, 2));
    }
  }

  /**
   * Guardar evento de webhook en archivo JSON
   */
  saveWebhookEvent(eventType: string, source: string, data: any): WebhookEvent {
    const event: WebhookEvent = {
      id: crypto.randomUUID(),
      type: eventType,
      timestamp: new Date().toISOString(),
      source,
      data,
      processed: false,
    };

    const eventsFile = path.join(this.eventsDir, `${Date.now()}-${event.id}.json`);
    fs.writeFileSync(eventsFile, JSON.stringify(event, null, 2));

    return event;
  }

  /**
   * Obtener todos los eventos pendientes
   */
  getPendingEvents(): WebhookEvent[] {
    const files = fs.readdirSync(this.eventsDir).filter(f => f.endsWith('.json') && f !== 'processed.json');
    
    return files.map(file => {
      const filePath = path.join(this.eventsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as WebhookEvent;
    }).filter(e => !e.processed);
  }

  /**
   * Validar si ya fue procesado (idempotencia)
   */
  isAlreadyProcessed(eventId: string): boolean {
    const processed = this.getProcessedWebhooks();
    return processed.some(p => p.eventId === eventId);
  }

  /**
   * Marcar evento como procesado
   */
  markAsProcessed(eventId: string, telegramSent: boolean = false) {
    const processed = this.getProcessedWebhooks();
    
    processed.push({
      idempotencyKey: crypto.randomUUID(),
      eventId,
      timestamp: new Date().toISOString(),
      telegramSent,
    });

    fs.writeFileSync(this.processedFile, JSON.stringify(processed, null, 2));
  }

  /**
   * Obtener eventos ya procesados
   */
  private getProcessedWebhooks(): ProcessedWebhook[] {
    const content = fs.readFileSync(this.processedFile, 'utf-8');
    return JSON.parse(content) as ProcessedWebhook[];
  }

  /**
   * Enviar notificación a Telegram con manejo robusto de reintentos
   */
  async sendTelegramNotification(event: WebhookEvent, retryCount: number = 0): Promise<boolean> {
    const maxRetries = this.telegramConfig.retries || 3;
    const timeout = this.telegramConfig.timeout || 5000;

    // Validar que esté configurado
    if (!this.isEnabled) {
      this.logger.warn('⚠️  Telegram NO está configurado. Saltando notificación.');
      this.logger.warn('📝 Agrega TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID a tu .env');
      return false;
    }

    if (!this.telegramToken || !this.telegramChatId) {
      this.logger.warn('⚠️  Credenciales de Telegram vacías');
      return false;
    }

    try {
      const message = this.formatTelegramMessage(event);
      const url = `${this.telegramConfig.apiUrl}${this.telegramToken}/sendMessage`;

      this.logger.debug(`📤 Enviando a Telegram... (URL: ${url.substring(0, 50)}...)`);
      this.logger.debug(`💬 Mensaje: ${message.substring(0, 50)}...`);

      const response = await axios.default.post(
        url,
        {
          chat_id: this.telegramChatId,
          text: message,
          parse_mode: 'Markdown',
        },
        { timeout }
      );

      if (response.status === 200) {
        this.logger.log(`✅ Notificación Telegram enviada exitosamente: ${event.id}`);
        this.logger.log(`📱 Chat ID: ${this.telegramChatId}`);
        return true;
      }

      throw new Error(`HTTP ${response.status}`);
    } catch (error: any) {
      const errorMsg = error.response?.data?.description || error.message;
      this.logger.error(`❌ Error enviando a Telegram (intento ${retryCount + 1}/${maxRetries}): ${errorMsg}`);

      // Si es un error de credenciales, no reintentar
      if (errorMsg.includes('Unauthorized') || errorMsg.includes('401')) {
        this.logger.error(`🔐 Error de autenticación: Verifica tu TELEGRAM_BOT_TOKEN`);
        return false;
      }

      // Reintentar con backoff exponencial
      if (retryCount < maxRetries - 1) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s...
        this.logger.log(`⏳ Reintentando en ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        return this.sendTelegramNotification(event, retryCount + 1);
      }

      return false;
    }
  }

  /**
   * Formatear mensaje para Telegram con emojis y formato especial
   */
  private formatTelegramMessage(event: WebhookEvent): string {
    const eventConfig = telegramConfig['webhookEvents'] && telegramConfig['webhookEvents'][event.type];
    const icon = eventConfig?.icon || '✅';
    const title = 'Se han actualizado los datos correctamente';
    
    let message = `${icon} *${title}*\n\n`;
    message += `*Tipo de evento:* \`${event.type}\`\n`;
    message += `*Origen:* \`${event.source}\`\n`;
    message += `*Timestamp:* \`${new Date(event.timestamp).toLocaleString('es-ES')}\`\n\n`;

    // Mostrar solo los datos configurados o todos si no está configurado
    if (eventConfig?.includeData) {
      message += `*Detalles de la actualización:*\n`;
      for (const key of eventConfig.includeData) {
        const value = event.data[key];
        if (value !== undefined) {
          message += `• *${this.capitalize(key)}:* \`${JSON.stringify(value)}\`\n`;
        }
      }
    } else {
      message += `*Datos completos:*\n\`\`\`json\n${JSON.stringify(event.data, null, 2)}\n\`\`\``;
    }

    return message;
  }

  /**
   * Capitalizar primera letra
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/([A-Z])/g, ' $1');
  }

  /**
   * Procesar eventos pendientes
   */
  async processPendingEvents(): Promise<void> {
    const pending = this.getPendingEvents();

    for (const event of pending) {
      // Validar idempotencia
      if (this.isAlreadyProcessed(event.id)) {
        console.log(`Evento ${event.id} ya procesado. Saltando.`);
        continue;
      }

      try {
        // Enviar a Telegram
        const sent = await this.sendTelegramNotification(event);

        // Guardar evento como procesado
        this.markAsProcessed(event.id, sent);

        // Actualizar archivo del evento
        event.processed = true;
        event.telegramSent = sent;
        const eventsFile = path.join(this.eventsDir, `${Date.now()}-${event.id}.json`);
        fs.writeFileSync(eventsFile, JSON.stringify(event, null, 2));

        console.log(`✅ Evento procesado: ${event.id}`);
      } catch (error) {
        console.error(`❌ Error procesando evento ${event.id}:`, error);
      }
    }
  }

  /**
   * Obtener estadísticas
   */
  getStats() {
    const processed = this.getProcessedWebhooks();
    const pending = this.getPendingEvents();
    const telegramSent = processed.filter(p => p.telegramSent).length;

    return {
      total: processed.length + pending.length,
      processed: processed.length,
      pending: pending.length,
      telegramSent,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Validar firma HMAC
   */
  validateHmac(payload: string, signature: string, secret: string): boolean {
    const hash = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }

  /**
   * Obtener todos los eventos (para dashboard)
   */
  getAllEvents(): WebhookEvent[] {
    const files = fs.readdirSync(this.eventsDir).filter(f => f.endsWith('.json') && f !== 'processed.json');
    
    return files.map(file => {
      const filePath = path.join(this.eventsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as WebhookEvent;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Limpiar eventos antiguos (más de 30 días)
   */
  cleanOldEvents(daysToKeep: number = 30): number {
    const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const files = fs.readdirSync(this.eventsDir).filter(f => f.endsWith('.json') && f !== 'processed.json');
    
    let deleted = 0;
    for (const file of files) {
      const filePath = path.join(this.eventsDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.mtime.getTime() < cutoffDate) {
        fs.unlinkSync(filePath);
        deleted++;
      }
    }

    return deleted;
  }
}
