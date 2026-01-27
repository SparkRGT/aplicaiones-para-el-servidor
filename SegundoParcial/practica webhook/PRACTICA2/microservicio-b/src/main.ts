import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  app.setGlobalPrefix('api');
  
  // Configurar RabbitMQ como microservicio para consumir eventos
  const rabbitmqUrl = `amqp://${process.env.RABBITMQ_USER || 'admin'}:${process.env.RABBITMQ_PASSWORD || 'admin123'}@${process.env.RABBITMQ_HOST || 'localhost'}:${process.env.RABBITMQ_PORT || 5672}`;
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: process.env.RABBITMQ_QUEUE_EVENTS || 'eventos_queue',
      queueOptions: {
        durable: true,
      },
    },
  });
  
  await app.startAllMicroservices();
  
  const port = process.env.MICROSERVICIO_B_PORT || 3002;
  await app.listen(port);
  
  console.log(`🚀 Microservicio B corriendo en http://localhost:${port}`);
  console.log(`📨 Escuchando eventos de RabbitMQ: ${rabbitmqUrl}`);
}

bootstrap();

