import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaMenuService } from './categoria-menu.service';
import { CategoriaMenuController } from './categoria-menu.controller';
import { CategoriaMenu } from './entities/categoria-menu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriaMenu])],
  controllers: [CategoriaMenuController],
  providers: [CategoriaMenuService],
  exports: [CategoriaMenuService],
})
export class CategoriaMenuModule {}
