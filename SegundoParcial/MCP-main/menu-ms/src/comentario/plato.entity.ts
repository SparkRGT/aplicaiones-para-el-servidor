import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Menu } from './menu.entity';
import { CategoriaMenu } from './categoria-menu.entity';

@Entity()
export class Plato {
  @PrimaryGeneratedColumn()
  id_plato: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @Column({ default: true })
  disponible: boolean;

  @Column()
  id_menu: number;

  @ManyToOne(() => Menu, (menu) => menu.platos)
  @JoinColumn({ name: 'id_menu' })
  menu: Menu;

  @Column()
  id_categoria: number;

  @ManyToOne(() => CategoriaMenu)
  @JoinColumn({ name: 'id_categoria' })
  categoria: CategoriaMenu;
}

