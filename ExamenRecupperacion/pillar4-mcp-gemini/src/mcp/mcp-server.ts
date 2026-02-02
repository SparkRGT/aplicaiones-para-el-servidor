import { Request, Response } from 'express';
import {
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcError,
  RecupConsultarPrestamosParams,
} from '../types';
import {
  recupConsultarPrestamosTool,
  executeRecupConsultarPrestamos,
} from './tools/recup-consultar-prestamos.tool';

// JSON-RPC 2.0 Error Codes
const JSON_RPC_ERRORS = {
  PARSE_ERROR: { code: -32700, message: 'Parse error' },
  INVALID_REQUEST: { code: -32600, message: 'Invalid Request' },
  METHOD_NOT_FOUND: { code: -32601, message: 'Method not found' },
  INVALID_PARAMS: { code: -32602, message: 'Invalid params' },
  INTERNAL_ERROR: { code: -32603, message: 'Internal error' },
};

/**
 * MCP Server Handler - JSON-RPC 2.0 Protocol
 */
export class McpServer {
  /**
   * Handle incoming JSON-RPC requests
   */
  async handleRequest(req: Request, res: Response): Promise<void> {
    try {
      const rpcRequest = req.body as JsonRpcRequest;

      // Validate JSON-RPC 2.0 format
      if (!this.isValidJsonRpcRequest(rpcRequest)) {
        this.sendError(res, JSON_RPC_ERRORS.INVALID_REQUEST, null);
        return;
      }

      // Route to appropriate method
      const result = await this.routeMethod(rpcRequest);
      this.sendSuccess(res, result, rpcRequest.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.sendError(
        res,
        { ...JSON_RPC_ERRORS.INTERNAL_ERROR, data: errorMessage },
        null
      );
    }
  }

  /**
   * Route JSON-RPC method to handler
   */
  private async routeMethod(request: JsonRpcRequest): Promise<unknown> {
    switch (request.method) {
      case 'tools/list':
        return this.listTools();

      case 'tools/call':
        return this.callTool(request.params as { name: string; arguments: Record<string, unknown> });

      default:
        throw { ...JSON_RPC_ERRORS.METHOD_NOT_FOUND };
    }
  }

  /**
   * List available MCP tools
   */
  private listTools(): { tools: typeof recupConsultarPrestamosTool[] } {
    return {
      tools: [recupConsultarPrestamosTool],
    };
  }

  /**
   * Call a specific MCP tool
   */
  private async callTool(params: { name: string; arguments: Record<string, unknown> }): Promise<unknown> {
    const { name, arguments: args } = params;

    if (name === 'recup_consultar_prestamos') {
      // Validate required parameter: estado
      if (!args.estado) {
        throw { ...JSON_RPC_ERRORS.INVALID_PARAMS, data: 'Parameter "estado" is required' };
      }

      const toolParams: RecupConsultarPrestamosParams = {
        estado: args.estado as RecupConsultarPrestamosParams['estado'],
        lectorId: args.lectorId as number | undefined,
      };

      const prestamos = await executeRecupConsultarPrestamos(toolParams);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(prestamos, null, 2),
          },
        ],
      };
    }

    throw { ...JSON_RPC_ERRORS.METHOD_NOT_FOUND, data: `Tool "${name}" not found` };
  }

  /**
   * Validate JSON-RPC 2.0 request format
   */
  private isValidJsonRpcRequest(request: JsonRpcRequest): boolean {
    return (
      request.jsonrpc === '2.0' &&
      typeof request.method === 'string' &&
      (request.id !== undefined)
    );
  }

  /**
   * Send JSON-RPC success response
   */
  private sendSuccess(res: Response, result: unknown, id: string | number): void {
    const response: JsonRpcResponse = {
      jsonrpc: '2.0',
      result,
      id,
    };
    res.json(response);
  }

  /**
   * Send JSON-RPC error response
   */
  private sendError(res: Response, error: JsonRpcError, id: string | number | null): void {
    const response: JsonRpcResponse = {
      jsonrpc: '2.0',
      error,
      id,
    };
    res.status(200).json(response); // JSON-RPC errors use 200 status
  }
}

export const mcpServer = new McpServer();
