import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestauranteService } from './restaurante.service';
import { RestauranteController } from './restaurante.controller';
import { Restaurante } from './entities/restaurante.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurante])],
  controllers: [RestauranteController],
  providers: [RestauranteService],
  exports: [RestauranteService],
})
export class RestauranteModule {}
