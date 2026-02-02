import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialPrestamoController } from './historial-prestamo.controller';
import { HistorialPrestamoService } from './historial-prestamo.service';
import { RecupHistorialPrestamo } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([RecupHistorialPrestamo])],
  controllers: [HistorialPrestamoController],
  providers: [HistorialPrestamoService],
  exports: [HistorialPrestamoService],
})
export class HistorialPrestamoModule {}
