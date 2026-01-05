import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Mesa {
  @PrimaryGeneratedColumn()
  id_mesa: number;

  @Column()
  numero: string;

  @Column()
  capacidad: number;

  @Column()
  estado: string; // 'disponible', 'ocupada', 'reservada', 'mantenimiento'
}

