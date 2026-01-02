import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CategoriaMenu } from './CategoriaMenu';
import { Menu } from './Menu';

@Entity('plato')
export class Plato {
  @PrimaryGeneratedColumn()
  id_plato: number;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column({ type: 'boolean', default: true })
  disponible: boolean;

  @Column({ name: 'id_categoria' })
  id_categoria: number;

  @ManyToOne(() => CategoriaMenu, (categoria) => categoria.platos)
  @JoinColumn({ name: 'id_categoria' })
  categoria: CategoriaMenu;

  @Column({ name: 'id_menu', nullable: true })
  id_menu: number;

  @ManyToOne(() => Menu, (menu) => menu.platos)
  @JoinColumn({ name: 'id_menu' })
  menu: Menu;
}

