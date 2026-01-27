import { Injectable } from '@nestjs/common';
import databaseConfig from './database.config.json';
import eventsConfig from './events.config.json';

@Injectable()
export class ConfigService {
  private environment: string;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
  }

  getDatabaseConfig() {
    return databaseConfig[this.environment] || databaseConfig['development'];
  }

  getEventsConfig() {
    return eventsConfig;
  }

  getEventConfig(eventName: string) {
    return eventsConfig.events.find(e => e.name === eventName);
  }

  shouldNotifyTelegram(eventName: string): boolean {
    const eventConfig = this.getEventConfig(eventName);
    return eventConfig?.notifyTelegram || false;
  }
}
