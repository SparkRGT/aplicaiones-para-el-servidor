# Taller Completo: Arquitectura Híbrida + Webhooks Serverless

Este proyecto implementa una arquitectura de microservicios distribuidos con comunicación asíncrona mediante RabbitMQ, y un sistema de webhooks con funciones serverless para notificaciones y auditoría.

## Arquitectura

```
[API Gateway] ↔ [Microservicio A] ↔ RabbitMQ → [Microservicio B]
                                    ↓               ↓
                            [Webhook Publisher A] [Webhook Publisher B]
                                    ↓               ↓
                            HTTP POST (HMAC) HTTP POST (HMAC)
                                    ↓               ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
        [Edge Function 1]              [Edge Function 2]
        (Serverless Logger)            (External Notifier)
                    ↓                               ↓
            PostgreSQL                    Telegram Bot
            (Auditoría)                   (Notificaciones)
```

## Componentes

### Taller 1: Arquitectura Híbrida

- **API Gateway**: Punto de entrada HTTP REST que enruta peticiones al Microservicio A
- **Microservicio A**: Entidad Maestra (Productos) con BD propia, publica eventos a RabbitMQ
- **Microservicio B**: Entidad Transaccional (Órdenes) con BD propia, consume eventos de RabbitMQ
- **RabbitMQ**: Message broker para comunicación asíncrona entre microservicios

### Taller 2: Webhooks y Serverless

- **Webhook Publisher**: Módulo que escucha eventos de RabbitMQ y los publica como webhooks firmados con HMAC-SHA256
- **Circuit Breaker**: Protege endpoints externos con estados CLOSED/OPEN/HALF_OPEN
- **Edge Function 1 (Event Logger)**: Función serverless que valida, verifica idempotencia y guarda eventos en PostgreSQL
- **Edge Function 2 (External Notifier)**: Función serverless que envía notificaciones a Telegram Bot

## Requisitos Previos

- Node.js 18+ y npm
- Docker y Docker Compose
- Bot de Telegram (opcional, para notificaciones)

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd practica-webhook
```

### 2. Configurar variables de entorno

Copiar `.env.example` y configurar las variables necesarias:

```bash
cp .env.example .env
```

Editar `.env` con tus valores:

```env
# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=admin123

# Microservicio A
MICROSERVICIO_A_PORT=3001
MICROSERVICIO_A_DB_HOST=localhost
MICROSERVICIO_A_DB_PORT=5432
MICROSERVICIO_A_DB_USER=postgres
MICROSERVICIO_A_DB_PASSWORD=postgres123
MICROSERVICIO_A_DB_NAME=microservicio_a_db

# Microservicio B
MICROSERVICIO_B_PORT=3002
MICROSERVICIO_B_DB_HOST=localhost
MICROSERVICIO_B_DB_PORT=5433
MICROSERVICIO_B_DB_USER=postgres
MICROSERVICIO_B_DB_PASSWORD=postgres123
MICROSERVICIO_B_DB_NAME=microservicio_b_db

# Webhooks DB
WEBHOOKS_DB_HOST=localhost
WEBHOOKS_DB_PORT=5434
WEBHOOKS_DB_USER=postgres
WEBHOOKS_DB_PASSWORD=postgres123
WEBHOOKS_DB_NAME=webhooks_db

# Supabase Edge Functions
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
WEBHOOK_SECRET_1=edge_function_1_secret_key
WEBHOOK_SECRET_2=edge_function_2_secret_key

# Telegram (opcional)
TELEGRAM_BOT_TOKEN=tu-bot-token
TELEGRAM_CHAT_ID=tu-chat-id
```

### 3. Iniciar infraestructura con Docker Compose

```bash
docker-compose up -d
```

Esto iniciará:
- RabbitMQ (puerto 5672, management UI en 15672)
- PostgreSQL para Microservicio A (puerto 5432)
- PostgreSQL para Microservicio B (puerto 5433)
- PostgreSQL para Webhooks (puerto 5434)
- Redis (puerto 6379)

### 4. Instalar dependencias

```bash
# API Gateway
cd api-gateway
npm install
cd ..

# Microservicio A
cd microservicio-a
npm install
cd ..
xxxxxxxxx
# Microservicio B
cd microservicio-b
npm install
cd ..

# Webhook Publisher
cd webhook-publisher
npm install
cd ..
```

### 5. Ejecutar los servicios

En terminales separadas:

```bash
# Terminal 1: API Gateway
cd api-gateway
npm run start:dev

# Terminal 2: Microservicio A
cd microservicio-a
npm run start:dev

# Terminal 3: Microservicio B
cd microservicio-b
npm run start:dev
```

## Despliegue de Edge Functions en Supabase

### 1. Instalar Supabase CLI

```bash
npm install -g supabase
```

### 2. Iniciar sesión en Supabase

```bash
supabase login
```

### 3. Vincular proyecto

```bash
supabase link --project-ref tu-project-ref
```

### 4. Desplegar Edge Functions

```bash
# Edge Function 1: Event Logger
supabase functions deploy event-logger

