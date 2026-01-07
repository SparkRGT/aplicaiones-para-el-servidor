# Sistema de Microservicios con IA - Gestión de Reservas y Menús de Restaurante

## � Análisis y Resumen Ejecutivo

**Qué es:** Un proyecto modular basado en NestJS que implementa una arquitectura de microservicios para gestionar reservas y menús de un restaurante, con integración de IA (Gemini), uso de RabbitMQ para mensajería y Supabase para webhooks/servicios externos.

**Estructura clave:** `gateway/`, `menu-ms/`, `reserva-ms/`, `mcp-server/` y `supabase/` (DB y funciones). Cada servicio es autónomo (propio `package.json`, `tsconfig`, tests y Dockerfile).

**Patrones y tecnologías:**
- Microservicios (NestJS) con enrutamiento via Gateway
- Mensajería asíncrona: RabbitMQ (colas `menu_queue`, `reserva_queue`)
- Base de datos: PostgreSQL (DBs separadas por servicio; `init.sql` inicializa esquemas)
- MCP Server: servidor de herramientas JSON-RPC para que Gemini llame a funciones/acciones
- Contenerización: Docker + docker-compose para orquestación local
- Integración con Supabase (webhooks y funciones)

**Aspectos importantes y recomendaciones rápidas:**
- Excelente separación por dominio y uso de herramientas reutilizables en `mcp-server/tools/`.
- Añadir `README.md` por microservicio (si faltan) y un `.env.example` centralizado.
- Documentar contratos (DTOs/endpoints) y exponer Swagger/OpenAPI en `gateway` para facilitar integraciones.
- Añadir CI (lint, build, test) y scripts para levantar partes del stack (ej. `make` o scripts npm en raíz).

> A continuación se mantiene la documentación detallada del proyecto.

## �📋 Descripción General

Este es un sistema completo de microservicios basado en **NestJS** que implementa una arquitectura distribuida con integración de **Inteligencia Artificial (Gemini)** y **Model Context Protocol (MCP)**. El sistema permite gestionar reservas de mesas y menús de restaurante de manera distribuida, con capacidades de IA para interacción natural.

### Características Principales

- ✅ **Arquitectura de Microservicios** con comunicación asíncrona vía RabbitMQ
- ✅ **API Gateway** como punto de entrada único
- ✅ **Integración con Gemini AI** para interacción natural con el sistema
- ✅ **Model Context Protocol (MCP)** para herramientas de IA
- ✅ **Webhooks con Supabase** para eventos externos
- ✅ **Idempotencia** para prevenir duplicados
- ✅ **Base de datos PostgreSQL** distribuida
- ✅ **Docker Compose** para orquestación completa

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    Cliente / Usuario                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              API Gateway (Puerto 3000)                       │
│  - /reservas          → Gestión de reservas                 │
│  - /menus             → Gestión de menús y platos           │
│  - /ai                → Endpoint de IA (Gemini)            │
└──────────┬───────────────────────────┬───────────────────────┘
           │                           │
           ↓                           ↓
    ┌──────────────┐          ┌──────────────┐
    │  Reserva-MS  │          │   Menu-MS    │
    │ (Puerto 3001)│          │ (Puerto 3002)│
    └──────┬───────┘          └──────┬───────┘
           │                        │
           └──────────┬─────────────┘
                      ↓
           ┌──────────────────────┐
           │    RabbitMQ          │
           │  (Puerto 5672)       │
           │  - reserva_queue     │
           │  - menu_queue        │
           └──────────────────────┘
                      │
           ┌──────────┴──────────┐
           ↓                     ↓
    ┌──────────────┐     ┌──────────────┐
    │  PostgreSQL  │     │  MCP Server  │
    │ (Puerto 5432)│     │ (Puerto 3005)│
    │ - reserva_db │     │ - Tools MCP  │
    │ - menu_db    │     │ - Gateway    │
    └──────────────┘     │   Client     │
                         └──────────────┘
           │
           ↓
    ┌──────────────┐
    │   Supabase   │
    │  Webhooks    │
    └──────────────┘
