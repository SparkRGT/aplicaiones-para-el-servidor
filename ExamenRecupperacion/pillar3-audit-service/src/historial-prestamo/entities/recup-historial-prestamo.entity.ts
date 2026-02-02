import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('recup_historial_prestamo')
export class RecupHistorialPrestamo {
  @PrimaryGeneratedColumn()
  historialId: number;

  @Column()
  recup_prestamoId: number;

  @Column({ nullable: true })
  recup_estadoAnterior: string;

  @Column()
  recup_estadoNuevo: string;

  @Column({ nullable: true })
  recup_comentarioCambio: string;

  @Column({ type: 'datetime' })
  recup_fechaCambio: Date;
}
