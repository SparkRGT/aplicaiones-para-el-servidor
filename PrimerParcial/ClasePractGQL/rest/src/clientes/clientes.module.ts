import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { ClientesResolver } from './clientes.resolver';

@Module({
  controllers: [ClientesController],
  providers: [ClientesService, ClientesResolver],
})
export class ClientesModule {}
