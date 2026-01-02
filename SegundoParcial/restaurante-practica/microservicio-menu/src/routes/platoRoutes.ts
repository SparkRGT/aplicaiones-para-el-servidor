import { Router } from 'express';
import { PlatoController } from '../controllers/PlatoController';

const router = Router();
const platoController = new PlatoController();

router.get('/', (req, res) => platoController.getAllPlatos(req, res));
router.get('/disponibles', (req, res) => platoController.getPlatosDisponibles(req, res));
router.get('/categoria/:categoriaId', (req, res) => platoController.getPlatosByCategoria(req, res));
router.get('/:id', (req, res) => platoController.getPlatoById(req, res));
router.post('/', (req, res) => platoController.createPlato(req, res));
router.put('/:id', (req, res) => platoController.updatePlato(req, res));
router.delete('/:id', (req, res) => platoController.deletePlato(req, res));

export default router;

