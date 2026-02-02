import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrestamosService } from './prestamos.service';
import { PrestamosController } from './prestamos.controller';
import { Recup_Lector } from './entities/recup_lector.entity';
import { Recup_Libro } from './entities/recup_libro.entity';
import { Recup_Prestamo } from './entities/recup_prestamo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recup_Lector, Recup_Libro, Recup_Prestamo]),
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
  ],
  controllers: [PrestamosController],
  providers: [PrestamosService],
  exports: [PrestamosService],
})
export class PrestamosModule {}
