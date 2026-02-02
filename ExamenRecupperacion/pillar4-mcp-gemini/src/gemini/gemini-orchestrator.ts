import { GoogleGenerativeAI, FunctionDeclarationsTool } from '@google/generative-ai';
import { GeminiFunctionDeclaration, RecupConsultarPrestamosParams } from '../types';
import { executeRecupConsultarPrestamos } from '../mcp/tools/recup-consultar-prestamos.tool';

/**
 * Gemini Function Declaration for recup_consultar_prestamos
 * Following the exact naming from the domain specification
 */
const recupConsultarPrestamosFunction: GeminiFunctionDeclaration = {
  name: 'recup_consultar_prestamos',
  description:
    'Consulta los préstamos de la biblioteca. Usa esta función cuando el usuario pregunte sobre préstamos, libros prestados, préstamos vencidos, o el estado de préstamos de un lector.',
  parameters: {
    type: 'object',
    properties: {
      estado: {
        type: 'string',
        description:
          'Estado del préstamo. Valores posibles: SOLICITADO (pendiente de aprobación), APROBADO (aprobado pero no entregado), ENTREGADO (libro entregado al lector), DEVUELTO (libro devuelto), VENCIDO (plazo excedido)',
        enum: ['SOLICITADO', 'APROBADO', 'ENTREGADO', 'DEVUELTO', 'VENCIDO'],
      },
      lectorId: {
        type: 'number',
        description: 'ID del lector para filtrar sus préstamos específicos. Opcional.',
      },
    },
    required: ['estado'],
  },
};

/**
 * Gemini Orchestrator
 * Handles natural language → tool execution → natural response flow
 */
export class GeminiOrchestrator {
  private genAI: GoogleGenerativeAI;
  private model;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);

    // Configure model with function calling
    const tools: FunctionDeclarationsTool[] = [
      {
        functionDeclarations: [recupConsultarPrestamosFunction as any],
      },
    ];

    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      tools,
    });
  }

  /**
   * Process natural language query
   * Gemini decides when to call the tool
   */
  async processQuery(userQuery: string): Promise<string> {
    try {
      // Start chat with system context
      const chat = this.model.startChat({
        history: [
          {
            role: 'user',
            parts: [
              {
                text: `Eres un asistente de biblioteca que ayuda a consultar préstamos. 
                Cuando el usuario pregunte sobre préstamos, usa la función recup_consultar_prestamos.
                Responde siempre en español de forma amigable y clara.`,
              },
            ],
          },
          {
            role: 'model',
            parts: [
              {
                text: 'Entendido. Soy un asistente de biblioteca listo para ayudarte a consultar información sobre préstamos. ¿En qué puedo ayudarte?',
              },
            ],
          },
        ],
      });

      // Send user query - Gemini decides if tool is needed
      const result = await chat.sendMessage(userQuery);
      const response = result.response;

      // Check if Gemini wants to call a function
      const functionCalls = response.functionCalls();

      if (functionCalls && functionCalls.length > 0) {
        const functionCall = functionCalls[0];

        if (functionCall.name === 'recup_consultar_prestamos') {
          // Execute the MCP tool
          const toolParams = functionCall.args as RecupConsultarPrestamosParams;
          const prestamos = await executeRecupConsultarPrestamos(toolParams);

          // Send function result back to Gemini for natural response
          const functionResponse = await chat.sendMessage([
            {
              functionResponse: {
                name: 'recup_consultar_prestamos',
                response: { prestamos },
              },
            },
          ]);

          return functionResponse.response.text();
        }
      }

      // No function call needed, return direct response
      return response.text();
    } catch (error) {
      console.error('Error in Gemini orchestration:', error);
      throw new Error(
        `Error al procesar la consulta: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

let orchestratorInstance: GeminiOrchestrator | null = null;

/**
 * Get or create Gemini Orchestrator instance
 */
export function getGeminiOrchestrator(): GeminiOrchestrator {
  if (!orchestratorInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    orchestratorInstance = new GeminiOrchestrator(apiKey);
  }
  return orchestratorInstance;
}
