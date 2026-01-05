import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Plato } from './plato.entity';

@Entity()
export class Menu {
  @PrimaryGeneratedColumn()
  id_menu: number;

  @Column()
  fecha: Date;

  @OneToMany(() => Plato, (plato) => plato.menu)
  platos: Plato[];
}

