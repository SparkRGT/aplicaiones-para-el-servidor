import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servicio } from './servicio.entity';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class ServicioService {
  constructor(
    @InjectRepository(Servicio)
    private repo: Repository<Servicio>,
  ) {}

  // Verificar si existe servicio
  async existeServicio(id: number): Promise<boolean> {
    const count = await this.repo.count({ where: { id } });
    return count > 0;
  }

  // Crear servicio + webhook
  async crearServicio(data: Partial<Servicio>) {
    if (!data.nombre_servicio) {
      throw new BadRequestException('El nombre del servicio es obligatorio');
    }

    // 1️⃣ Guardar servicio
    const servicio = this.repo.create(data);
    const servicioGuardado = await this.repo.save(servicio);

    // 2️⃣ Payload del webhook
    const payload = {
      event: 'servicio_creado',
      version: '1.0',
      idempotency_key: `servicio-${servicioGuardado.id}-creado`,
      timestamp: new Date().toISOString(),
      data: {
        servicio_id: servicioGuardado.id,
        nombre_servicio: servicioGuardado.nombre_servicio,
        descripcion: servicioGuardado.descripcion,
        duracion: servicioGuardado.duracion,
        proveedor_id: servicioGuardado.proveedor_id,
        categoria_id: servicioGuardado.categoria_id,
      },
      metadata: {
        source: 'ServicioMS',
        environment: 'local',
      },
    };

    // 3️⃣ Firmar el BODY CRUDO
    if (!process.env.WEBHOOK_SECRET) {
      throw new Error('WEBHOOK_SECRET no está definido');
    }

    if (!process.env.WEBHOOK_URL) {
      throw new Error('WEBHOOK_URL no está definido');
    }

    const rawBody = JSON.stringify(payload);

    const signature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    // 4️⃣ Enviar webhook
    try {
      console.log('Webhook enviado:', rawBody);
      console.log('Firma:', signature);

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
      console.error(
        'Error enviando webhook servicio_creado:',
        error?.response?.data || error.message,
      );
    }

    return servicioGuardado;
  }

  async obtenerServicios() {
    return this.repo.find();
  }

  async obtenerServicioPorId(id: number) {
    return this.repo.findOne({ where: { id } });
  }
}
