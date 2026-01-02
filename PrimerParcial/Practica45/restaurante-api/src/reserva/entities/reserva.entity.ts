import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Cliente } from '../../cliente/entities/cliente.entity';
import { Mesa } from '../../mesa/entities/mesa.entity';

@Entity()
export class Reserva {
  @PrimaryGeneratedColumn() id_reserva: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.reservas, { eager: false })
  @JoinColumn({ name: 'id_cliente' })
  cliente: Cliente;

  @ManyToOne(() => Mesa, (mesa) => mesa.reservas, { eager: false })
  @JoinColumn({ name: 'id_mesa' })
  mesa: Mesa;

  @Column() fecha: Date;
  @Column() hora_inicio: Date;
  @Column() hora_fin: Date;
  @Column() estado: string;
}
