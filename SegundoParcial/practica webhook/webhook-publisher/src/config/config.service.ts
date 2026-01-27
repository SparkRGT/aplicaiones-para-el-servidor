import { Injectable } from '@nestjs/common';
import telegramConfig from './telegram.config.json';

@Injectable()
export class ConfigService {
  private environment: string;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
  }

  getTelegramConfig() {
    return telegramConfig[this.environment] || telegramConfig['development'];
  }

  getWebhookEventConfig(eventType: string) {
    return telegramConfig.webhookEvents[eventType];
  }

  getTelegramEnabled(): boolean {
    return this.getTelegramConfig().enabled || false;
  }
}
