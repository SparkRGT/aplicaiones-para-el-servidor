import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Mesa } from '../entities/Mesa';

export class MesaController {
  // Obtener todas las mesas
  async getAllMesas(req: Request, res: Response): Promise<void> {
    try {
      const mesaRepository = AppDataSource.getRepository(Mesa);
      const mesas = await mesaRepository.find({
        relations: ['reservas'],
      });
      res.json(mesas);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las mesas' });
    }
  }

  // Obtener una mesa por ID
  async getMesaById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const mesaRepository = AppDataSource.getRepository(Mesa);
      const mesa = await mesaRepository.findOne({
        where: { id_mesa: parseInt(id) },
        relations: ['reservas'],
      });

      if (!mesa) {
        res.status(404).json({ error: 'Mesa no encontrada' });
        return;
      }

      res.json(mesa);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener la mesa' });
    }
  }

  // Crear una nueva mesa
  async createMesa(req: Request, res: Response): Promise<void> {
    try {
      const { numero, capacidad, estado } = req.body;
      const mesaRepository = AppDataSource.getRepository(Mesa);

      // Verificar que el número de mesa no exista
      const mesaExistente = await mesaRepository.findOne({
        where: { numero },
      });

      if (mesaExistente) {
        res.status(400).json({ error: 'Ya existe una mesa con ese número' });
        return;
      }

      const mesa = new Mesa();
      mesa.numero = numero;
      mesa.capacidad = capacidad;
      mesa.estado = estado || 'disponible';

      const savedMesa = await mesaRepository.save(mesa);
      res.status(201).json(savedMesa);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear la mesa' });
    }
  }

  // Actualizar una mesa
  async updateMesa(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { numero, capacidad, estado } = req.body;
      const mesaRepository = AppDataSource.getRepository(Mesa);

      const mesa = await mesaRepository.findOne({
        where: { id_mesa: parseInt(id) },
      });

      if (!mesa) {
        res.status(404).json({ error: 'Mesa no encontrada' });
        return;
      }

      if (numero) mesa.numero = numero;
      if (capacidad !== undefined) mesa.capacidad = capacidad;
      if (estado) mesa.estado = estado;

      const updatedMesa = await mesaRepository.save(mesa);
      res.json(updatedMesa);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la mesa' });
    }
  }

  // Eliminar una mesa
  async deleteMesa(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const mesaRepository = AppDataSource.getRepository(Mesa);

      const result = await mesaRepository.delete({ id_mesa: parseInt(id) });

      if (result.affected === 0) {
        res.status(404).json({ error: 'Mesa no encontrada' });
        return;
      }

      res.json({ message: 'Mesa eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar la mesa' });
    }
  }

  // Obtener mesas disponibles
  async getMesasDisponibles(req: Request, res: Response): Promise<void> {
    try {
      const mesaRepository = AppDataSource.getRepository(Mesa);
      const mesas = await mesaRepository.find({
        where: { estado: 'disponible' },
      });
      res.json(mesas);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las mesas disponibles' });
    }
  }

  // Obtener mesas por capacidad
  async getMesasByCapacidad(req: Request, res: Response): Promise<void> {
    try {
      const { capacidad } = req.params;
      const mesaRepository = AppDataSource.getRepository(Mesa);
      const mesas = await mesaRepository
        .createQueryBuilder('mesa')
        .where('mesa.capacidad >= :capacidad', { capacidad: parseInt(capacidad) })
        .andWhere('mesa.estado = :estado', { estado: 'disponible' })
        .getMany();
      res.json(mesas);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las mesas por capacidad' });
    }
  }
}

