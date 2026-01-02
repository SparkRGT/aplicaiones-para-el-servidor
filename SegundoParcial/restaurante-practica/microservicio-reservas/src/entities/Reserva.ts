import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Mesa } from './Mesa';

@Entity('reserva')
export class Reserva {
  @PrimaryGeneratedColumn()
  id_reserva: number;

  @Column({ name: 'id_cliente' })
  id_cliente: number;

  @Column({ name: 'id_mesa' })
  id_mesa: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'time' })
  hora_inicio: string;

  @Column({ type: 'time' })
  hora_fin: string;

  @Column({ 
    type: 'varchar', 
    length: 50,
    default: 'pendiente'
  })
  estado: string; // 'pendiente', 'confirmada', 'cancelada', 'completada'

  @ManyToOne(() => Mesa, (mesa) => mesa.reservas)
  @JoinColumn({ name: 'id_mesa' })
  mesa: Mesa;
}

