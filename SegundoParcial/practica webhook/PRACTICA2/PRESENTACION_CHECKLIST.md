# 🎯 Checklist para Presentación - Práctica 2

## ✅ Antes de la Presentación

### 1. **Preparar Ambiente** (30 minutos)

```bash
# Clonar/actualizar repositorio
cd PRACTICA2

# Instalar dependencias
cd microservicio-a && npm install && cd ..
cd microservicio-b && npm install && cd ..
cd api-gateway && npm install && cd ..

# Levantar infraestructura
docker-compose up -d

# Esperar a que esté listo (30-60s)
docker-compose logs -f rabbitmq

# Crear esquema BD
psql -h localhost -U postgres -f supabase/schema.sql

# Iniciar microservicios (3 terminales)
# Terminal 1:
cd microservicio-a && npm run start

# Terminal 2:
cd microservicio-b && npm run start

# Terminal 3:
cd api-gateway && npm run start

# Verificar que está corriendo
curl http://localhost:3000/health
```

### 2. **Verificar Supabase (10 minutos)**

```bash
# Si van a deployar a Supabase
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets list

# Si no, usar URLs locales simuladas
# Las Edge Functions se pueden simular localmente con Deno
```

### 3. **Preparar Demostraciones (20 minutos)**

```bash
# Script 1: Happy Path (crear producto)
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Laptop Gaming", "precio": 1999.99, "stock": 10}'

# Script 2: Ver Circuit Breaker
curl http://localhost:3001/webhooks/circuit-breaker | jq

# Script 3: Simular fallo (comentar RESEND_API_KEY)
# Script 4: Ver recuperación después de 60s
```

### 4. **Preparar Presentación (40 minutos)**

- [ ] Abrir archivo README.md en editor
- [ ] Abrir 3 terminales con logs
- [ ] Tener curl command en portapapeles
- [ ] Preparar 2-3 demostraciones clave
- [ ] Ensayar respuestas a preguntas posibles

---

## 🎬 Estructura de Presentación (25 minutos)

### Bloque 1: Introducción (3 minutos)

**Qué vamos a mostrar:**
```
- Arquitectura de microservicios con comunicación asíncrona
- Webhooks con seguridad HMAC-SHA256
- Circuit Breaker Pattern para resiliencia
- Integración con Supabase Edge Functions
```

**Slide/Diagrama a mostrar:**
- Diagrama arquitectura (README.md)

---

### Bloque 2: Demostración Happy Path (7 minutos)

**Objetivo**: Mostrar flujo completo funcionando

**Demo Steps**:

```bash
# 1. Mostrar código: ProductosService.crear() (2 min)
# - Explicar cómo publica webhook

# 2. Ejecutar: Crear producto (1 min)
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Laptop Gaming RTX 4090",
    "precio": 2499.99,
    "stock": 15
  }' | jq

# 3. Mostrar logs en terminal (2 min)
# Terminal 1: Logs de Microservicio A
# - "✅ Webhook publicado"
# - "📤 Enviando webhook"

# 4. Verificar en BD (2 min)
psql -h localhost -U postgres -d webhooks_db -c \
  "SELECT event_type, event_id, received_at FROM webhook_events ORDER BY received_at DESC LIMIT 1;"

# 5. Ver estadísticas
curl http://localhost:3001/webhooks/circuit-breaker | jq
```

**Lo que el docente verá:**
- ✅ Producto creado en BD
- ✅ Webhook enviado exitosamente
- ✅ Evento registrado en Supabase
- ✅ Circuit Breaker en estado CLOSED
- ✅ Email simulado enviado

---

### Bloque 3: Demostración Circuit Breaker (10 minutos)

**Objetivo**: Mostrar cómo el sistema se recupera de fallos

**Setup Previo** (hacer antes de la presentación):

```bash
# 1. Comentar RESEND_API_KEY en .env
# 2. Crear producto → generará 6 intentos de envío

# Esto ocurrirá:
# Intento 1-5: Fallan, failureCount aumenta
# Intento 5: failureCount = 5 → CB pasa a OPEN
# Intento 6: Rechazado por CB (sin timeout)
```

**Demo Steps**:

```bash
# 1. Mostrar estado actual (CLOSED)
curl http://localhost:3001/webhooks/circuit-breaker | jq \
  '."https://api.resend.com/emails"'
# {
#   "state": "CLOSED",
#   "failureCount": 0
# }

# 2. Crear producto para disparar fallos
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Test CB", "precio": 100, "stock": 5}'

# 3. Observar logs (10-15 segundos)
tail -f microservicio-a/data/webhooks/deliveries.jsonl
# Verá: Intentos 1-5 fallados, Intento 6 rechazado por CB

# 4. Verificar estado (OPEN)
curl http://localhost:3001/webhooks/circuit-breaker | jq \
  '."https://api.resend.com/emails"'
# {
#   "state": "OPEN",
#   "failureCount": 5,
#   "openedAt": "2025-12-15T..."
# }

# 5. Mostrar código del Circuit Breaker
# Abrir: microservicio-a/src/services/circuit-breaker.service.ts
# Explicar estado machine (CLOSED → OPEN → HALF_OPEN)

# 6. Reactivar RESEND_API_KEY
# vim .env
# Descomentar RESEND_API_KEY

# 7. Esperar 60 segundos...
# Explicar: "El Circuit Breaker está esperando timeout"

# 8. Próximo webhook
# Creador otro producto (después de 60s)

# 9. Observar recuperación
curl http://localhost:3001/webhooks/circuit-breaker | jq \
  '."https://api.resend.com/emails"'
# {
#   "state": "CLOSED",  ← RECUPERADO
#   "failureCount": 0
# }
```

