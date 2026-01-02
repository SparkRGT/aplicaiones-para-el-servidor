import { Router } from 'express';
import { ReservaController } from '../controllers/ReservaController';

const router = Router();
const reservaController = new ReservaController();

router.get('/', (req, res) => reservaController.getAllReservas(req, res));
router.get('/cliente/:clienteId', (req, res) => reservaController.getReservasByCliente(req, res));
router.get('/fecha/:fecha', (req, res) => reservaController.getReservasByFecha(req, res));
router.get('/:id', (req, res) => reservaController.getReservaById(req, res));
router.post('/', (req, res) => reservaController.createReserva(req, res));
router.put('/:id/confirmar', (req, res) => reservaController.confirmarReserva(req, res));
router.put('/:id/cancelar', (req, res) => reservaController.cancelarReserva(req, res));

export default router;

