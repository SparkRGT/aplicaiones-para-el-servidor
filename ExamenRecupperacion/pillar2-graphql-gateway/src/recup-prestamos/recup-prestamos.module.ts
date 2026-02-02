import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RecupPrestamosService } from './recup-prestamos.service';
import { RecupPrestamosResolver } from './recup-prestamos.resolver';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [RecupPrestamosService, RecupPrestamosResolver],
  exports: [RecupPrestamosService],
})
export class RecupPrestamosModule {}
