import { DataSource } from 'typeorm';
import { Menu } from '../entities/Menu';
import { Plato } from '../entities/Plato';
import { CategoriaMenu } from '../entities/CategoriaMenu';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'restaurante_menu_db',
  entities: [Menu, Plato, CategoriaMenu],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
});

