import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Restaurante } from "./Restaurante.js";

@Entity()
export class Mesa {
  @PrimaryGeneratedColumn()
  id_mesa!: number;

  @Column({ type: 'int' })
  numero!: number;

  @Column({ type: 'int' })
  capacidad!: number;

  // estado puede ser 'disponible', 'ocupada' o 'reservada'
  @Column({ type: 'varchar', length: 20, default: 'disponible' })
  estado!: 'disponible' | 'ocupada' | 'reservada';

  // Relación: muchas mesas pertenecen a un restaurante
  @ManyToOne(() => Restaurante, (restaurante) => restaurante.mesas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurante_id' })
  // Use `any` to avoid circular initialization issues with reflect-metadata in ESM
  restaurante!: any;
}
