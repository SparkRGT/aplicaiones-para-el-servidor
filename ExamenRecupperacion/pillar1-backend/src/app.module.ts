import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
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
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'biblioteca.db',
      entities: [Recup_Lector, Recup_Libro, Recup_Prestamo],
      synchronize: true,
    }),
    ClientsModule.register([
      {
        name: 'AUDIT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'recup_audit_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    LectoresModule,
    LibrosModule,
    PrestamosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [ClientsModule],
})
export class AppModule {}
