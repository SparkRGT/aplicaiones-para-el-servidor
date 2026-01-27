import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQPublisherService implements OnModuleInit, OnModuleDestroy {
  private connection: any;
  private channel: any;
  private readonly exchange = process.env.RABBITMQ_EXCHANGE || 'eventos_exchange';

  async onModuleInit() {
    const rabbitmqUrl = `amqp://${process.env.RABBITMQ_USER || 'admin'}:${process.env.RABBITMQ_PASSWORD || 'admin123'}@${process.env.RABBITMQ_HOST || 'localhost'}:${process.env.RABBITMQ_PORT || 5672}`;
    
    try {
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      // Declarar exchange
      await this.channel.assertExchange(this.exchange, 'topic', {
        durable: true,
      });
      
      console.log('✅ Conectado a RabbitMQ y exchange declarado');
    } catch (error) {
      console.error('❌ Error conectando a RabbitMQ:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }

  async publicarEvento(evento: any): Promise<void> {
    try {
      const routingKey = evento.eventType.replace('.', '.');
      const mensaje = JSON.stringify(evento);
      
      this.channel.publish(this.exchange, routingKey, Buffer.from(mensaje), {
        persistent: true,
        timestamp: Date.now(),
      });
      
      console.log(`📤 Evento publicado: ${evento.eventType} (${evento.eventId})`);
    } catch (error) {
      console.error('❌ Error publicando evento:', error);
      throw error;
    }
  }
}

