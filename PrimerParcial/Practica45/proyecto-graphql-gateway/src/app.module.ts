import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { HttpModule } from '@nestjs/axios';
import { GraphqlModule } from './graphql/graphql.module';
import { RestService } from './rest/rest.service';

@Module({
  imports: [
    HttpModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/graphql/graphql.schema.gql'),
    }),
    GraphqlModule,
  ],
  providers: [RestService],
})
export class AppModule {}
