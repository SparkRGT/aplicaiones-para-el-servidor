import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrestamosService } from './prestamos.service';
import { PrestamosController } from './prestamos.controller';
import { Recup_Lector } from './entities/recup_lector.entity';
import { Recup_Libro } from './entities/recup_libro.entity';
import { Recup_Prestamo } from './entities/recup_prestamo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recup_Lector, Recup_Libro, Recup_Prestamo]),
  ],
  controllers: [PrestamosController],
  providers: [PrestamosService],
  exports: [PrestamosService],
})
export class PrestamosModule {}
