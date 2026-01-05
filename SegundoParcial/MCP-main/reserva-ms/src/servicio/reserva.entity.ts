import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Reserva {
  @PrimaryGeneratedColumn()
  id_reserva: number;

  @Column()
  id_cliente: number;

  @Column()
  id_mesa: number;

  @Column()
  fecha: Date;

  @Column()
  hora_inicio: Date;

  @Column()
  hora_fin: Date;

  @Column()
  estado: string; // 'pendiente', 'confirmada', 'cancelada', 'completada'
}

