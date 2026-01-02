import { Router } from 'express';
import { MesaController } from '../controllers/MesaController';

const router = Router();
const mesaController = new MesaController();

router.get('/', (req, res) => mesaController.getAllMesas(req, res));
router.get('/disponibles', (req, res) => mesaController.getMesasDisponibles(req, res));
router.get('/capacidad/:capacidad', (req, res) => mesaController.getMesasByCapacidad(req, res));
router.get('/:id', (req, res) => mesaController.getMesaById(req, res));
router.post('/', (req, res) => mesaController.createMesa(req, res));
router.put('/:id', (req, res) => mesaController.updateMesa(req, res));
router.delete('/:id', (req, res) => mesaController.deleteMesa(req, res));

export default router;

