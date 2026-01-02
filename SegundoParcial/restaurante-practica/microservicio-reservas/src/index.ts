import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import reservaRoutes from './routes/reservaRoutes';
import mesaRoutes from './routes/mesaRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/reservas', reservaRoutes);
app.use('/api/mesas', mesaRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Microservicio de Reservas',
    strategy: 'Event-Driven Architecture',
    timestamp: new Date().toISOString()
  });
});

// Inicializar base de datos y servidor
AppDataSource.initialize()
  .then(() => {
    console.log('✅ Base de datos conectada (Database per Service)');
    app.listen(PORT, () => {
      console.log(`🚀 Microservicio de Reservas corriendo en puerto ${PORT}`);
      console.log(`📋 Endpoints disponibles:`);
      console.log(`   - GET    /api/reservas`);
      console.log(`   - GET    /api/mesas`);
      console.log(`   - GET    /health`);
      console.log(`📡 Event-Driven Architecture activa`);
      console.log(`   - Eventos publicados en RabbitMQ`);
    });
  })
  .catch((error) => {
    console.error('❌ Error al conectar la base de datos:', error);
    process.exit(1);
  });

