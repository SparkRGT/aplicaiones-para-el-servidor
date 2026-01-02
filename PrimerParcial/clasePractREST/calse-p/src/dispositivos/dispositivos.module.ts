import { Module } from '@nestjs/common';
import { DispositivosService } from './dispositivos.service';
import { DispositivosController } from './dispositivos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dispositivo } from './entities/dispositivo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dispositivo])],
  controllers: [DispositivosController],
  providers: [DispositivosService],
})
export class DispositivosModule {}
