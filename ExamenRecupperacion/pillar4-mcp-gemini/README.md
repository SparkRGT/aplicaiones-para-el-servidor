# Pillar 4 - MCP Server + Gemini

Servidor MCP (Model Context Protocol) con integración de Gemini Function Calling para el Sistema de Préstamos de Biblioteca.

## Arquitectura

```
Usuario (lenguaje natural)
        ↓
    POST /chat
        ↓
    Gemini (decide si invocar tool)
        ↓
    MCP Tool: recup_consultar_prestamos
        ↓
    Pillar 1 REST API (GET /recup-prestamos)
        ↓
    Respuesta estructurada
        ↓
    Gemini (genera respuesta natural)
        ↓
    Usuario
```

## Instalación

```bash
cd pillar4-mcp-gemini
npm install
```

## Configuración

Crear archivo `.env` basado en `.env.example`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PILLAR1_BASE_URL=http://localhost:3000
MCP_PORT=3003
```

## Ejecución

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## Endpoints

### POST /mcp
Endpoint JSON-RPC 2.0 para clientes MCP.

**Listar herramientas:**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 1
}
```

**Llamar herramienta:**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "recup_consultar_prestamos",
    "arguments": {
      "estado": "VENCIDO",
      "lectorId": 1
    }
  },
  "id": 2
}
```

### POST /chat
Endpoint para consultas en lenguaje natural.

**Request:**
```json
{
  "message": "¿Cuáles son los préstamos vencidos?"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Actualmente hay 3 préstamos vencidos..."
}
```

### GET /health
Health check del servicio.

### GET /tools
Lista de herramientas disponibles.

## Tool: recup_consultar_prestamos

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| estado | string | ✅ Sí | SOLICITADO, APROBADO, ENTREGADO, DEVUELTO, VENCIDO |
| lectorId | number | ❌ No | ID del lector para filtrar |

## Ejemplos de Consultas

- "¿Cuáles son los préstamos vencidos?"
- "Muéstrame los préstamos del lector 5"
- "¿Hay libros pendientes de devolución?"
- "Lista los préstamos aprobados"
