import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  app.setGlobalPrefix('api');
  
  const port = process.env.GATEWAY_PORT || 3000;
  await app.listen(port, () => {
    console.log(`🚀 API Gateway corriendo en http://localhost:${port}`);
  });
}

bootstrap().catch((err) => {
  console.error('Error iniciando API Gateway:', err);
  process.exit(1);
});

