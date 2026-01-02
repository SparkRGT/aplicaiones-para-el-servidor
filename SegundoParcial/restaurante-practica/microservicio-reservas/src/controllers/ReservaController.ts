import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Reserva } from '../entities/Reserva';
import { Mesa } from '../entities/Mesa';
import { EventPublisher, ReservaEvents } from '../events/EventPublisher';

export class ReservaController {
  private eventPublisher: EventPublisher;

  constructor() {
    this.eventPublisher = new EventPublisher();
    this.eventPublisher.connect();
  }

  // Obtener todas las reservas
  async getAllReservas(req: Request, res: Response): Promise<void> {
    try {
      const reservaRepository = AppDataSource.getRepository(Reserva);
      const reservas = await reservaRepository.find({
        relations: ['mesa'],
        order: { fecha: 'DESC', hora_inicio: 'ASC' },
      });
      res.json(reservas);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las reservas' });
    }
  }

  // Obtener una reserva por ID
  async getReservaById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const reservaRepository = AppDataSource.getRepository(Reserva);
      const reserva = await reservaRepository.findOne({
        where: { id_reserva: parseInt(id) },
        relations: ['mesa'],
      });

      if (!reserva) {
        res.status(404).json({ error: 'Reserva no encontrada' });
        return;
      }

