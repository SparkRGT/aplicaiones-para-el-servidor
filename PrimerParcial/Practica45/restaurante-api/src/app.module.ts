import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaMenuModule } from './categoria-menu/categoria-menu.module';
import { MesaModule } from './mesa/mesa.module';
import { RestauranteModule } from './restaurante/restaurante.module';
import { MenuModule } from './menu/menu.module';
import { PlatoModule } from './plato/plato.module';
import { ClienteModule } from './cliente/cliente.module';
import { FilaVirtualModule } from './fila-virtual/fila-virtual.module';
import { ReservaModule } from './reserva/reserva.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_PATH ?? 'restaurante.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      // synchronize should only be true for development. Use env var to control it.
      synchronize: process.env.TYPEORM_SYNC === 'true' || process.env.NODE_ENV !== 'production',
      logging: process.env.TYPEORM_LOGGING === 'true' || process.env.NODE_ENV !== 'production',
    }),
    CategoriaMenuModule,
    MesaModule,
    RestauranteModule,
    MenuModule,
    PlatoModule,
    ClienteModule,
    FilaVirtualModule,
    ReservaModule,
  ],
})
export class AppModule {}
