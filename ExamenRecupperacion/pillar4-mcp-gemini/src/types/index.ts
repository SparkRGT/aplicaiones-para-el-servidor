// JSON-RPC 2.0 Types
export interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown>;
  id: string | number;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  result?: unknown;
  error?: JsonRpcError;
  id: string | number | null;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

// MCP Tool Types
export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, McpPropertySchema>;
    required: string[];
  };
}

export interface McpPropertySchema {
  type: string;
  description: string;
  enum?: string[];
}

// Tool Parameters
export interface RecupConsultarPrestamosParams {
  estado: 'SOLICITADO' | 'APROBADO' | 'ENTREGADO' | 'DEVUELTO' | 'VENCIDO';
  lectorId?: number;
}

// Recup_Prestamo from Pillar 1
export interface RecupPrestamo {
  prestamoId: number;
  recup_codigo: string;
  recup_fechaPrestamo: Date;
  recup_fechaDevolucion: Date;
  recup_estado: string;
  recup_fechaRealDevolucion: Date | null;
  recup_lectorId: number;
  recup_libroId: number;
  lector?: RecupLector;
  libro?: RecupLibro;
}

export interface RecupLector {
  lectorId: number;
  recup_carnet: string;
  recup_nombreCompleto: string;
  recup_tipoLector: string;
  recup_telefono: string;
  recup_email: string;
}

export interface RecupLibro {
  libroId: number;
  recup_isbn: string;
  recup_titulo: string;
  recup_autor: string;
  recup_categoria: string;
  recup_disponible: boolean;
}

// Gemini Function Declaration
export interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
}
