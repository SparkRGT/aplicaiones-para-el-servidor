import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrestamosModule } from './prestamos/prestamos.module';
import { LectoresModule } from './lectores/lectores.module';
import { LibrosModule } from './libros/libros.module';
import { Recup_Lector } from './prestamos/entities/recup_lector.entity';
import { Recup_Libro } from './prestamos/entities/recup_libro.entity';
import { Recup_Prestamo } from './prestamos/entities/recup_prestamo.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'biblioteca.db',
      entities: [Recup_Lector, Recup_Libro, Recup_Prestamo],
      synchronize: true,
    }),
    LectoresModule,
    LibrosModule,
    PrestamosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
