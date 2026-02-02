import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Recup_Prestamo } from './recup_prestamo.entity';

@Entity('Recup_Libro')
export class Recup_Libro {
  @PrimaryGeneratedColumn()
  libroId: number;

  @Column({ type: 'varchar' })
  recup_isbn: string;

  @Column({ type: 'varchar' })
  recup_titulo: string;

  @Column({ type: 'varchar' })
  recup_autor: string;

  @Column({ type: 'varchar' })
  recup_categoria: string;

  @Column({ type: 'boolean' })
  recup_disponible: boolean;

  @OneToMany(() => Recup_Prestamo, (prestamo) => prestamo.libro)
  prestamos: Recup_Prestamo[];
}
