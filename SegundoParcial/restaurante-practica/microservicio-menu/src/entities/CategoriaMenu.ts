import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Plato } from './Plato';

@Entity('categoria_menu')
export class CategoriaMenu {
  @PrimaryGeneratedColumn()
  id_categoria: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @OneToMany(() => Plato, (plato) => plato.categoria)
  platos: Plato[];
}

