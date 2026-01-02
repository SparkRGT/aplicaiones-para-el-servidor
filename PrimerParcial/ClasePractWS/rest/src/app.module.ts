import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DispositivosModule } from './dispositivos/dispositivos.module';

@Module({
  imports: [DispositivosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
