import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Plato } from '../../plato/entities/plato.entity';

@Entity()
export class CategoriaMenu {
  @PrimaryGeneratedColumn()
  id_categoria: number;
  @Column({ length: 50 })
  nombre: string;

  @OneToMany(() => Plato, (plato) => plato.categoria)
  platos: Plato[];
}



