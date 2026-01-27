import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { ProductosController } from './controllers/productos.controller';
import { AuditController } from './controllers/audit.controller';
import { ProductosService } from './services/productos.service';
import { RabbitMQPublisherService } from './publishers/rabbitmq-publisher.service';
import { SupabaseAuditService } from './services/supabase-audit.service';
import { ConfigService } from './config/config.service';
import { 
  WebhookPublisherModule,
  WebhookSubscription,
  WebhookDelivery,
  CircuitBreakerStateEntity
} from 'webhook-publisher';

@Module({
  imports: [
    // Base de datos del microservicio A
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.MICROSERVICIO_A_DB_HOST || 'localhost',
      port: parseInt(process.env.MICROSERVICIO_A_DB_PORT || '5435'),
      username: process.env.MICROSERVICIO_A_DB_USER || 'postgres',
      password: process.env.MICROSERVICIO_A_DB_PASSWORD || 'postgres123',
      database: process.env.MICROSERVICIO_A_DB_NAME || 'microservicio_a_db',
      entities: [Producto],
      synchronize: true,
      name: 'microservicio_a_db',
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
    TypeOrmModule.forFeature([Producto], 'microservicio_a_db'),
    TypeOrmModule.forFeature(
      [WebhookSubscription, WebhookDelivery, CircuitBreakerStateEntity],
      'webhooks_db',
    ),
    WebhookPublisherModule.forRoot('webhooks_db'),
  ],
  controllers: [ProductosController, AuditController],
  providers: [ProductosService, RabbitMQPublisherService, SupabaseAuditService, ConfigService],
  exports: [ConfigService],
})
export class AppModule {}

