import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialPrestamoModule } from './historial-prestamo/historial-prestamo.module';
import { RecupHistorialPrestamo } from './historial-prestamo/entities';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'recup_audit.sqlite',
      entities: [RecupHistorialPrestamo],
      synchronize: true,
    }),
    HistorialPrestamoModule,
  ],
})
export class AppModule {}
