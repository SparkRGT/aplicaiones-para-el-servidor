import { DataSource } from 'typeorm';
import { Reserva } from '../entities/Reserva';
import { Mesa } from '../entities/Mesa';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'restaurante_reservas_db',
  entities: [Reserva, Mesa],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
});

