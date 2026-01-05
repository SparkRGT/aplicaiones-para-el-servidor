import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class CategoriaMenu {
  @PrimaryGeneratedColumn()
  id_categoria: number;

  @Column()
  nombre: string;
}

