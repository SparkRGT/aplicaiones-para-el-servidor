import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './menu.entity';
import { Plato } from './plato.entity';
import { CategoriaMenu } from './categoria-menu.entity';
import { Idempotencia } from './idempotencia.entity';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class MenuService {
  private reservaClient: ClientProxy;

  constructor(
    @InjectRepository(Menu)
    private menuRepo: Repository<Menu>,
    @InjectRepository(Plato)
    private platoRepo: Repository<Plato>,
    @InjectRepository(CategoriaMenu)
    private categoriaRepo: Repository<CategoriaMenu>,
    @InjectRepository(Idempotencia)
    private idemRepo: Repository<Idempotencia>,
    private config: ConfigService,
  ) {
    this.reservaClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.config.get('RABBITMQ_URL')],
        queue: this.config.get('RABBITMQ_QUEUE_RESERVA'),
        queueOptions: { durable: true },
      },
    });
  }

  // Idempotencia
  async esDuplicado(key: string): Promise<boolean> {
    const existe = await this.idemRepo.findOne({
      where: { idempotency_key: key },
    });
    return !!existe;
  }

  async guardarClave(key: string) {
    const idem = this.idemRepo.create({
      idempotency_key: key,
      procesado_en: new Date().toISOString(),
    });
    await this.idemRepo.save(idem);
  }

  // Validar reserva en ReservaMS
  async validarReserva(reserva_id: number): Promise<{ reserva_id: number; existe: boolean }> {
    return this.reservaClient
      .send('reserva.validar', { reserva_id })
      .toPromise();
  }

  // Crear plato + evento + webhook
  async crearPlato(data: any): Promise<any> {
    // Idempotencia
    if (await this.esDuplicado(data.idempotency_key)) {
      return { mensaje: 'Plato ignorado (duplicado)' };
    }

    // Validar que el menú existe
    const menu = await this.menuRepo.findOne({ where: { id_menu: data.id_menu } });
    if (!menu) {
      throw new BadRequestException(`El menú ${data.id_menu} no existe`);
    }

    // Validar que la categoría existe
    const categoria = await this.categoriaRepo.findOne({ where: { id_categoria: data.id_categoria } });
    if (!categoria) {
      throw new BadRequestException(`La categoría ${data.id_categoria} no existe`);
    }

    // Guardar plato
    const plato = this.platoRepo.create(data as Partial<Plato>);
    const platoGuardado = await this.platoRepo.save(plato);

    // Registrar idempotencia
    await this.guardarClave(data.idempotency_key);

    // Evento interno (RabbitMQ)
    await this.reservaClient.emit('plato.creado', {
      plato_id: platoGuardado.id_plato,
      ...data,
    });

    // Webhook externo
    const payload = {
      event: 'plato_creado',
      version: '1.0',
      idempotency_key: data.idempotency_key,
      timestamp: new Date().toISOString(),
      data: {
        plato_id: platoGuardado.id_plato,
        nombre: platoGuardado.nombre,
        descripcion: platoGuardado.descripcion,
        precio: platoGuardado.precio,
        disponible: platoGuardado.disponible,
        id_menu: platoGuardado.id_menu,
        id_categoria: platoGuardado.id_categoria,
      },
      metadata: {
        source: 'MenuMS',
        environment: 'local',
      },
    };

    if (!process.env.WEBHOOK_SECRET) {
      throw new Error('WEBHOOK_SECRET no está definido');
    }

    if (!process.env.WEBHOOK_URL) {
      throw new Error('WEBHOOK_URL no está definido');
    }

    // Firmar BODY CRUDO
    const rawBody = JSON.stringify(payload);

    const signature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    try {
      await axios.post(
        process.env.WEBHOOK_URL,
        rawBody,
        {
          headers: {
            'X-Signature': signature,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          },
        },
      );
    } catch (error: any) {
      console.error('Error enviando webhook plato_creado:', error.message);
    }

    return platoGuardado;
  }

  // Gestión de Menús
  async crearMenu(data: Partial<Menu>) {
    if (!data.fecha) {
      throw new BadRequestException('El campo fecha es obligatorio');
    }
    const menu = this.menuRepo.create(data);
    return this.menuRepo.save(menu);
  }

  async obtenerMenus() {
    return this.menuRepo.find({ relations: ['platos'] });
  }

  async obtenerMenuPorId(id: number) {
    return this.menuRepo.findOne({ 
      where: { id_menu: id },
      relations: ['platos', 'platos.categoria']
    });
  }

  // Queries de Platos
  async listarPlatos() {
    return this.platoRepo.find({ relations: ['categoria', 'menu'] });
  }

  async obtenerPlatoPorId(id: number) {
    return this.platoRepo.findOne({ 
      where: { id_plato: id },
      relations: ['categoria', 'menu']
    });
  }

  async listarPlatosPorMenu(menu_id: number) {
    return this.platoRepo.find({ 
      where: { id_menu: menu_id },
      relations: ['categoria']
    });
  }

  // Gestión de Categorías
  async crearCategoria(data: Partial<CategoriaMenu>) {
    if (!data.nombre) {
      throw new BadRequestException('El campo nombre es obligatorio');
    }
    const categoria = this.categoriaRepo.create(data);
    return this.categoriaRepo.save(categoria);
  }

  async obtenerCategorias() {
    return this.categoriaRepo.find();
  }

  async obtenerCategoriaPorId(id: number) {
    return this.categoriaRepo.findOne({ where: { id_categoria: id } });
  }
}

