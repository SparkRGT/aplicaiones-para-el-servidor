import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibrosService } from './libros.service';
import { LibrosController } from './libros.controller';
import { Recup_Libro } from '../prestamos/entities/recup_libro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recup_Libro])],
  controllers: [LibrosController],
  providers: [LibrosService],
  exports: [LibrosService],
})
export class LibrosModule {}
