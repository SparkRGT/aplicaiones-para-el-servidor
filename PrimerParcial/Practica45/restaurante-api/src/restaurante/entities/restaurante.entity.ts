import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { Mesa } from '../../mesa/entities/mesa.entity';
import { Menu } from '../../menu/entities/menu.entity';

@Entity()
export class Restaurante {
  @PrimaryGeneratedColumn()
  id_restaurante: number;
  @Column()
  nombre: string;
  @Column()
  direccion: string;
  @Column()
  telefono: string;

  @OneToMany(() => Mesa, (mesa) => mesa.restaurante)
  mesas: Mesa[];

  @OneToOne(() => Menu, (menu) => menu.restaurante)
  menu: Menu;
}
