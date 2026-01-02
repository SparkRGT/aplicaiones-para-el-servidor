import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Reserva } from '../../reserva/entities/reserva.entity';
import { Restaurante } from '../../restaurante/entities/restaurante.entity';

@Entity()
export class Mesa {
  @PrimaryGeneratedColumn()
  id_mesa: number;
  @Column()
  numero: number;
  @Column()
  capacidad: number;
  @Column({ length: 50 })
  estado: string;

  @OneToMany(() => Reserva, (reserva) => reserva.mesa)
  reservas: Reserva[];

  @ManyToOne(() => Restaurante, (restaurante) => restaurante.mesas, { eager: false })
  @JoinColumn({ name: 'id_restaurante' })
  restaurante: Restaurante;
}
