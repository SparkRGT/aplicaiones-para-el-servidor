import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Plato } from '../../plato/entities/plato.entity';
import { Restaurante } from '../../restaurante/entities/restaurante.entity';

@Entity()
export class Menu {
  @PrimaryGeneratedColumn() id_menu: number;
  @Column() fecha: Date;

  @OneToMany(() => Plato, (plato) => plato.menu)
  platos: Plato[];

  @OneToOne(() => Restaurante, (restaurante) => restaurante.menu)
  @JoinColumn({ name: 'id_restaurante' })
  restaurante: Restaurante;
}

