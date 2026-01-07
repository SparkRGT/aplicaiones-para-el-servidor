import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comentario } from './comentario.entity';
import { Idempotencia } from './idempotencia.entity';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class ComentarioService {

  private servicioClient: ClientProxy;

  constructor(
    @InjectRepository(Comentario)
    private comentarioRepo: Repository<Comentario>,

    @InjectRepository(Idempotencia)
    private idemRepo: Repository<Idempotencia>,

    private config: ConfigService,
  ) {
    this.servicioClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.config.get('RABBITMQ_URL')],
        queue: this.config.get('RABBITMQ_QUEUE_SERVICIO'),
        queueOptions: { durable: true },
      },
    });
  }

  // 1️⃣ Idempotencia
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

  // 2️⃣ Validar servicio en ServicioMS
  async validarServicio(servicio_id: number): Promise<{ servicio_id: number; existe: boolean }> {
    return this.servicioClient
      .send('servicio.validar', { servicio_id })
      .toPromise();
  }

  // 3️⃣ Crear comentario + evento + webhook
  async crearComentario(data: any): Promise<any> {

    // Idempotencia
    if (await this.esDuplicado(data.idempotency_key)) {
      return { mensaje: 'Comentario ignorado (duplicado)' };
    }

    // Validar servicio
    const validacion = await this.validarServicio(data.servicio_id);
    if (!validacion.existe) {
      throw new Error(`Servicio ${data.servicio_id} no existe`);
    }

    // Guardar comentario
    const comentario = this.comentarioRepo.create(data as Partial<Comentario>);
    const comentarioGuardado = await this.comentarioRepo.save(comentario);

    // Registrar idempotencia
    await this.guardarClave(data.idempotency_key);

    // Evento interno (RabbitMQ)
    await this.servicioClient.emit('comentario.creado', {
      comentario_id: comentarioGuardado.id,
      ...data,
    });

    // Webhook externo
    const payload = {
      event: 'comentario_creado',
      version: '1.0',
      idempotency_key: data.idempotency_key,
      timestamp: new Date().toISOString(),
      data: {
        comentario_id: comentarioGuardado.id,
        servicio_id: comentarioGuardado.servicio_id,
        cliente_id: comentarioGuardado.cliente_id,
        titulo: comentarioGuardado.titulo,
        texto: comentarioGuardado.texto,
      },
      metadata: {
        source: 'ComentarioMS',
        environment: 'local',
      },
    };

    if (!process.env.WEBHOOK_SECRET) {
      throw new Error('WEBHOOK_SECRET no está definido');
    }

    if (!process.env.WEBHOOK_URL) {
      throw new Error('WEBHOOK_URL no está definido');
    }

    // 🔐 Firmar BODY CRUDO
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
      console.error('Error enviando webhook comentario_creado:', error.message);
    }

    return comentarioGuardado;
  }

  // 4️⃣ Queries
  async listarComentarios() {
    return this.comentarioRepo.find();
  }

  async obtenerComentarioPorId(id: number) {
    return this.comentarioRepo.findOne({ where: { id } });
  }

  async listarComentariosPorServicio(servicio_id: number) {
    return this.comentarioRepo.find({ where: { servicio_id } });
  }
}
