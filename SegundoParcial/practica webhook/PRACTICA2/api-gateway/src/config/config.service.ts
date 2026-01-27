import { Injectable } from '@nestjs/common';
import routesConfig from './routes.config.json';

@Injectable()
export class ConfigService {
  getRoutesConfig() {
    return routesConfig;
  }

  getMicroserviceConfig(name: string) {
    return routesConfig.microservices.find(m => m.name === name);
  }

  getWebhooksConfig() {
    return routesConfig.webhooks;
  }
}
