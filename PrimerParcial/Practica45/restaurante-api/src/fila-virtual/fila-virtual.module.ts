import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilaVirtualService } from './fila-virtual.service';
import { FilaVirtualController } from './fila-virtual.controller';
import { FilaVirtual } from './entities/fila-virtual.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FilaVirtual])],
  controllers: [FilaVirtualController],
  providers: [FilaVirtualService],
  exports: [FilaVirtualService],
})
export class FilaVirtualModule {}
