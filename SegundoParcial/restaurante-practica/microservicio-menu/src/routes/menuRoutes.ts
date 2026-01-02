import { Router } from 'express';
import { MenuController } from '../controllers/MenuController';

const router = Router();
const menuController = new MenuController();

router.get('/', (req, res) => menuController.getAllMenus(req, res));
router.get('/:id', (req, res) => menuController.getMenuById(req, res));
router.post('/', (req, res) => menuController.createMenu(req, res));
router.put('/:id', (req, res) => menuController.updateMenu(req, res));
router.delete('/:id', (req, res) => menuController.deleteMenu(req, res));
router.post('/:menuId/platos', (req, res) => menuController.addPlatoToMenu(req, res));

export default router;

