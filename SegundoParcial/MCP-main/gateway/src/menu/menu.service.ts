import { Injectable } from '@nestjs/common';
import { ClientProxyFactory, ClientProxy, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class MenuGatewayService {

  private menuClient: ClientProxy;

  constructor(private config: ConfigService) {
    const rmqUrl = this.config.get<string>('RABBITMQ_URL');
    const queueMenu = this.config.get<string>('RABBITMQ_QUEUE_MENU');

    console.log('🐰 [Gateway] RABBITMQ_URL:', rmqUrl);
    console.log('📦 [Gateway] RABBITMQ_QUEUE_MENU:', queueMenu);

    if (!rmqUrl || !queueMenu) {
      throw new Error('❌ RabbitMQ envs NO cargados en Gateway');
    }

    this.menuClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rmqUrl],
        queue: queueMenu,
        queueOptions: { durable: true },
      },
    });
  }

  async crearPlato(data: any) {
    console.log('➡️ [Gateway] Enviando plato.crear', data);
    return await lastValueFrom(
      this.menuClient.send('plato.crear', data)
    );
  }

  async listarPlatos() {
    console.log('➡️ [Gateway] Enviando plato.listar');
    return await lastValueFrom(
      this.menuClient.send('plato.listar', {})
    );
  }

  async obtenerPlato(id: number) {
    console.log('➡️ [Gateway] Enviando plato.obtener', id);
    return await lastValueFrom(
      this.menuClient.send('plato.obtener', { id })
    );
  }

  async listarPlatosPorMenu(menu_id: number) {
    return await lastValueFrom(
      this.menuClient.send('plato.listar_por_menu', { menu_id })
    );
  }

  async crearMenu(data: any) {
    return await lastValueFrom(
      this.menuClient.send('menu.crear', data)
    );
  }

  async listarMenus() {
    return await lastValueFrom(
      this.menuClient.send('menu.listar', {})
    );
  }

  async obtenerMenu(id: number) {
    return await lastValueFrom(
      this.menuClient.send('menu.obtener', { id })
    );
  }

  async crearCategoria(data: any) {
    return await lastValueFrom(
      this.menuClient.send('categoria.crear', data)
    );
  }

  async listarCategorias() {
    return await lastValueFrom(
      this.menuClient.send('categoria.listar', {})
    );
  }

  async obtenerCategoria(id: number) {
    return await lastValueFrom(
      this.menuClient.send('categoria.obtener', { id })
    );
  }
}

