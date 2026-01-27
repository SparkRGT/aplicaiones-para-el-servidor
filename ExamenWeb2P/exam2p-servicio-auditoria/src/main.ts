import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Crear aplicación HTTP
  const app = await NestFactory.create(AppModule);

  // Configurar ValidationPipe global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Habilitar CORS
  app.enableCors();

  // Conectar microservicio RabbitMQ para escuchar eventos con @EventPattern
  const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  const rabbitmqQueue = process.env.RABBITMQ_QUEUE || 'auditoria_queue';

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: rabbitmqQueue,
      queueOptions: {
        durable: true,
      },
      noAck: false, // Requiere acknowledge manual
    },
  });

  // Iniciar microservicios (RabbitMQ listener)
  await app.startAllMicroservices();
  logger.log(`🐰 RabbitMQ conectado - Escuchando cola: ${rabbitmqQueue}`);

  // Iniciar servidor HTTP
  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log('============================================================');
  logger.log(`✅ Microservicio NestJS iniciado en puerto ${port}`);
  logger.log('============================================================');
  logger.log('📍 Endpoints HTTP:');
  logger.log(`   • Health: http://localhost:${port}/health`);
  logger.log(`   • Auditorías: http://localhost:${port}/auditorias`);
  logger.log(`   • Emitir evento: POST http://localhost:${port}/auditorias/emitir-eliminado`);
  logger.log('');
  logger.log('📡 RabbitMQ Events:');
  logger.log('   • @EventPattern("exam2p.registro.eliminado") - Escuchando');
  logger.log('============================================================');
}
bootstrap();
