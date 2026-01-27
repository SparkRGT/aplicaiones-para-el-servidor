import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { Exam2pRegistroAuditoria } from './entities/exam2p-registro-auditoria.entity';
import { AuditoriaController } from './controllers/auditoria.controller';
import { HealthController } from './controllers/health.controller';
import { AuditoriaService } from './services/auditoria.service';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuración de TypeORM con SQLite
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'better-sqlite3',
        database: configService.get('DB_PATH', '/app/data/auditoria.db'),
        entities: [Exam2pRegistroAuditoria],
        synchronize: true, // Solo en desarrollo
        logging: configService.get('DB_LOGGING', 'false') === 'true',
      }),
      inject: [ConfigService],
    }),

    // Registro de la entidad
    TypeOrmModule.forFeature([Exam2pRegistroAuditoria]),

    // Configuración del cliente RabbitMQ para emitir eventos
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672')] as string[],
            queue: configService.get<string>('RABBITMQ_QUEUE', 'auditoria_queue'),
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuditoriaController, HealthController],
  providers: [AuditoriaService],
})
export class AppModule {}
