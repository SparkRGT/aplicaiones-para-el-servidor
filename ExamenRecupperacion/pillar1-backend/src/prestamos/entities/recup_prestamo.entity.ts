import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Recup_Lector } from './recup_lector.entity';
import { Recup_Libro } from './recup_libro.entity';

@Entity('Recup_Prestamo')
export class Recup_Prestamo {
  @PrimaryGeneratedColumn()
  prestamoId: number;

  @Column({ type: 'varchar' })
  recup_codigo: string;

  @Column({ type: 'date' })
  recup_fechaPrestamo: Date;

  @Column({ type: 'date' })
  recup_fechaDevolucion: Date;

  @Column({ type: 'varchar' })
  recup_estado: string;

  @Column({ type: 'date', nullable: true })
  recup_fechaRealDevolucion: Date;

  @Column()
  recup_lectorId: number;

  @Column()
  recup_libroId: number;

  @ManyToOne(() => Recup_Lector, (lector) => lector.prestamos)
  @JoinColumn({ name: 'recup_lectorId' })
  lector: Recup_Lector;

  @ManyToOne(() => Recup_Libro, (libro) => libro.prestamos)
  @JoinColumn({ name: 'recup_libroId' })
  libro: Recup_Libro;
}
