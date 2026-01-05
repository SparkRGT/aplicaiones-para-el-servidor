import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva } from './reserva.entity';
import { Mesa } from './mesa.entity';
import { Cliente } from './cliente.entity';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class ReservaService {
  constructor(
    @InjectRepository(Reserva)
    private reservaRepo: Repository<Reserva>,
    @InjectRepository(Mesa)
    private mesaRepo: Repository<Mesa>,
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,
  ) {}

  // Verificar si existe reserva
  async existeReserva(id: number): Promise<boolean> {
    const count = await this.reservaRepo.count({ where: { id_reserva: id } });
    return count > 0;
  }

  // Verificar si existe mesa
  async existeMesa(id: number): Promise<boolean> {
    const count = await this.mesaRepo.count({ where: { id_mesa: id } });
    return count > 0;
  }

  // Verificar si existe cliente
  async existeCliente(id: number): Promise<boolean> {
    const count = await this.clienteRepo.count({ where: { id_cliente: id } });
    return count > 0;
  }

  // Crear reserva + webhook
  async crearReserva(data: Partial<Reserva>) {
    if (!data.id_cliente || !data.id_mesa || !data.fecha) {
      throw new BadRequestException('Los campos id_cliente, id_mesa y fecha son obligatorios');
    }

    // Validar que la mesa existe y está disponible
    const mesa = await this.mesaRepo.findOne({ where: { id_mesa: data.id_mesa } });
    if (!mesa) {
      throw new BadRequestException(`La mesa ${data.id_mesa} no existe`);
    }
    if (mesa.estado !== 'disponible') {
      throw new BadRequestException(`La mesa ${data.id_mesa} no está disponible`);
    }

    // Validar que el cliente existe
    const cliente = await this.clienteRepo.findOne({ where: { id_cliente: data.id_cliente } });
    if (!cliente) {
      throw new BadRequestException(`El cliente ${data.id_cliente} no existe`);
    }

    // Establecer estado por defecto
    if (!data.estado) {
      data.estado = 'pendiente';
    }

    // Guardar reserva
    const reserva = this.reservaRepo.create(data);
    const reservaGuardada = await this.reservaRepo.save(reserva);

    // Actualizar estado de la mesa
    mesa.estado = 'reservada';
    await this.mesaRepo.save(mesa);

    // Payload del webhook
    const payload = {
      event: 'reserva_creada',
      version: '1.0',
      idempotency_key: `reserva-${reservaGuardada.id_reserva}-creada`,
      timestamp: new Date().toISOString(),
      data: {
        reserva_id: reservaGuardada.id_reserva,
        id_cliente: reservaGuardada.id_cliente,
        id_mesa: reservaGuardada.id_mesa,
        fecha: reservaGuardada.fecha,
        hora_inicio: reservaGuardada.hora_inicio,
        hora_fin: reservaGuardada.hora_fin,
        estado: reservaGuardada.estado,
      },
      metadata: {
        source: 'ReservaMS',
        environment: 'local',
      },
    };

    // Firmar el BODY CRUDO
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

    // Enviar webhook
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
        'Error enviando webhook reserva_creada:',
        error?.response?.data || error.message,
      );
    }

    return reservaGuardada;
  }

  async obtenerReservas() {
    return this.reservaRepo.find();
  }

  async obtenerReservaPorId(id: number) {
    return this.reservaRepo.findOne({ where: { id_reserva: id } });
  }

  // Gestión de Mesas
  async crearMesa(data: Partial<Mesa>) {
    if (!data.numero || !data.capacidad) {
      throw new BadRequestException('Los campos numero y capacidad son obligatorios');
    }
    if (!data.estado) {
      data.estado = 'disponible';
    }
    const mesa = this.mesaRepo.create(data);
    return this.mesaRepo.save(mesa);
  }

  async obtenerMesas() {
    return this.mesaRepo.find();
  }

  async obtenerMesaPorId(id: number) {
    return this.mesaRepo.findOne({ where: { id_mesa: id } });
  }

  // Gestión de Clientes
  async crearCliente(data: Partial<Cliente>) {
    if (!data.nombre || !data.correo || !data.telefono) {
      throw new BadRequestException('Los campos nombre, correo y telefono son obligatorios');
    }
    const cliente = this.clienteRepo.create(data);
    return this.clienteRepo.save(cliente);
  }

  async obtenerClientes() {
    return this.clienteRepo.find();
  }

  async obtenerClientePorId(id: number) {
    return this.clienteRepo.findOne({ where: { id_cliente: id } });
  }
}

