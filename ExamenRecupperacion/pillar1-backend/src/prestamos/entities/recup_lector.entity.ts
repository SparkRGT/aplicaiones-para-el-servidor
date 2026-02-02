import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Recup_Prestamo } from './recup_prestamo.entity';

@Entity('Recup_Lector')
export class Recup_Lector {
  @PrimaryGeneratedColumn()
  lectorId: number;

  @Column({ type: 'varchar' })
  recup_carnet: string;

  @Column({ type: 'varchar' })
  recup_nombreCompleto: string;

  @Column({ type: 'varchar' })
  recup_tipoLector: string;

  @Column({ type: 'varchar' })
  recup_telefono: string;

  @Column({ type: 'varchar' })
  recup_email: string;

  @OneToMany(() => Recup_Prestamo, (prestamo) => prestamo.lector)
  prestamos: Recup_Prestamo[];
}
