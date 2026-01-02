import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Plato } from '../entities/Plato';
import { CategoriaMenu } from '../entities/CategoriaMenu';

export class PlatoController {
  // Obtener todos los platos
  async getAllPlatos(req: Request, res: Response): Promise<void> {
    try {
      const platoRepository = AppDataSource.getRepository(Plato);
      const platos = await platoRepository.find({
        relations: ['categoria', 'menu'],
      });
      res.json(platos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los platos' });
    }
  }

  // Obtener un plato por ID
  async getPlatoById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const platoRepository = AppDataSource.getRepository(Plato);
      const plato = await platoRepository.findOne({
        where: { id_plato: parseInt(id) },
        relations: ['categoria', 'menu'],
      });

      if (!plato) {
        res.status(404).json({ error: 'Plato no encontrado' });
        return;
      }

      res.json(plato);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el plato' });
    }
  }

  // Crear un nuevo plato
  async createPlato(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, descripcion, precio, disponible, id_categoria, id_menu } = req.body;
      const platoRepository = AppDataSource.getRepository(Plato);
      const categoriaRepository = AppDataSource.getRepository(CategoriaMenu);

      // Verificar que la categoría existe
      const categoria = await categoriaRepository.findOne({
        where: { id_categoria },
      });

      if (!categoria) {
        res.status(404).json({ error: 'Categoría no encontrada' });
        return;
      }

      const plato = new Plato();
      plato.nombre = nombre;
      plato.descripcion = descripcion;
      plato.precio = precio;
      plato.disponible = disponible !== undefined ? disponible : true;
      plato.id_categoria = id_categoria;
      if (id_menu) plato.id_menu = id_menu;

      const savedPlato = await platoRepository.save(plato);
      res.status(201).json(savedPlato);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el plato' });
    }
  }

  // Actualizar un plato
  async updatePlato(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nombre, descripcion, precio, disponible, id_categoria } = req.body;
      const platoRepository = AppDataSource.getRepository(Plato);

      const plato = await platoRepository.findOne({
        where: { id_plato: parseInt(id) },
      });

      if (!plato) {
        res.status(404).json({ error: 'Plato no encontrado' });
        return;
      }

      if (nombre) plato.nombre = nombre;
      if (descripcion !== undefined) plato.descripcion = descripcion;
      if (precio !== undefined) plato.precio = precio;
      if (disponible !== undefined) plato.disponible = disponible;
      if (id_categoria) plato.id_categoria = id_categoria;

      const updatedPlato = await platoRepository.save(plato);
      res.json(updatedPlato);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el plato' });
    }
  }

  // Eliminar un plato
  async deletePlato(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const platoRepository = AppDataSource.getRepository(Plato);

      const result = await platoRepository.delete({ id_plato: parseInt(id) });

      if (result.affected === 0) {
        res.status(404).json({ error: 'Plato no encontrado' });
        return;
      }

      res.json({ message: 'Plato eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el plato' });
    }
  }

  // Obtener platos por categoría
  async getPlatosByCategoria(req: Request, res: Response): Promise<void> {
    try {
      const { categoriaId } = req.params;
      const platoRepository = AppDataSource.getRepository(Plato);
      const platos = await platoRepository.find({
        where: { id_categoria: parseInt(categoriaId) },
        relations: ['categoria'],
      });
      res.json(platos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los platos por categoría' });
    }
  }

  // Obtener platos disponibles
  async getPlatosDisponibles(req: Request, res: Response): Promise<void> {
    try {
      const platoRepository = AppDataSource.getRepository(Plato);
      const platos = await platoRepository.find({
        where: { disponible: true },
        relations: ['categoria'],
      });
      res.json(platos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los platos disponibles' });
    }
  }
}

