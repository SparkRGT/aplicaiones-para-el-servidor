import { Module } from '@nestjs/common';
import { DispositivosService } from './dispositivos.service';
import { DispositivosController } from './dispositivos.controller';
import { DispositivosResolver } from './dispositivos.resolver';

@Module({
  controllers: [DispositivosController],
  providers: [DispositivosService, DispositivosResolver],
})
export class DispositivosModule {}