```

## 🚀 Inicio Rápido

### Prerrequisitos

- **Docker** y **Docker Compose** instalados
- **Node.js 20+** (para desarrollo local)
- **Claves API**:
  - Gemini API Key ([obtener aquí](https://makersuite.google.com/app/apikey))
  - Supabase Anon Key (de tu proyecto Supabase)

### Configuración Inicial

1. **Clonar el repositorio** (si aplica)

2. **Configurar variables de entorno**

   Crea un archivo `.env` en la raíz del proyecto (`SegundoParcial/MCP-main/`):

   ```env
   SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui
   GEMINI_API_KEY=tu_gemini_api_key_aqui
   ```

   > 📝 Ver [ENV_VARIABLES.md](./ENV_VARIABLES.md) para documentación completa de variables
   > 
   > ⚠️ **IMPORTANTE**: Antes de continuar, configura Supabase y Gemini AI siguiendo la guía en [CONFIGURACION_SUPABASE_GEMINI.md](./CONFIGURACION_SUPABASE_GEMINI.md)

3. **Levantar los servicios**

```bash
   cd SegundoParcial/MCP-main
   
   # Limpiar volúmenes anteriores (opcional)
docker-compose down -v

# Construir e iniciar todos los servicios
docker-compose up --build
```

4. **Verificar que los servicios estén corriendo**

- Gateway: `http://localhost:3000`
   - Reserva-MS: `http://localhost:3001`
   - Menu-MS: `http://localhost:3002`
   - RabbitMQ Management: `http://localhost:15672` (usuario: `guest`, contraseña: `guest`)
   - MCP Server: `http://localhost:3005` (si se ejecuta por separado)

## 📚 Componentes del Sistema

### 1. API Gateway (`gateway/`)

**Puerto:** 3000

**Responsabilidades:**
- Punto de entrada único para todas las solicitudes
- Enrutamiento a microservicios vía RabbitMQ
- Integración con Gemini AI para interacciones naturales
- Cliente MCP para herramientas de IA

**Endpoints:**

- `POST /reservas` - Crear reserva
- `GET /reservas` - Listar reservas
- `GET /reservas/:id` - Obtener reserva por ID
- `POST /reservas/mesas` - Crear mesa
- `GET /reservas/mesas` - Listar mesas
- `GET /reservas/mesas/:id` - Obtener mesa por ID
- `POST /reservas/clientes` - Crear cliente
- `GET /reservas/clientes` - Listar clientes
- `GET /reservas/clientes/:id` - Obtener cliente por ID
- `POST /menus` - Crear menú
- `GET /menus` - Listar menús
- `GET /menus/:id` - Obtener menú por ID
- `POST /menus/platos` - Crear plato
- `GET /menus/platos` - Listar platos
- `GET /menus/platos/:id` - Obtener plato por ID
- `GET /menus/:menu_id/platos` - Listar platos de un menú
- `POST /menus/categorias` - Crear categoría
- `GET /menus/categorias` - Listar categorías
- `GET /menus/categorias/:id` - Obtener categoría por ID
- `POST /ai` - Endpoint de IA (interacción natural)

**Variables de Entorno:**
```env
PORT=3000
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
RABBITMQ_QUEUE_MENU=menu_queue
RABBITMQ_QUEUE_RESERVA=reserva_queue
GEMINI_API_KEY=tu_gemini_api_key_aqui
MCP_RPC_URL=http://host.docker.internal:3005/rpc
```

### 2. Microservicio de Reservas (`reserva-ms/`)

**Puerto:** 3001

**Responsabilidades:**
- Gestión CRUD de reservas, mesas y clientes
- Validación de disponibilidad de mesas
- Envío de webhooks a Supabase cuando se crea una reserva

**Mensajes RabbitMQ que escucha:**
- `reserva.crear` - Crear nueva reserva
- `reserva.listar` - Listar todas las reservas
- `reserva.obtener` - Obtener reserva por ID
- `reserva.validar` - Validar existencia de reserva
- `mesa.crear` - Crear nueva mesa
- `mesa.listar` - Listar todas las mesas
- `mesa.obtener` - Obtener mesa por ID
- `mesa.validar` - Validar existencia de mesa
- `cliente.crear` - Crear nuevo cliente
- `cliente.listar` - Listar todos los clientes
- `cliente.obtener` - Obtener cliente por ID

