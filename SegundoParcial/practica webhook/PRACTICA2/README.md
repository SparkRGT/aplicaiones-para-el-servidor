# 🚀 Event-Driven Architecture with Webhooks & Circuit Breaker

Arquitectura de microservicios con comunicación asíncrona basada en webhooks, implementando el patrón **Circuit Breaker** para proteger servicios externos.

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura](#arquitectura)
- [Componentes](#componentes)
- [Setup e Instalación](#setup-e-instalación)
- [Configuración](#configuración)
- [Eventos de Negocio](#eventos-de-negocio)
- [Circuit Breaker Pattern](#circuit-breaker-pattern)
- [Pruebas](#pruebas)
- [Monitoreo](#monitoreo)

---

## Descripción General

Este proyecto implementa una arquitectura **Event-Driven** empresarial con:

- ✅ **Webhooks Confiables**: Publicación de eventos con firma HMAC-SHA256
- ✅ **Exponential Backoff**: Reintentos inteligentes (6 intentos con delays crecientes)
- ✅ **Circuit Breaker**: Protección de servicios externos (CLOSED → OPEN → HALF_OPEN)
- ✅ **Idempotencia**: Deduplicación de eventos duplicados
- ✅ **Anti-Replay**: Validación de timestamps
- ✅ **Notificaciones Email**: Integración con Resend/SendGrid
- ✅ **Observabilidad**: Logs estructurados y correlation IDs

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway (Puerto 3000)                 │
└────────────────────────┬──────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼────────┐  ┌────▼──────────┐  ┌─▼─────────────┐
│ Microservicio A│  │ RabbitMQ      │  │Microservicio B│
│  (Productos)   │  │  (Exchange)   │  │  (Órdenes)    │
│  Puerto 3001   │  │  Puerto 5672  │  │  Puerto 3002  │
└───────┬────────┘  └───┬──────────┬┘  └─┬──────────────┘
        │                │        │       │
        └────────────────┼────────┼───────┘
                         │        │
              Publicar Webhooks   │
                         │        │
        ┌────────────────▼────────▼─────┐
        │   Supabase (PostgreSQL)       │
        │  - webhook_events             │
        │  - webhook_deliveries         │
        │  - circuit_breaker_state      │
        └────────┬───────────┬──────────┘
                 │           │
        ┌────────▼─┐  ┌──────▼─────────┐
        │ Edge Fn 1│  │  Edge Fn 2     │
        │  Logger  │  │  Notifier      │
        │(Logging) │  │ (Email/Circuit)│
        └──────────┘  └────────────────┘
```

---

## Componentes

### 1. **Microservicio A - Productos**
- Gestiona catálogo de productos
- Emite eventos: `producto.creado`, `producto.actualizado`, `producto.eliminado`
- Puerto: 3001 (desarrollo)
- Base de datos: PostgreSQL 5435

### 2. **Microservicio B - Órdenes**
- Procesa órdenes desde RabbitMQ
- Emite evento: `orden.procesada`
- Puerto: 3002 (desarrollo)
- Base de datos: PostgreSQL 5433

### 3. **RabbitMQ**
- Message broker para comunicación interna
- Puerto: 5672
- Exchange: `eventos_exchange`

### 4. **Supabase (Edge Functions + PostgreSQL)**
- **webhook-event-logger**: Valida y loguea todos los webhooks
- **webhook-external-notifier**: Envía notificaciones por email con Circuit Breaker
- Base de datos: PostgreSQL con tablas de webhooks

### 5. **Circuit Breaker Pattern**
Protege contra fallos en servicios externos:
- **CLOSED**: Funcionamiento normal
- **OPEN**: Servicio caído, rechaza requests (después de 5 fallos)
- **HALF_OPEN**: Período de prueba, permite 1 request de recuperación

---

## Setup e Instalación

### Prerrequisitos

```bash
# Node.js 16+
node --version

# Docker y Docker Compose
docker --version
docker-compose --version

# Deno (para Edge Functions local)
deno --version

# CLI de Supabase (opcional, para deploy)
brew install supabase/tap/supabase
```

### 1. Clonar y Instalar Dependencias

```bash
# Clonar repositorio
git clone <repo>
cd PRACTICA2

# Instalar dependencias en microservicios
cd microservicio-a && npm install && cd ..
cd microservicio-b && npm install && cd ..
cd api-gateway && npm install && cd ..
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con valores reales:
# - URLs de Supabase
# - Claves API
# - Credenciales de base de datos
```

### 3. Levantar Infraestructura con Docker Compose

```bash
# Levantar PostgreSQL y RabbitMQ
docker-compose up -d

# Verificar que está listo
docker-compose ps

# Ver logs
docker-compose logs -f
```

### 4. Crear Esquema de Base de Datos

```bash
# Copiar schema.sql a PostgreSQL
psql -h localhost -U postgres -f supabase/schema.sql

# Verificar tablas creadas
psql -h localhost -U postgres -d webhooks_db -c "\dt"
```

### 5. Deployar Edge Functions en Supabase

```bash
# Configurar Supabase CLI
supabase init
supabase link --project-ref YOUR_PROJECT_REF

# Configurar secrets
supabase secrets set WEBHOOK_SECRET=webhook_secret_logger_key_123456
supabase secrets set RESEND_API_KEY=your_resend_api_key

# Desplegar funciones
supabase functions deploy webhook-event-logger
supabase functions deploy webhook-external-notifier

# Verificar deployment
supabase functions list
```

### 6. Iniciar Microservicios

```bash
# Terminal 1: Microservicio A
cd microservicio-a
npm run start

# Terminal 2: Microservicio B
cd microservicio-b
npm run start

# Terminal 3: API Gateway
cd api-gateway
npm run start

# Verificar en http://localhost:3000
```

---

## Configuración

### Variables de Entorno Críticas

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Webhooks
WEBHOOK_SECRET_LOGGER=shared_secret_123
WEBHOOK_SECRET_NOTIFIER=shared_secret_456

# Email
RESEND_API_KEY=re_xxxxxxxxxxxxx
DEFAULT_EMAIL=notifications@company.com

# Microservicios
NODE_ENV=development
```

### Configuración de Webhooks

Archivo: `microservicio-a/src/config/webhooks.config.json`

```json
{
  "webhooks": {
    "enabled": true,
    "retryPolicy": {
      "maxAttempts": 6,
      "backoffType": "exponential",
      "initialDelayMs": 60000,
      "maxDelayMs": 43200000,
      "timeoutMs": 10000
    },
    "circuitBreaker": {
      "enabled": true,
      "failureThreshold": 5,
      "successThreshold": 2,
      "timeout": 60000,
      "halfOpenRequests": 1
    }
  }
}
```

---

## Eventos de Negocio

### Evento: `producto.creado`

**Emisor**: Microservicio A  
**Estructura**:

```json
{
  "event": "producto.creado",
  "version": "1.0",
  "id": "evt_a1b2c3d4e5f6",
  "idempotency_key": "producto.creado-123-published-2025-12-15",
  "timestamp": "2025-12-15T10:30:45.123Z",
  "data": {
    "productoId": 123,
    "nombre": "Laptop Pro",
    "precio": 1299.99,
    "stock": 50
  },
  "metadata": {
    "source": "microservice-a",
    "environment": "production",
    "correlation_id": "req_abc123xyz"
  }
}
```

**Suscriptores**:
- webhook-event-logger (logging)
- webhook-external-notifier (notificación email)

---

### Evento: `orden.procesada`

**Emisor**: Microservicio B  
**Estructura**:

```json
{
  "event": "orden.procesada",
  "version": "1.0",
  "id": "evt_x7y8z9a0b1c2",
  "idempotency_key": "orden.procesada-456-published-2025-12-15",
  "timestamp": "2025-12-15T11:15:30.000Z",
  "data": {
    "ordenId": 456,
    "productoId": 123,
    "cantidad": 2,
    "total": 2599.98,
    "estado": "procesada"
  },
  "metadata": {
    "source": "microservice-b",
    "environment": "production",
    "correlation_id": "req_xyz789abc"
  }
}
```

---

## Circuit Breaker Pattern

### Estados y Transiciones

```
CLOSED (Normal)
    ↓ (5 fallos)
OPEN (Rechaza requests)
    ↓ (Espera timeout: 60s)
HALF_OPEN (Prueba de recuperación)
    ↓ (2 éxitos)
CLOSED (Recuperado)
    ↓ (1 fallo)
OPEN (Abierto nuevamente)
```

### Implementación en Edge Function

```typescript
// Obtener estado actual
const cbStatus = await getCircuitBreakerStatus(emailEndpoint);

if (cbStatus.state === CircuitBreakerState.OPEN) {
  console.warn("🔴 Circuit Breaker OPEN - Service unavailable");
  return new Response({ error: "Service temporarily unavailable" }, {
    status: 503
  });
}

// Intentar enviar email
try {
  await sendEmail(to, subject, html);
  
  // Si está en HALF_OPEN, volver a CLOSED
  if (cbStatus.state === CircuitBreakerState.HALF_OPEN) {
    await updateCircuitBreakerStatus(endpoint, CLOSED, 0);
  }
} catch (error) {
  // Incrementar contador de fallos
  const newFailureCount = cbStatus.failureCount + 1;
  
  if (newFailureCount >= 5) {
    // Abrir circuit breaker
    await updateCircuitBreakerStatus(endpoint, OPEN, newFailureCount);
  }
}
```

### Monitoreo del Circuit Breaker

Endpoint para ver estado actual:

```bash
curl http://localhost:3001/webhooks/circuit-breaker
```

Respuesta:

```json
{
  "https://api.resend.com/emails": {
    "state": "OPEN",
    "failureCount": 5,
    "lastFailureAt": "2025-12-15T10:35:42.123Z",
    "openedAt": "2025-12-15T10:35:42.123Z"
  }
}
```

---

## Pruebas

### 1. **Happy Path - Flujo Completo**

```bash
# Crear un producto (dispara webhook)
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Laptop Gaming",
    "precio": 1999.99,
    "stock": 10
  }'

# Verificar en logs:
# - Microservicio A: "✅ Webhook publicado"
# - Edge Function Logger: "📥 Webhook recibido"
# - Edge Function Notifier: "✅ Email enviado"

# Consultar evento guardado
curl http://localhost:3001/webhooks/events
```

### 2. **Validación de Firma HMAC**

```bash
# Enviar con firma inválida
curl -X POST https://your-project.supabase.co/functions/v1/webhook-event-logger \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: sha256=INVALID" \
  -d '{"event": "test", "data": {}}'

# Resultado esperado: HTTP 401 - Invalid signature
```

### 3. **Idempotencia - Detectar Duplicados**

```bash
# Enviar el mismo webhook 3 veces
for i in {1..3}; do
  curl -X POST https://your-project.supabase.co/functions/v1/webhook-event-logger \
    -H "X-Webhook-Signature: sha256=..." \
    -H "X-Webhook-Timestamp: 1702660200" \
    -d '{"idempotency_key": "test-001", ...}'
done

# Resultados:
# 1. HTTP 200 - Procesado
# 2. HTTP 200 - {"duplicate": true}
# 3. HTTP 200 - {"duplicate": true}
```

### 4. **Circuit Breaker - Simular Fallo**

```bash
# 1. Pausar servicio de email (comentar RESEND_API_KEY)
# 2. Crear producto (dispara 6 intentos)
# 3. Observar en logs:
#    - Intento 1-5: "❌ Email fallo"
#    - Intento 5: "🔴 Circuit Breaker ABIERTO"
#    - Intento 6: "🔴 Circuit Breaker OPEN - rechazando"

# 4. Verificar estado
curl http://localhost:3001/webhooks/circuit-breaker

# 5. Reactivar email service
# 6. Esperar 60s (timeout)
# 7. Siguiente webhook: HALF_OPEN - permite 1 intento de recuperación
```

### 5. **Retry con Exponential Backoff**

```bash
# Crear producto
curl -X POST http://localhost:3000/api/productos ...

# Observar delays en reintentos:
# Intento 1: inmediato
# Intento 2: +60s
# Intento 3: +300s (5 min)
# Intento 4: +1800s (30 min)
# Intento 5: +7200s (2 horas)
# Intento 6: +43200s (12 horas)
```

---

## Monitoreo

### Ver Logs de Webhooks

```bash
# Entregadas exitosamente
docker exec -it microservicio-a tail -f data/webhooks/deliveries.jsonl

# Fallidas (Dead Letter Queue)
docker exec -it microservicio-a tail -f data/webhooks/dead-letter-queue.jsonl
```

### Consultar Base de Datos

```bash
# Eventos recibidos
psql -h localhost -U postgres -d webhooks_db
SELECT * FROM webhook_events ORDER BY received_at DESC;

# Intentos de entrega
SELECT * FROM webhook_deliveries ORDER BY delivered_at DESC;

# Estado del Circuit Breaker
SELECT endpoint_url, state, failure_count, last_failure_at 
FROM circuit_breaker_state;

# Notificaciones enviadas
SELECT * FROM webhook_notifications ORDER BY created_at DESC;
```

### Dashboards Recomendados

- **Supabase Admin**: https://app.supabase.com
- **RabbitMQ Admin**: http://localhost:15672 (guest/guest)
- **PostgreSQL**: pgAdmin en puerto 5050

---

## Resiliencia y Recuperación

### Strateg ias Implementadas

| Estrategia | Propósito | Configuración |
|-----------|----------|---------------|
| **Exponential Backoff** | Reintentos inteligentes | 6 intentos, delays crecientes |
| **HMAC Signing** | Seguridad de webhooks | SHA256 con secret compartido |
| **Timestamp Validation** | Anti-replay | TTL máximo 5 minutos |
| **Idempotency Keys** | Evitar duplicados | Clave única por evento |
| **Circuit Breaker** | Proteger servicios externos | 5 fallos → OPEN, 2 éxitos → CLOSED |
| **Dead Letter Queue** | Capturar fallos finales | Archivo local + BD |

---

## Mejores Prácticas Implementadas

✅ **Logs Estructurados**: JSON con correlation IDs  
✅ **Error Handling**: Try-catch en todos los flujos  
✅ **Timeouts**: 10s para requests HTTP  
✅ **Rate Limiting**: Configurable por endpoint  
✅ **Secret Management**: Variables de entorno (no hardcodeadas)  
✅ **Database Migrations**: Schema.sql para reproducibilidad  
✅ **Health Checks**: Endpoints `/health` en microservicios  
✅ **Request Tracing**: correlation_id en todos los eventos  

---

## Troubleshooting

### ❌ "Webhook Failed - Circuit Breaker OPEN"

```bash
# Verificar estado
curl http://localhost:3001/webhooks/circuit-breaker

# Resetear Circuit Breaker
curl -X POST http://localhost:3001/webhooks/circuit-breaker/reset \
  -H "Content-Type: application/json" \
  -d '{"endpoint": "https://api.resend.com/emails"}'
```

### ❌ "Invalid Signature"

```bash
# Verificar que WEBHOOK_SECRET_LOGGER coincide
# En microservicio-a/src/config/webhooks.config.json
# Y en Supabase secrets

# Verificar body JSON serializado sin espacios
echo -n '{"test":"data"}' | sha256sum
```

### ❌ "Duplicate Webhook Detected"

```bash
# Normal - significa que el evento se procesó antes
# Verificar en webhook_events
psql -c "SELECT idempotency_key, received_at FROM webhook_events 
  WHERE idempotency_key LIKE 'producto.creado%';"
```

---

## Contribuir

1. Fork el repositorio
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

## Licencia

Este proyecto está bajo la Licencia MIT.

---

## Soporte

Para preguntas o problemas:
- 📧 Email: support@example.com
- 💬 GitHub Issues: [issues](https://github.com/your-repo/issues)
- 📚 Documentación: [docs](./docs)

---

**Última actualización**: 15 de Diciembre de 2025  
**Versión**: 1.0.0
