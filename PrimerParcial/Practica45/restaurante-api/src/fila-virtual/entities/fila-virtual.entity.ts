import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Cliente } from '../../cliente/entities/cliente.entity';

@Entity()
export class FilaVirtual {
  @PrimaryGeneratedColumn() id_fila: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.filas, { eager: false })
  @JoinColumn({ name: 'id_cliente' })
  cliente: Cliente;

  @Column() fecha_hora_ingreso: Date;
  @Column() estado: string;
}
