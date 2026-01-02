import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gatewayRoutes from './routes/gatewayRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting global
app.use(apiLimiter);

// Logging de requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Rutas del gateway
app.use('/', gatewayRoutes);

// Manejo de rutas no encontradas
app.use(notFoundHandler);

// Manejo de errores
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║         🚀 API GATEWAY - Sistema Restaurante        ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`\n🌐 Gateway corriendo en puerto ${PORT}`);
  console.log(`\n📋 Endpoints disponibles:`);
  console.log(`   - GET    /health          - Health check agregado`);
  console.log(`   - GET    /info            - Información del gateway`);
  console.log(`\n🔀 Rutas proxy:`);
  console.log(`   - /api/menus/*            -> Microservicio Menú`);
  console.log(`   - /api/platos/*           -> Microservicio Menú`);
  console.log(`   - /api/reservas/*         -> Microservicio Reservas`);
  console.log(`   - /api/mesas/*            -> Microservicio Reservas`);
  console.log(`\n✨ Listo para recibir peticiones!\n`);
});

