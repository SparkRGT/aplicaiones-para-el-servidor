import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { WebhookSubscription } from './entities/webhook-subscription.entity';
import { WebhookDelivery } from './entities/webhook-delivery.entity';
import { CircuitBreakerStateEntity } from './entities/circuit-breaker-state.entity';
import { WebhookPublisherService } from './webhook-publisher.service';
import { CircuitBreakerService } from './circuit-breaker.service';
import { TelegramNotificationModule } from './telegram-notification.module';
import { ConfigService } from './config/config.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    TelegramNotificationModule,
  ],
  controllers: [WebhookPublisherService],
  providers: [WebhookPublisherService, CircuitBreakerService, ConfigService],
  exports: [WebhookPublisherService, CircuitBreakerService, TelegramNotificationModule, ConfigService],
})
export class WebhookPublisherModule {
  static forRoot(connectionName: string = 'default'): DynamicModule {
    return {
      module: WebhookPublisherModule,
      imports: [
        HttpModule.register({
          timeout: 10000,
          maxRedirects: 5,
        }),
        TelegramNotificationModule,
        TypeOrmModule.forFeature(
          [WebhookSubscription, WebhookDelivery, CircuitBreakerStateEntity],
          connectionName,
        ),
      ],
      controllers: [WebhookPublisherService],
      providers: [WebhookPublisherService, CircuitBreakerService, ConfigService],
      exports: [WebhookPublisherService, CircuitBreakerService, TelegramNotificationModule, ConfigService],
    };
  }
}

