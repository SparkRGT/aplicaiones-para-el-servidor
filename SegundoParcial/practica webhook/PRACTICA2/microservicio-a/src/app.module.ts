import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { ProductosController } from './controllers/productos.controller';
import { AuditController } from './controllers/audit.controller';
import { ProductosService } from './services/productos.service';
import { RabbitMQPublisherService } from './publishers/rabbitmq-publisher.service';
import { SupabaseAuditService } from './services/supabase-audit.service';
import { ConfigService } from './config/config.service';
import { WebhookPublisherService } from './services/webhook-publisher.service';
import { WebhookSecurityService } from './services/webhook-security.service';
import { CircuitBreakerService } from './services/circuit-breaker.service';

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
    TypeOrmModule.forFeature([Producto], 'microservicio_a_db'),
  ],
  controllers: [ProductosController, AuditController],
  providers: [
    ProductosService,
    RabbitMQPublisherService,
    SupabaseAuditService,
    ConfigService,
    WebhookPublisherService,
    WebhookSecurityService,
    CircuitBreakerService,
  ],
  exports: [ConfigService, WebhookPublisherService],
})
export class AppModule {}