**Variables de Entorno:**
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

**Estructura de la Base de Datos:**
```sql
CREATE TABLE reserva (
  id_reserva SERIAL PRIMARY KEY,
  id_cliente INTEGER NOT NULL,
  id_mesa INTEGER NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIMESTAMP NOT NULL,
  hora_fin TIMESTAMP NOT NULL,
  estado VARCHAR(50) NOT NULL
);

CREATE TABLE mesa (
  id_mesa SERIAL PRIMARY KEY,
  numero VARCHAR(50) NOT NULL,
  capacidad INTEGER NOT NULL,
  estado VARCHAR(50) NOT NULL
);

CREATE TABLE cliente (
  id_cliente SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) NOT NULL,
  telefono VARCHAR(50) NOT NULL
);
```

### 3. Microservicio de Menús (`menu-ms/`)

**Puerto:** 3002

**Responsabilidades:**
- Gestión CRUD de menús, platos y categorías
- Validación de menús antes de crear platos
- Idempotencia para prevenir duplicados
- Envío de webhooks a Supabase cuando se crea un plato

**Mensajes RabbitMQ que escucha:**
- `plato.crear` - Crear nuevo plato
- `plato.listar` - Listar todos los platos
- `plato.obtener` - Obtener plato por ID
- `plato.listar_por_menu` - Listar platos de un menú
- `menu.crear` - Crear nuevo menú
- `menu.listar` - Listar todos los menús
- `menu.obtener` - Obtener menú por ID
- `categoria.crear` - Crear nueva categoría
- `categoria.listar` - Listar todas las categorías
- `categoria.obtener` - Obtener categoría por ID

**Variables de Entorno:**
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

**Estructura de la Base de Datos:**
```sql
CREATE TABLE menu (
  id_menu SERIAL PRIMARY KEY,
  fecha DATE NOT NULL
);

CREATE TABLE plato (
  id_plato SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  disponible BOOLEAN DEFAULT TRUE,
  id_menu INTEGER NOT NULL,
  id_categoria INTEGER NOT NULL
);

CREATE TABLE categoria_menu (
  id_categoria SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL
);

CREATE TABLE idempotencia (
  id SERIAL PRIMARY KEY,
  idempotency_key VARCHAR(255) UNIQUE NOT NULL,
  procesado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. MCP Server (`mcp-server/`)

**Puerto:** 3005

**Responsabilidades:**
- Servidor Model Context Protocol para herramientas de IA
- Proporciona herramientas que Gemini puede usar:
  - `buscar_reserva` - Buscar reservas por texto
  - `validar_mesa_existe` - Validar existencia y disponibilidad de mesa
  - `crear_reserva` - Crear una nueva reserva
  - `buscar_plato` - Buscar platos por texto
  - `crear_plato` - Crear un nuevo plato en un menú

**Variables de Entorno:**
```env
PORT=3005
GATEWAY_URL=http://localhost:3000
```

**Protocolo:** JSON-RPC 2.0

**Endpoints:**
- `POST /rpc` - Endpoint JSON-RPC principal
  - `tools/list` - Listar herramientas disponibles
  - `tools/call` - Ejecutar una herramienta

### 5. Base de Datos PostgreSQL

**Puerto:** 5432

**Bases de Datos:**
- `reserva_db` - Base de datos para el microservicio de reservas
- `menu_db` - Base de datos para el microservicio de menús

**Inicialización:** El archivo `init.sql` crea automáticamente las bases de datos al iniciar el contenedor.

### 6. RabbitMQ

**Puertos:**
- `5672` - AMQP protocol
- `15672` - Management UI

**Credenciales por defecto:**
- Usuario: `guest`
- Contraseña: `guest`

**Colas:**
- `reserva_queue` - Cola para mensajes del reserva-ms
- `menu_queue` - Cola para mensajes del menu-ms

## 🔄 Flujos de Negocio

### 1. Crear una Reserva

```
Cliente → Gateway (POST /reservas)
    ↓
