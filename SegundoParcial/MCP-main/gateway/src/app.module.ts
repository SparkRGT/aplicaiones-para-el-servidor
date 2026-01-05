import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ReservaGatewayController } from './reserva/reserva.controller';
import { ReservaGatewayService } from './reserva/reserva.service';
import { MenuGatewayService } from './menu/menu.service';
import { MenuGatewayController } from './menu/menu.controller';
import { McpClientService } from './mcp-client/mcp-client.service';
import { GeminiService } from './ai/gemini.service';
import { AiController } from './ai/ia.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [
    ReservaGatewayController,
    MenuGatewayController,
    AiController,
  ],
  providers: [
    ReservaGatewayService,
    MenuGatewayService,
    McpClientService,
    GeminiService,
  ],
})
export class AppModule {}