# Edge Function 2: External Notifier
supabase functions deploy external-notifier
```

### 5. Configurar secrets de Edge Functions

```bash
# Para Event Logger
supabase secrets set WEBHOOK_SECRET=edge_function_1_secret_key --project-ref tu-project-ref

# Para External Notifier
supabase secrets set WEBHOOK_SECRET=edge_function_2_secret_key --project-ref tu-project-ref
supabase secrets set TELEGRAM_BOT_TOKEN=tu-bot-token --project-ref tu-project-ref
supabase secrets set TELEGRAM_CHAT_ID=tu-chat-id --project-ref tu-project-ref
```

## Uso

### 1. Crear un producto (Microservicio A)

```bash
curl -X POST y   \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Producto Ejemplo",
    "precio": 29.99,
    "stock": 100
  }'
```

Esto:
1. Crea el producto en Microservicio A
2. Publica evento `producto.creado` a RabbitMQ
3. Webhook Publisher escucha el evento y lo envía a Edge Functions
4. Edge Function 1 guarda el evento en PostgreSQL
5. Edge Function 2 envía notificación a Telegram

### 2. Solicitar una orden (Microservicio A)

```bash
curl -X POST http://localhost:3000/api/productos/1/orden \
  -H "Content-Type: application/json" \
  -d '{
    "cantidad": 2
  }'
```

Esto:
1. Valida stock en Microservicio A
2. Publica evento `orden.solicitada` a RabbitMQ
3. Microservicio B consume el evento y crea la orden
4. Webhook Publishers envían eventos a Edge Functions

### 3. Ver órdenes procesadas (Microservicio B)

```bash
curl http://localhost:3002/api/ordenes
```

## Características Implementadas

### Webhook Publisher

- ✅ Escucha eventos de RabbitMQ
- ✅ Transforma eventos a formato webhook estándar
- ✅ Firma payloads con HMAC-SHA256
- ✅ Retry con exponential backoff (6 intentos: 1min, 5min, 30min, 2h, 12h)
- ✅ Registro completo de entregas en `webhook_deliveries`

### Circuit Breaker

- ✅ Estados: CLOSED, OPEN, HALF_OPEN
- ✅ Umbral de 5 fallos consecutivos → OPEN
- ✅ Timeout de 60 segundos antes de transición a HALF_OPEN
- ✅ Persistencia en PostgreSQL
- ✅ Protege endpoints externos de sobrecarga

### Edge Function 1 (Event Logger)

- ✅ Validación de firma HMAC
- ✅ Verificación de timestamp (anti-replay, máx 5 minutos)
- ✅ Verificación de idempotencia
- ✅ Guardado de eventos en PostgreSQL

### Edge Function 2 (External Notifier)

- ✅ Validación de firma HMAC
- ✅ Verificación de idempotencia
- ✅ Envío de notificaciones a Telegram Bot
- ✅ Retorna 500 para retry si falla Telegram

## Estructura del Proyecto

```
practica-webhook/
├── api-gateway/          # API Gateway (NestJS)
├── microservicio-a/      # Microservicio A - Productos
├── microservicio-b/      # Microservicio B - Órdenes
├── webhook-publisher/    # Módulo de Webhook Publisher
├── supabase/
│   └── functions/        # Edge Functions
│       ├── event-logger/
│       └── external-notifier/
├── scripts/              # Scripts SQL
│   ├── schema-taller1.sql
│   └── schema-taller2.sql
├── docs/                 # Documentación
│   └── circuit-breaker.md
├── docker-compose.yml    # Infraestructura
└── README.md
```

## Monitoreo

### RabbitMQ Management UI

Acceder a: http://localhost:15672
- Usuario: admin
- Contraseña: admin123

### Logs de Webhooks

Consultar tabla `webhook_deliveries` en la BD de webhooks para ver el estado de todas las entregas.

### Estado del Circuit Breaker

Consultar tabla `circuit_breaker_state` para ver el estado de cada circuito.

## Troubleshooting

### Los webhooks no se envían

1. Verificar que RabbitMQ esté corriendo
2. Verificar que las suscripciones estén activas en `webhook_subscriptions`
3. Revisar logs de `webhook_deliveries` para ver errores
4. Verificar que las URLs de Edge Functions sean correctas

### Circuit Breaker está OPEN

1. Verificar que las Edge Functions estén desplegadas y funcionando
2. Esperar 60 segundos para que transicione a HALF_OPEN
3. Verificar logs de errores en `webhook_deliveries`

### Edge Functions no reciben webhooks

1. Verificar que las funciones estén desplegadas en Supabase
2. Verificar que los secrets estén configurados correctamente
3. Verificar que las URLs en `webhook_subscriptions` sean correctas
4. Revisar logs de Supabase Functions

## Desarrollo

### Ejecutar tests

```bash
# En cada microservicio
npm test
```

### Ver logs

```bash
# Ver logs de Docker
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f rabbitmq
```

## Licencia

Este proyecto es parte de un taller académico.

## Autor

Desarrollado como parte del Taller de Arquitectura Híbrida y Webhooks Serverless.

