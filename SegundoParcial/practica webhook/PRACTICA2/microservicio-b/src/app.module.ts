import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orden } from './entities/orden.entity';
import { EventosProcesado } from './entities/eventos-procesado.entity';
import { OrdenesController } from './controllers/ordenes.controller';
import { OrdenesService } from './services/ordenes.service';
import { EventosConsumer } from './consumers/eventos.consumer';
import { RabbitMQPublisherService } from './publishers/rabbitmq-publisher.service';
import { ConfigService } from './config/config.service';
import { WebhookPublisherService } from './services/webhook-publisher.service';
import { WebhookSecurityService } from './services/webhook-security.service';
import { CircuitBreakerService } from './services/circuit-breaker.service';

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
    TypeOrmModule.forFeature([Orden, EventosProcesado], 'microservicio_b_db'),
  ],
  controllers: [OrdenesController, EventosConsumer],
  providers: [
    OrdenesService,
    RabbitMQPublisherService,
    ConfigService,
    WebhookPublisherService,
    WebhookSecurityService,
    CircuitBreakerService,
  ],
  exports: [ConfigService, WebhookPublisherService],
})
export class AppModule {}

