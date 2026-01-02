import { Module } from '@nestjs/common';
import { DispositivosModule } from './dispositivos/dispositivos.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      database: 'test',
      entities: [],
      synchronize: true,
    }),
    DispositivosModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
