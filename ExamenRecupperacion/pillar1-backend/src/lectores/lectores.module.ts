import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LectoresService } from './lectores.service';
import { LectoresController } from './lectores.controller';
import { Recup_Lector } from '../prestamos/entities/recup_lector.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recup_Lector])],
  controllers: [LectoresController],
  providers: [LectoresService],
  exports: [LectoresService],
})
export class LectoresModule {}
