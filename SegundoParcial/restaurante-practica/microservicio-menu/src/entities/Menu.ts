import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Plato } from './Plato';

@Entity('menu')
export class Menu {
  @PrimaryGeneratedColumn()
  id_menu: number;

  @Column({ type: 'date' })
  fecha: Date;

  @OneToMany(() => Plato, (plato) => plato.menu)
  platos: Plato[];
}