Gateway → RabbitMQ (patrón: reserva.crear)
    ↓
Reserva-MS:
  1. Valida que la mesa existe y está disponible
  2. Valida que el cliente existe
  3. Guarda reserva en PostgreSQL
  4. Actualiza estado de la mesa a "reservada"
  5. Envía webhook a Supabase (evento: reserva_creada)
    ↓
Response ← Reserva-MS ← Gateway ← Cliente
```

### 2. Crear un Plato

```
Cliente → Gateway (POST /menus/platos)
    ↓
Gateway → RabbitMQ (patrón: plato.crear)
    ↓
Menu-MS:
  1. Verifica idempotencia (evita duplicados)
  2. Valida que el menú existe
  3. Valida que la categoría existe
  4. Guarda plato en PostgreSQL
  5. Emite evento "plato.creado" (RabbitMQ)
  6. Envía webhook a Supabase
    ↓
Response ← Menu-MS ← Gateway ← Cliente
```

### 3. Consulta Distribuida (Menú + Platos)

```
Cliente → Gateway (GET /menus/:id)
    ↓
Gateway:
  1. Obtiene menú (RabbitMQ → menu.obtener)
  2. Obtiene platos (RabbitMQ → plato.listar_por_menu)
    ↓
Menu-MS responde con menú y platos relacionados
    ↓
Response (menú + platos) ← Gateway ← Cliente
```

### 4. Interacción con IA

```
Cliente → Gateway (POST /ai { text: "Crea una reserva para la mesa 5" })
    ↓
Gateway → GeminiService
    ↓
Gemini decide usar herramienta: validar_mesa_existe
    ↓
Gateway → MCP Server (tools/call: validar_mesa_existe)
    ↓
MCP Server → Gateway API (GET /reservas/mesas/5)
    ↓
Gateway → RabbitMQ → Reserva-MS
    ↓
Resultado ← Reserva-MS ← Gateway ← MCP Server
    ↓
Gemini usa crear_reserva con los datos
    ↓
MCP Server → Gateway API (POST /reservas)
    ↓
Response ← Gateway ← Cliente
```

## 🧪 Ejemplos de Uso

### Crear una Reserva

```bash
curl -X POST http://localhost:3000/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "id_cliente": 1,
    "id_mesa": 1,
    "fecha": "2024-12-25",
    "hora_inicio": "2024-12-25T19:00:00Z",
    "hora_fin": "2024-12-25T21:00:00Z"
  }'
```

### Listar Reservas

```bash
curl http://localhost:3000/reservas
```

### Crear un Plato

```bash
curl -X POST http://localhost:3000/menus/platos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Pasta Carbonara",
    "descripcion": "Pasta con tocino, huevo y queso parmesano",
    "precio": 15.99,
    "id_menu": 1,
    "id_categoria": 1,
    "disponible": true
  }'
```

### Obtener Menú con Platos

```bash
curl http://localhost:3000/menus/1
```

### Crear una Mesa

```bash
curl -X POST http://localhost:3000/reservas/mesas \
  -H "Content-Type: application/json" \
  -d '{
    "numero": "Mesa 5",
    "capacidad": 4,
    "estado": "disponible"
  }'
```

### Interacción con IA

```bash
curl -X POST http://localhost:3000/ai \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Verifica si la mesa 5 está disponible y crea una reserva para mañana a las 8pm"
  }'
```

## 🛠️ Desarrollo Local

### Instalar Dependencias

```bash
# Reserva-MS
cd reserva-ms && npm install

# Menu-MS
cd menu-ms && npm install

# Gateway
cd gateway && npm install

