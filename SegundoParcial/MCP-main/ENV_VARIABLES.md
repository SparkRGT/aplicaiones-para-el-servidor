# Variables de Entorno - Documentación Completa

Este documento describe todas las variables de entorno necesarias para cada servicio del proyecto.

## 📋 Variables Globales (docker-compose.yml)

Estas variables deben configurarse en el archivo `.env` en la raíz del proyecto o exportarse en el sistema:

```bash
# Supabase
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhYXVxcGp3bmpjc2dvaHhza3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NDE0MzMsImV4cCI6MjA4MTMxNzQzM30.kUiDwnAZrQzBKrMvlqQnnSVpl4keB4NewAVtIUBeatw

# Gemini AI
GEMINI_API_KEY=AIzaSyDedzLZLne-cP8fk0bF9HOkVqN9olILsxY
```

## 🔧 Variables por Servicio

### reserva-ms

```env
PORT=3001
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=reserva_db
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
RABBITMQ_QUEUE_RESERVA=reserva_queue
WEBHOOK_SECRET=super_secreto_123
WEBHOOK_URL=https://faauqpjwnjcsgohxskqi.supabase.co/functions/v1/webhook-event-logger
SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui
```

### menu-ms

```env
PORT=3002
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=menu_db
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
RABBITMQ_QUEUE_MENU=menu_queue
RABBITMQ_QUEUE_RESERVA=reserva_queue
WEBHOOK_SECRET=super_secreto_123
WEBHOOK_URL=https://faauqpjwnjcsgohxskqi.supabase.co/functions/v1/webhook-event-logger
SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui
```

### gateway

```env
PORT=3000
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
RABBITMQ_QUEUE_MENU=menu_queue
RABBITMQ_QUEUE_RESERVA=reserva_queue
GEMINI_API_KEY=tu_gemini_api_key_aqui
MCP_RPC_URL=http://host.docker.internal:3005/rpc
```

### mcp-server

```env
PORT=3005
GATEWAY_URL=http://localhost:3000
```

## 🔑 Cómo Obtener las Claves

### SUPABASE_ANON_KEY

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Navega a Settings > API
3. Copia la clave "anon public" o "service_role key"

### GEMINI_API_KEY

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una nueva API key
3. Copia la clave generada

## 📝 Configuración Local (Desarrollo)

Para desarrollo local sin Docker, crea archivos `.env` en cada directorio de servicio con las variables correspondientes.

## 🐳 Configuración Docker

Las variables están configuradas en `docker-compose.yml`. Para usar variables del sistema, crea un archivo `.env` en la raíz del proyecto con:

```env
SUPABASE_ANON_KEY=tu_clave_real
GEMINI_API_KEY=tu_clave_real
```

Docker Compose leerá automáticamente estas variables.

