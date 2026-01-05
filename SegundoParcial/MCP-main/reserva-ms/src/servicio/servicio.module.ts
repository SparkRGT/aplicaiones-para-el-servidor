import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './reserva.entity';
import { Mesa } from './mesa.entity';
import { Cliente } from './cliente.entity';
import { ReservaService } from './reserva.service';
import { ReservaController } from './reserva.controller';


@Module({
  imports: [TypeOrmModule.forFeature([Reserva, Mesa, Cliente])],
  providers: [ReservaService],
  controllers: [ReservaController],
  exports: [ReservaService],
})
export class ServicioModule {}