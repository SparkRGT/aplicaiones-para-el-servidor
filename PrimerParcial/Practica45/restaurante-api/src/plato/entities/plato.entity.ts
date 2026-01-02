import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Menu } from '../../menu/entities/menu.entity';
import { CategoriaMenu } from '../../categoria-menu/entities/categoria-menu.entity';

@Entity()
export class Plato {
  @PrimaryGeneratedColumn()
  id_plato: number;
  @Column()
  nombre: string;
  @Column('text')
  descripcion: string;
  @Column('decimal')
  precio: number;
  @Column()
  disponible: boolean;

  @ManyToOne(() => Menu, (menu) => menu.platos, { eager: false })
  @JoinColumn({ name: 'id_menu' })
  menu: Menu;

  @ManyToOne(() => CategoriaMenu, (cat) => cat.platos, { eager: false })
  @JoinColumn({ name: 'id_categoria' })
  categoria: CategoriaMenu;
}
