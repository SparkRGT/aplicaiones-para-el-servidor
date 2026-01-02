import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import menuRoutes from './routes/menuRoutes';
import platoRoutes from './routes/platoRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/menus', menuRoutes);
app.use('/api/platos', platoRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Microservicio de Menú',
    timestamp: new Date().toISOString()
  });
});

// Inicializar base de datos y servidor
AppDataSource.initialize()
  .then(() => {
    console.log('✅ Base de datos conectada (Database per Service)');
    app.listen(PORT, () => {
      console.log(`🚀 Microservicio de Menú corriendo en puerto ${PORT}`);
      console.log(`📋 Endpoints disponibles:`);
      console.log(`   - GET    /api/menus`);
      console.log(`   - GET    /api/platos`);
      console.log(`   - GET    /health`);
    });
  })
  .catch((error) => {
    console.error('❌ Error al conectar la base de datos:', error);
    process.exit(1);
  });

