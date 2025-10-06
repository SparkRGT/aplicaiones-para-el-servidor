import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Mesa } from "./Mesa.js";

@Entity()
export class Restaurante {
  @PrimaryGeneratedColumn()
  id_restaurante!: number;

  @Column()
  nombre!: string;

  @Column()
  direccion!: string;

  @Column()
  telefono!: string;

  // Relación: un restaurante tiene muchas mesas
  @OneToMany(() => Mesa, (mesa) => mesa.restaurante)
  mesas!: Mesa[];
}
