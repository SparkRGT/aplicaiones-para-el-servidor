import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Menu } from '../entities/Menu';
import { Plato } from '../entities/Plato';

export class MenuController {
  // Obtener todos los menús
  async getAllMenus(req: Request, res: Response): Promise<void> {
    try {
      const menuRepository = AppDataSource.getRepository(Menu);
      const menus = await menuRepository.find({
        relations: ['platos', 'platos.categoria'],
      });
      res.json(menus);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los menús' });
    }
  }

  // Obtener un menú por ID
  async getMenuById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const menuRepository = AppDataSource.getRepository(Menu);
      const menu = await menuRepository.findOne({
        where: { id_menu: parseInt(id) },
        relations: ['platos', 'platos.categoria'],
      });

      if (!menu) {
        res.status(404).json({ error: 'Menú no encontrado' });
        return;
      }

      res.json(menu);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el menú' });
    }
  }

  // Crear un nuevo menú
  async createMenu(req: Request, res: Response): Promise<void> {
    try {
      const { fecha } = req.body;
      const menuRepository = AppDataSource.getRepository(Menu);

      const menu = new Menu();
      menu.fecha = new Date(fecha);

      const savedMenu = await menuRepository.save(menu);
      res.status(201).json(savedMenu);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el menú' });
    }
  }

  // Actualizar un menú
  async updateMenu(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { fecha } = req.body;
      const menuRepository = AppDataSource.getRepository(Menu);

      const menu = await menuRepository.findOne({
        where: { id_menu: parseInt(id) },
      });

      if (!menu) {
        res.status(404).json({ error: 'Menú no encontrado' });
        return;
      }

      if (fecha) menu.fecha = new Date(fecha);

      const updatedMenu = await menuRepository.save(menu);
      res.json(updatedMenu);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el menú' });
    }
  }

  // Eliminar un menú
  async deleteMenu(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const menuRepository = AppDataSource.getRepository(Menu);

      const result = await menuRepository.delete({ id_menu: parseInt(id) });

      if (result.affected === 0) {
        res.status(404).json({ error: 'Menú no encontrado' });
        return;
      }

      res.json({ message: 'Menú eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el menú' });
    }
  }

  // Agregar plato a un menú
  async addPlatoToMenu(req: Request, res: Response): Promise<void> {
    try {
      const { menuId } = req.params;
      const { platoId } = req.body;

      const menuRepository = AppDataSource.getRepository(Menu);
      const platoRepository = AppDataSource.getRepository(Plato);

      const menu = await menuRepository.findOne({
        where: { id_menu: parseInt(menuId) },
      });

      const plato = await platoRepository.findOne({
        where: { id_plato: platoId },
      });

      if (!menu || !plato) {
        res.status(404).json({ error: 'Menú o plato no encontrado' });
        return;
      }

      plato.id_menu = menu.id_menu;
      await platoRepository.save(plato);

      res.json({ message: 'Plato agregado al menú correctamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al agregar plato al menú' });
    }
  }
}

