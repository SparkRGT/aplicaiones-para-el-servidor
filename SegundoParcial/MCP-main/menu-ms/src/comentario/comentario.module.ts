import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './menu.entity';
import { Plato } from './plato.entity';
import { CategoriaMenu } from './categoria-menu.entity';
import { Idempotencia } from './idempotencia.entity';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';


@Module({
  imports: [TypeOrmModule.forFeature([Menu, Plato, CategoriaMenu, Idempotencia])],
  providers: [MenuService],
  controllers: [MenuController],
})
export class ComentarioModule {}