# MCP Server
cd mcp-server && npm install
```

### Ejecutar en Desarrollo (sin Docker)

**Terminal 1 - PostgreSQL y RabbitMQ:**
```bash
docker-compose up postgres rabbitmq
```

**Terminal 2 - Reserva-MS:**
```bash
cd reserva-ms
npm run start:dev
```

**Terminal 3 - Menu-MS:**
```bash
cd menu-ms
npm run start:dev
```

**Terminal 4 - Gateway:**
```bash
cd gateway
npm run start:dev
```

**Terminal 5 - MCP Server (opcional, para desarrollo):**
```bash
cd mcp-server
npm run dev
```

### Compilar a Producción

```bash
npm run build
```

## 🧪 Testing

### Tests Unitarios

```bash
npm run test
```

### Tests E2E

```bash
npm run test:e2e
```

## 🔐 Seguridad y Webhooks

### Firma de Webhooks

Los webhooks enviados a Supabase incluyen una firma HMAC-SHA256 en el header `X-Signature` para verificación:

```javascript
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');
```

### Estructura del Payload

```json
{
  "event": "reserva_creada",
  "version": "1.0",
  "idempotency_key": "reserva-1-creada",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "reserva_id": 1,
    "id_cliente": 1,
    "id_mesa": 1,
    "fecha": "2024-12-25",
    "hora_inicio": "2024-12-25T19:00:00Z",
    "hora_fin": "2024-12-25T21:00:00Z",
    "estado": "pendiente"
  },
  "metadata": {
    "source": "ReservaMS",
    "environment": "local"
  }
}
```

## 📊 Monitoreo

### RabbitMQ Management UI

Accede a `http://localhost:15672` para:
- Ver colas y mensajes
- Monitorear conexiones
- Revisar estadísticas de mensajes

### Logs de Docker

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f gateway
docker-compose logs -f reserva-ms
docker-compose logs -f menu-ms
```

## 🐳 Docker Compose

El archivo `docker-compose.yml` orquesta todos los servicios:

- **postgres**: Base de datos PostgreSQL
- **rabbitmq**: Broker de mensajes
- **reserva-ms**: Microservicio de reservas
- **menu-ms**: Microservicio de menús
- **gateway**: API Gateway

### Comandos Útiles

```bash
# Iniciar servicios
docker-compose up

# Iniciar en segundo plano
docker-compose up -d

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reconstruir imágenes
docker-compose up --build

# Ver logs
docker-compose logs -f [servicio]
```

## 📝 Variables de Entorno

Para documentación completa de todas las variables de entorno, consulta [ENV_VARIABLES.md](./ENV_VARIABLES.md).

## 🔧 Troubleshooting

### Error: "Missing GEMINI_API_KEY"

Asegúrate de configurar la variable `GEMINI_API_KEY` en el archivo `.env` o en `docker-compose.yml`.

### Error: "WEBHOOK_SECRET no está definido"

Verifica que las variables de entorno estén configuradas correctamente en `docker-compose.yml`.

### Error de conexión a RabbitMQ

Verifica que RabbitMQ esté corriendo:
```bash
docker-compose ps rabbitmq
```

### Error de conexión a PostgreSQL

Verifica que PostgreSQL esté corriendo y saludable:
```bash
docker-compose ps postgres
```

### MCP Server no responde

Si el MCP Server se ejecuta fuera de Docker, asegúrate de que:
- Esté corriendo en el puerto 3005
- El gateway pueda acceder a `http://host.docker.internal:3005/rpc`

## 📚 Recursos Adicionales

- [NestJS Documentation](https://docs.nestjs.com/)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [Google Gemini AI](https://ai.google.dev/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Supabase Documentation](https://supabase.com/docs)

## 📄 Licencia

Este proyecto es parte de la tarea de Aplicaciones para Servidor Web - Parcial 2.

## 👥 Contribución

Para contribuir al proyecto:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Realiza tus cambios
4. Envía un pull request

## 📧 Soporte

Para problemas o preguntas:
- Revisa la documentación en este README
- Consulta [ENV_VARIABLES.md](./ENV_VARIABLES.md) para configuración
- Revisa los logs de los servicios

---

**Desarrollado con ❤️ usando NestJS, RabbitMQ, PostgreSQL, Gemini AI y MCP**
