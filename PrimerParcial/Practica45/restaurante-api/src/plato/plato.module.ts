import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatoService } from './plato.service';
import { PlatoController } from './plato.controller';
import { Plato } from './entities/plato.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plato])],
  controllers: [PlatoController],
  providers: [PlatoService],
  exports: [PlatoService],
})
export class PlatoModule {}
