import { Body, Controller, Post, HttpCode } from "@nestjs/common";
import { GeminiService } from "./gemini.service";

@Controller()
export class AiController {
  constructor(private readonly gemini: GeminiService) {}

  @Post("/ai")
  @HttpCode(200)
  async ai(@Body() body: { text: string }) {
    try {
      const text = body?.text?.trim();
      if (!text) return { error: "Debes enviar { text: string }" };

      const answer = await this.gemini.runAgent(text);
      return { answer };
    } catch (err: any) {
      // ✅ AQUÍ DEVOLVEMOS EL ERROR REAL
      return {
        error: "Fallo en /ai",
        message: err?.message ?? String(err),
        stack: err?.stack ?? null,
      };
    }
  }
}
