import * as amqp from 'amqplib';

export interface Event {
  type: string;
  payload: any;
  timestamp: Date;
  source: string;
}

export class EventPublisher {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private exchangeName: string;

  constructor(exchangeName: string = 'restaurante_events') {
    this.exchangeName = exchangeName;
  }

  async connect(): Promise<void> {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
      const conn = await amqp.connect(rabbitmqUrl);
      this.connection = conn as any;
      
      this.channel = await conn.createChannel();
      
      // Declarar exchange de tipo topic para routing flexible
      await this.channel.assertExchange(this.exchangeName, 'topic', {
        durable: true,
      });

      console.log('✅ Conectado a RabbitMQ para publicación de eventos');
    } catch (error) {
      console.error('❌ Error al conectar con RabbitMQ:', error);
      // En desarrollo, continuar sin RabbitMQ
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Continuando sin RabbitMQ (modo desarrollo)');
      } else {
        throw error;
      }
    }
  }

  async publish(event: Event): Promise<void> {
    if (!this.channel) {
      console.warn('⚠️ RabbitMQ no disponible, evento no publicado:', event.type);
      return;
    }

    try {
      const routingKey = `reservas.${event.type}`;
      const message = JSON.stringify({
        ...event,
        timestamp: event.timestamp.toISOString(),
      });

      const published = this.channel.publish(
        this.exchangeName,
        routingKey,
        Buffer.from(message),
        { persistent: true }
      );

      if (published) {
        console.log(`📤 Evento publicado: ${routingKey}`);
      } else {
        console.warn(`⚠️ Evento no publicado (cola llena): ${routingKey}`);
      }
    } catch (error) {
      console.error('❌ Error al publicar evento:', error);
    }
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await (this.connection as any).close();
        this.connection = null;
      }
    } catch (error) {
      console.error('❌ Error al cerrar conexión RabbitMQ:', error);
    }
  }
}

// Eventos específicos del dominio de reservas
export class ReservaEvents {
  static RESERVA_CREADA = 'reserva.creada';
  static RESERVA_CONFIRMADA = 'reserva.confirmada';
  static RESERVA_CANCELADA = 'reserva.cancelada';
  static RESERVA_COMPLETADA = 'reserva.completada';
  static MESA_RESERVADA = 'mesa.reservada';
  static MESA_LIBERADA = 'mesa.liberada';
}

