import { Injectable } from '@nestjs/common';
import { ClientProxyFactory, ClientProxy, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ReservaGatewayService {

  private reservaClient: ClientProxy;

  constructor(private config: ConfigService) {
    const rmqUrl = this.config.get<string>('RABBITMQ_URL');
    const queueReserva = this.config.get<string>('RABBITMQ_QUEUE_RESERVA');

    console.log('🐰 [Gateway] RABBITMQ_URL:', rmqUrl);
    console.log('📦 [Gateway] RABBITMQ_QUEUE_RESERVA:', queueReserva);

    if (!rmqUrl || !queueReserva) {
      throw new Error('❌ RabbitMQ envs NO cargados en Gateway');
    }

    this.reservaClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rmqUrl],
        queue: queueReserva,
        queueOptions: { durable: true },
      },
    });
  }

  async crearReserva(data: any) {
    console.log('➡️ [Gateway] Enviando reserva.crear', data);
    return await lastValueFrom(
      this.reservaClient.send('reserva.crear', data)
    );
  }

  async listarReservas() {
    console.log('➡️ [Gateway] Enviando reserva.listar');
    return await lastValueFrom(
      this.reservaClient.send('reserva.listar', {})
    );
  }

  async obtenerReserva(id: number) {
    console.log('➡️ [Gateway] Enviando reserva.obtener', id);
    return await lastValueFrom(
      this.reservaClient.send('reserva.obtener', { id })
    );
  }

  async crearMesa(data: any) {
    return await lastValueFrom(
      this.reservaClient.send('mesa.crear', data)
    );
  }

  async listarMesas() {
    return await lastValueFrom(
      this.reservaClient.send('mesa.listar', {})
    );
  }

  async obtenerMesa(id: number) {
    return await lastValueFrom(
      this.reservaClient.send('mesa.obtener', { id })
    );
  }

  async crearCliente(data: any) {
    return await lastValueFrom(
      this.reservaClient.send('cliente.crear', data)
    );
  }

  async listarClientes() {
    return await lastValueFrom(
      this.reservaClient.send('cliente.listar', {})
    );
  }

  async obtenerCliente(id: number) {
    return await lastValueFrom(
      this.reservaClient.send('cliente.obtener', { id })
    );
  }
}

