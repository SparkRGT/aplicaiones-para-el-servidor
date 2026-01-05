// gateway/src/ai/gemini.service.ts
import { Injectable } from "@nestjs/common";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { McpClientService } from "../mcp-client/mcp-client.service";

type ToolCall = { name: string; args: any };

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function is429(err: any) {
  const msg = err?.message ?? "";
  return (
    msg.includes("[429") ||
    msg.includes("Resource exhausted") ||
    msg.includes("Too Many Requests")
  );
}

function safeJsonStringify(x: any) {
  try {
    return JSON.stringify(x);
  } catch {
    return String(x);
  }
}

@Injectable()
export class GeminiService {
  private readonly model: any;

  constructor(private readonly mcp: McpClientService) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Missing GEMINI_API_KEY in .env");

    const genAI = new GoogleGenerativeAI(key);

    // Declaración de tools MCP (tipado relajado por compatibilidad TS)
    const functionDeclarations: any = [
      {
        name: "buscar_reserva",
        description: "Busca reservas por texto o parámetros.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Texto a buscar" },
          },
          required: ["query"],
        },
      },
      {
        name: "validar_mesa_existe",
        description: "Valida si una mesa existe por ID y está disponible.",
        parameters: {
          type: "object",
          properties: {
            mesaId: { type: "string", description: "ID de la mesa" },
          },
          required: ["mesaId"],
        },
      },
      {
        name: "crear_reserva",
        description:
          "Crea una nueva reserva. Requiere id_cliente, id_mesa, fecha, hora_inicio y hora_fin.",
        parameters: {
          type: "object",
          properties: {
            id_cliente: { type: "string" },
            id_mesa: { type: "string" },
            fecha: { type: "string" },
            hora_inicio: { type: "string" },
            hora_fin: { type: "string" },
          },
          required: ["id_cliente", "id_mesa", "fecha", "hora_inicio", "hora_fin"],
        },
      },
      {
        name: "buscar_plato",
        description: "Busca platos por texto (nombre/descripcion).",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Texto a buscar" },
          },
          required: ["query"],
        },
      },
      {
        name: "crear_plato",
        description:
          "Crea un nuevo plato en un menú. Requiere nombre, precio, id_menu e id_categoria.",
        parameters: {
          type: "object",
          properties: {
            nombre: { type: "string" },
            descripcion: { type: "string" },
            precio: { type: "number" },
            id_menu: { type: "string" },
            id_categoria: { type: "string" },
            disponible: { type: "boolean" },
          },
          required: ["nombre", "precio", "id_menu", "id_categoria"],
        },
      },
    ];

    // ✅ Modelo recomendado para reducir rate limits
    // Si no existe en tu lista, cambia por "gemini-2.0-flash"
    this.model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
      tools: [{ functionDeclarations }] as any,
    });
  }

  private async runWithRetry(fn: () => Promise<any>, maxAttempts = 5): Promise<any> {
    let lastErr: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (err: any) {
        lastErr = err;

        if (!is429(err)) throw err;

        // backoff exponencial con jitter
        const base = 800 * Math.pow(2, attempt - 1);
        const jitter = Math.floor(Math.random() * 250);
        const wait = Math.min(base + jitter, 10000);

        console.warn(`Gemini 429, retry ${attempt}/${maxAttempts} in ${wait}ms`);
        await sleep(wait);
      }
    }

    throw lastErr;
  }

  /**
   * Agente con function calling:
   * - Gemini solicita tool(s)
   * - Se ejecuta tool en MCP
   * - Se retorna functionResponse
   * - Repite hasta texto final
   */
    async runAgent(userText: string): Promise<string> {
      const systemHint = `
  Eres un asistente que controla un sistema REAL de restaurante. NO inventes campos.

  Para crear una reserva, DEBES usar EXACTAMENTE este formato:
  { "id_cliente": <number>, "id_mesa": <number>, "fecha": <string>, "hora_inicio": <string>, "hora_fin": <string> }

  Flujo obligatorio para reservar:
  1) validar_mesa_existe(mesaId) - Verificar que la mesa existe y está disponible
  2) crear_reserva({ id_cliente, id_mesa, fecha, hora_inicio, hora_fin })

  Para crear un plato:
  1) buscar_plato(query) - Opcional, para verificar platos existentes
  2) crear_plato({ nombre, precio, id_menu, id_categoria, descripcion?, disponible? })

  NO uses otros nombres de campos.
  NO inventes IDs.
  `;

      // ✅ Usa Chat para soportar function calling correctamente
      const chat = this.model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: systemHint }],
          },
        ],
      });

      // 1) Primer mensaje del usuario (con retry por 429)
      let result: any = await this.runWithRetry(() =>
        chat.sendMessage(userText)
      );

      let response: any = result?.response;

      // 2) Loop de tools (máx 6)
      for (let i = 0; i < 6; i++) {
        const calls = response?.functionCalls?.() ?? [];
        if (!calls.length) break;

        const call = calls[0];

        // Ejecuta tool en MCP
        const toolResult = await this.mcp.callTool(call.name, call.args);

        // ✅ Gemini REQUIERE que response sea un objeto con propiedades nombradas
        // NO puede ser un array directo, primitivo, o null
        let wrappedResponse: Record<string, any>;

        if (toolResult === null || toolResult === undefined) {
          wrappedResponse = { result: "success", data: null };
        } else if (Array.isArray(toolResult)) {
          // Arrays deben envolversen en un objeto
          wrappedResponse = { items: toolResult };
        } else if (typeof toolResult === "object") {
          // Ya es objeto, usarlo directamente
          wrappedResponse = toolResult;
        } else {
          // Primitivos (string, number, boolean)
          wrappedResponse = { value: toolResult };
        }

        // ✅ Enviar SOLO el FunctionResponse como mensaje aparte
        result = await this.runWithRetry(() =>
          chat.sendMessage([
            {
              functionResponse: {
                name: call.name,
                response: wrappedResponse,
              },
            },
          ] as any)
        );

        response = result?.response;
      }

      // Texto final
      const finalText = response?.text?.() ?? "";
      return finalText.trim().length
        ? finalText
        : "Listo. (El modelo no devolvió texto final.)";
    }

}
