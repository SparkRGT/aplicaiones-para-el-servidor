import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Reserva } from './Reserva';

@Entity('mesa')
export class Mesa {
  @PrimaryGeneratedColumn()
  id_mesa: number;

  @Column({ type: 'varchar', length: 50 })
  numero: string;

  @Column({ type: 'int' })
  capacidad: number;

  @Column({ 
    type: 'varchar', 
    length: 50,
    default: 'disponible'
  })
  estado: string; // 'disponible', 'ocupada', 'reservada', 'mantenimiento'

  @OneToMany(() => Reserva, (reserva) => reserva.mesa)
  reservas: Reserva[];
}

