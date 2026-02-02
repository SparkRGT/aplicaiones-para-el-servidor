import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { mcpServer } from './mcp/mcp-server';
import { getGeminiOrchestrator } from './gemini/gemini-orchestrator';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.MCP_PORT || 3003;

// Middleware
app.use(bodyParser.json());

/**
 * MCP Server Endpoint - JSON-RPC 2.0
 * Used by MCP clients to call tools directly
 */
app.post('/mcp', async (req: Request, res: Response) => {
  await mcpServer.handleRequest(req, res);
});

/**
 * Gemini Chat Endpoint
 * Natural language → Tool execution → Natural response
 */
app.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({
        error: 'El campo "message" es requerido y debe ser una cadena de texto',
      });
      return;
    }

    const orchestrator = getGeminiOrchestrator();
    const response = await orchestrator.processQuery(message);

    res.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('Error in /chat endpoint:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'pillar4-mcp-gemini',
    timestamp: new Date().toISOString(),
  });
});

/**
 * List available tools endpoint (convenience)
 */
app.get('/tools', (_req: Request, res: Response) => {
  res.json({
    tools: [
      {
        name: 'recup_consultar_prestamos',
        description: 'Consulta préstamos de la biblioteca filtrados por estado',
        parameters: {
          estado: {
            type: 'string',
            required: true,
            enum: ['SOLICITADO', 'APROBADO', 'ENTREGADO', 'DEVUELTO', 'VENCIDO'],
          },
          lectorId: {
            type: 'number',
            required: false,
          },
        },
      },
    ],
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 Pillar 4 - MCP Server + Gemini');
  console.log('='.repeat(50));
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🔧 MCP Endpoint: POST /mcp (JSON-RPC 2.0)`);
  console.log(`💬 Chat Endpoint: POST /chat`);
  console.log(`❤️  Health Check: GET /health`);
  console.log(`📋 List Tools: GET /tools`);
  console.log('='.repeat(50));
});