      res.json(reserva);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener la reserva' });
    }
  }

  // Crear una nueva reserva
  async createReserva(req: Request, res: Response): Promise<void> {
    try {
      const { id_cliente, id_mesa, fecha, hora_inicio, hora_fin } = req.body;
      const reservaRepository = AppDataSource.getRepository(Reserva);
      const mesaRepository = AppDataSource.getRepository(Mesa);

      // Verificar que la mesa existe y está disponible
      const mesa = await mesaRepository.findOne({
        where: { id_mesa },
      });

      if (!mesa) {
        res.status(404).json({ error: 'Mesa no encontrada' });
        return;
      }

      if (mesa.estado === 'ocupada' || mesa.estado === 'reservada') {
        res.status(400).json({ 
          error: 'La mesa no está disponible',
          estado_actual: mesa.estado 
        });
        return;
      }

      // Verificar conflictos de horario
      const reservasExistentes = await reservaRepository.find({
        where: {
          id_mesa,
          fecha: new Date(fecha),
          estado: 'confirmada',
        },
      });

      const hayConflicto = reservasExistentes.some((r) => {
        const inicioReserva = r.hora_inicio;
        const finReserva = r.hora_fin;
        return (
          (hora_inicio >= inicioReserva && hora_inicio < finReserva) ||
          (hora_fin > inicioReserva && hora_fin <= finReserva) ||
          (hora_inicio <= inicioReserva && hora_fin >= finReserva)
        );
      });

      if (hayConflicto) {
        res.status(400).json({ error: 'Ya existe una reserva en ese horario' });
        return;
      }

      // Crear la reserva
      const reserva = new Reserva();
      reserva.id_cliente = id_cliente;
      reserva.id_mesa = id_mesa;
      reserva.fecha = new Date(fecha);
      reserva.hora_inicio = hora_inicio;
      reserva.hora_fin = hora_fin;
      reserva.estado = 'pendiente';

      const savedReserva = await reservaRepository.save(reserva);

      // Actualizar estado de la mesa
      mesa.estado = 'reservada';
      await mesaRepository.save(mesa);

      // Publicar evento de reserva creada
      await this.eventPublisher.publish({
        type: ReservaEvents.RESERVA_CREADA,
        payload: {
          id_reserva: savedReserva.id_reserva,
          id_cliente: savedReserva.id_cliente,
          id_mesa: savedReserva.id_mesa,
          fecha: savedReserva.fecha,
          hora_inicio: savedReserva.hora_inicio,
          hora_fin: savedReserva.hora_fin,
        },
        timestamp: new Date(),
        source: 'microservicio-reservas',
      });

      // Publicar evento de mesa reservada
      await this.eventPublisher.publish({
        type: ReservaEvents.MESA_RESERVADA,
        payload: {
          id_mesa: mesa.id_mesa,
          numero: mesa.numero,
          estado: mesa.estado,
        },
        timestamp: new Date(),
        source: 'microservicio-reservas',
      });

      res.status(201).json(savedReserva);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear la reserva' });
    }
  }

  // Confirmar una reserva
  async confirmarReserva(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const reservaRepository = AppDataSource.getRepository(Reserva);

      const reserva = await reservaRepository.findOne({
        where: { id_reserva: parseInt(id) },
      });

      if (!reserva) {
        res.status(404).json({ error: 'Reserva no encontrada' });
        return;
      }

      reserva.estado = 'confirmada';
      const updatedReserva = await reservaRepository.save(reserva);

      // Publicar evento
      await this.eventPublisher.publish({
        type: ReservaEvents.RESERVA_CONFIRMADA,
        payload: {
          id_reserva: updatedReserva.id_reserva,
          id_cliente: updatedReserva.id_cliente,
          id_mesa: updatedReserva.id_mesa,
        },
        timestamp: new Date(),
        source: 'microservicio-reservas',
      });

      res.json(updatedReserva);
    } catch (error) {
      res.status(500).json({ error: 'Error al confirmar la reserva' });
    }
  }

  // Cancelar una reserva
  async cancelarReserva(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const reservaRepository = AppDataSource.getRepository(Reserva);
      const mesaRepository = AppDataSource.getRepository(Mesa);

      const reserva = await reservaRepository.findOne({
        where: { id_reserva: parseInt(id) },
        relations: ['mesa'],
      });

      if (!reserva) {
        res.status(404).json({ error: 'Reserva no encontrada' });
        return;
      }

      reserva.estado = 'cancelada';
      await reservaRepository.save(reserva);

      // Liberar la mesa
      if (reserva.mesa) {
        reserva.mesa.estado = 'disponible';
        await mesaRepository.save(reserva.mesa);

        // Publicar evento de mesa liberada
        await this.eventPublisher.publish({
          type: ReservaEvents.MESA_LIBERADA,
          payload: {
            id_mesa: reserva.mesa.id_mesa,
            numero: reserva.mesa.numero,
            estado: reserva.mesa.estado,
          },
          timestamp: new Date(),
          source: 'microservicio-reservas',
        });
      }

      // Publicar evento de reserva cancelada
      await this.eventPublisher.publish({
        type: ReservaEvents.RESERVA_CANCELADA,
        payload: {
          id_reserva: reserva.id_reserva,
          id_cliente: reserva.id_cliente,
          id_mesa: reserva.id_mesa,
        },
        timestamp: new Date(),
        source: 'microservicio-reservas',
      });

      res.json({ message: 'Reserva cancelada correctamente', reserva });
    } catch (error) {
      res.status(500).json({ error: 'Error al cancelar la reserva' });
    }
  }

  // Obtener reservas por cliente
  async getReservasByCliente(req: Request, res: Response): Promise<void> {
    try {
      const { clienteId } = req.params;
      const reservaRepository = AppDataSource.getRepository(Reserva);
      const reservas = await reservaRepository.find({
        where: { id_cliente: parseInt(clienteId) },
        relations: ['mesa'],
        order: { fecha: 'DESC' },
      });
      res.json(reservas);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las reservas del cliente' });
    }
  }

  // Obtener reservas por fecha
  async getReservasByFecha(req: Request, res: Response): Promise<void> {
    try {
      const { fecha } = req.params;
      const reservaRepository = AppDataSource.getRepository(Reserva);
      const reservas = await reservaRepository.find({
        where: { fecha: new Date(fecha) },
        relations: ['mesa'],
        order: { hora_inicio: 'ASC' },
      });
      res.json(reservas);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las reservas por fecha' });
    }
  }
}