**Lo que el docente verá:**
- ✅ Estado inicial CLOSED
- ✅ 5 fallos en logs
- ✅ CB abierto (OPEN)
- ✅ Próximos requests rechazados
- ✅ Después de timeout, intentos de recuperación
- ✅ Sistema se recupera a CLOSED

---

### Bloque 4: Resiliencia & Seguridad (3 minutos)

**Hablar sobre**:

1. **HMAC-SHA256**: "Firma el payload para asegurar que no sea modificado"
   - Mostrar header `X-Webhook-Signature`

2. **Idempotencia**: "Si llega el mismo evento 3 veces, se procesa 1"
   - Mostrar campo `idempotency_key`

3. **Retry Logic**: "6 intentos con delays crecientes"
   - 1min, 5min, 30min, 2h, 12h

4. **Anti-Replay**: "Validar timestamp (máx 5 minutos)"

---

### Bloque 5: Arquitectura & Código (2 minutos)

**Mostrar**:
- README.md (diagrama arquitectura)
- Estructura de carpetas
- Archivos principales (publishers, circuit-breaker)

---

## ❓ Preguntas Esperadas & Respuestas

### P1: "¿Cómo garantiza que el webhook se procese una sola vez?"

**R**: Idempotency Key
- Generamos clave única: `{eventType}-{entityId}-{action}-{date}`
- Edge Function verifica tabla `processed_webhooks`
- Si existe → devolver `{duplicate: true}`
- TTL de 7 días para limpiar

**Mostrar**:
```sql
SELECT idempotency_key, processed_at 
FROM processed_webhooks 
WHERE idempotency_key LIKE 'producto.creado%';
```

---

### P2: "¿Cómo funciona el Circuit Breaker?"

**R**: Máquina de estados
```
CLOSED (normal) 
  → 5 fallos → OPEN (rechaza)
    → espera 60s → HALF_OPEN (prueba)
      → 2 éxitos → CLOSED (recuperado)
      → 1 fallo → OPEN (sigue caído)
```

**Mostrar**: `circuit-breaker.service.ts`

---

### P3: "¿Qué pasa si falla el envío del webhook?"

**R**: Retry con exponential backoff + Dead Letter Queue
```
Intento 1-6: Reintentos con delays crecientes
Intento 6: Si falla → Dead Letter Queue
           → Requiere intervención manual
           → Auditoría en `webhook_failures`
```

**Mostrar**:
```bash
tail microservicio-a/data/webhooks/dead-letter-queue.jsonl
```

---

### P4: "¿Cómo aseguran que no se modifique el webhook?"

**R**: Firma HMAC-SHA256
- Servidor genera: `signature = HMAC(payload, secret)`
- Cliente recibe: `X-Webhook-Signature: sha256=abc123`
- Edge Function verifica: `signature == hash(payload)`
- Si no coincide: rechazar con 401

**Mostrar**:
```typescript
// webhook-security.service.ts
generateSignature(payload, secret)
```

---

### P5: "¿Cuánto tiempo lleva recuperarse de un fallo?"

**R**: Máximo 60 segundos + 1 request exitoso
```
T=0s: Servicio falla
T=5s: CB detecta 5 fallos → OPEN
T=5s+: Próximos requests rechazados (sin timeout)
T=65s: Timeout alcanzado → HALF_OPEN
T=65s+: Próximo request es prueba
  → Si éxito: CLOSED (recuperado)
  → Si fallo: OPEN (espera otro timeout)
```

---

### P6: "¿Pueden usar otro servicio de email que no sea Resend?"

**R**: Sí, cambiar en `webhook-external-notifier.ts`
```typescript
// Cambiar de Resend a SendGrid:
async function sendEmail(to, subject, html) {
  // sendgrid.send({ ... })
}
```

---

### P7: "¿Cómo monitorean esto en producción?"

**R**: Logs estructurados + PostgreSQL + Dashboard
```
1. Logs: Archivo + terminal (correlation IDs)
2. DB: webhook_events, webhook_deliveries
3. Métricas: Circuit breaker state
4. Alertas: Si CB > 3 fallos seguidos
```

---

## 📊 Archivos a Mostrar Durante Presentación

1. **README.md** (descripción general)
2. **docs/CIRCUIT_BREAKER.md** (patrón detallado)
3. **microservicio-a/src/services/webhook-publisher.service.ts** (publisher)
4. **microservicio-a/src/services/circuit-breaker.service.ts** (circuit breaker)
5. **supabase/functions/webhook-external-notifier/index.ts** (edge function)
6. **Logs en terminal** (evidencia en vivo)
7. **Base de datos** (auditoría)

---

## 🎬 Timeline Recomendado

| Tiempo | Actividad |
|--------|-----------|
| 0-3m | Introducción + Diagrama |
| 3-10m | Happy Path Demo |
| 10-20m | Circuit Breaker Demo |
| 20-23m | Seguridad & Resiliencia |
| 23-25m | Q&A |

---

## ✅ Checklist Final (Día de Presentación)

- [ ] Ambiente levantado (microservicios + BD)
- [ ] 3 terminales con logs visibles
- [ ] Curl commands preparados
- [ ] README.md abierto
- [ ] Código abierto en editor
- [ ] Test scripts listos
- [ ] Ensayo mental de demos
- [ ] Respuestas memorizadas
- [ ] Laptop conectada a proyector
- [ ] Conexión internet verificada
- [ ] Backup en USB (código + presentación)

---

## 🚀 ¡Listo para Presentar!

**Recuerde**:
- Hablar claro y lento
- Mirar al docente
- Hacer pausas entre secciones
- Responder preguntas técnicas con calma
- Apuntar a código específico
- Mostrar logs/BD como prueba

**¡Éxito!** 🎉

---

**Última actualización**: 15 de Diciembre de 2025
