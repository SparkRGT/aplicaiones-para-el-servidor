import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Pillar 2 corre en puerto 4001 (Pillar 1 usa puerto 3000)
  const port = process.env.PORT ?? 4001;
  await app.listen(port);
  
  console.log(`🚀 Pillar 2 - GraphQL Gateway corriendo en: http://localhost:${port}/graphql`);
}
bootstrap();
