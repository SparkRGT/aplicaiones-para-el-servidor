import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orden } from './entities/orden.entity';
import { EventosProcesado } from './entities/eventos-procesado.entity';
import { OrdenesController } from './controllers/ordenes.controller';
import { OrdenesService } from './services/ordenes.service';
import { EventosConsumer } from './consumers/eventos.consumer';
import { RabbitMQPublisherService } from './publishers/rabbitmq-publisher.service';
import { ConfigService } from './config/config.service';
import { 
  WebhookPublisherModule,
  WebhookSubscription,
  WebhookDelivery,
  CircuitBreakerStateEntity
} from 'webhook-publisher';

@Module({
  imports: [
    // Base de datos del microservicio B
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.MICROSERVICIO_B_DB_HOST || 'localhost',
      port: parseInt(process.env.MICROSERVICIO_B_DB_PORT || '5433'),
      username: process.env.MICROSERVICIO_B_DB_USER || 'postgres',
      password: process.env.MICROSERVICIO_B_DB_PASSWORD || 'postgres123',
      database: process.env.MICROSERVICIO_B_DB_NAME || 'microservicio_b_db',
      entities: [Orden, EventosProcesado],
      synchronize: true,
      name: 'microservicio_b_db',
    }),
    // Base de datos de webhooks (compartida)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.WEBHOOKS_DB_HOST || 'localhost',
      port: parseInt(process.env.WEBHOOKS_DB_PORT || '5434'),
      username: process.env.WEBHOOKS_DB_USER || 'postgres',
      password: process.env.WEBHOOKS_DB_PASSWORD || 'postgres123',
      database: process.env.WEBHOOKS_DB_NAME || 'webhooks_db',
      entities: [WebhookSubscription, WebhookDelivery, CircuitBreakerStateEntity],
      synchronize: true,
      name: 'webhooks_db',
    }),
    TypeOrmModule.forFeature([Orden, EventosProcesado], 'microservicio_b_db'),
    TypeOrmModule.forFeature(
      [WebhookSubscription, WebhookDelivery, CircuitBreakerStateEntity],
      'webhooks_db',
    ),
    WebhookPublisherModule.forRoot('webhooks_db'),
  ],
  controllers: [OrdenesController, EventosConsumer],
  providers: [OrdenesService, RabbitMQPublisherService, ConfigService],
  exports: [ConfigService],
})
export class AppModule {}

