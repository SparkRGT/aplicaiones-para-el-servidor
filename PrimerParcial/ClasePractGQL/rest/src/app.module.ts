import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ClientesModule } from './clientes/clientes.module';
import { DispositivosModule } from './dispositivos/dispositivos.module';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
    }),
    ClientesModule,
    DispositivosModule,
  ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
