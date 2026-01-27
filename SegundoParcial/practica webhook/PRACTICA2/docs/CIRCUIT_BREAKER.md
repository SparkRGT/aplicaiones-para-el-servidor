# 🔌 Circuit Breaker Pattern - Documentación Detallada

## ¿Qué es el Circuit Breaker?

El **Circuit Breaker** es un patrón de diseño que previene que una aplicación realice operaciones que probablemente fallarán. Es como un interruptor eléctrico:

- **CLOSED** (Cerrado/Normal): La corriente fluye normalmente
- **OPEN** (Abierto/Fallo): Se corta la corriente para evitar daños
- **HALF_OPEN** (Semi-abierto): Se intenta restablecer la conexión

---

## Problema Que Resuelve

### Sin Circuit Breaker ❌

```
Cliente → Servicio Caído → Timeout (10s)
         ↓
       Reintentar → Timeout (10s)
         ↓
       Reintentar → Timeout (10s)
         ↓
       Acumulación de requests
       Desperdicio de recursos
       Cascada de fallos
```

### Con Circuit Breaker ✅

```
Cliente → Servicio Caído (5 fallos) → Circuit OPEN
         ↓
       Rechaza inmediatamente (sin timeout)
       Ahorra recursos
       Aísla el fallo
         ↓
       Espera timeout (60s)
         ↓
       Intenta recuperación (HALF_OPEN)
         ↓
       Servicio responde → CLOSED ✅
       Servicio aún caído → OPEN nuevamente 🔴
```

---

## Implementación en Este Proyecto

### Ubicación

- **Microservicios**: `src/services/circuit-breaker.service.ts`
- **Edge Functions**: Supabase tabla `circuit_breaker_state`
- **Base de datos**: PostgreSQL para persistencia

### Estados

```
┌──────────────────────────────────────────────────┐
│                    CLOSED                        │
│         (Funcionamiento Normal)                  │
│  - Permite todos los requests                    │
│  - Monitorea fallos                              │
│  ↓ (5 fallos)                                    │
├──────────────────────────────────────────────────┤
│                     OPEN                         │
│     (Servicio Detectado Como Caído)             │
│  - Rechaza requests sin ejecutar                │
│  - Evita timeouts                                │
│  ↓ (Espera 60s)                                 │
├──────────────────────────────────────────────────┤
│                  HALF_OPEN                      │
│        (Período de Prueba/Recuperación)         │
│  - Permite 1 request de prueba                  │
│  ↓ (2 éxitos) → CLOSED ✅                      │
│  ↓ (1 fallo) → OPEN 🔴                         │
└──────────────────────────────────────────────────┘
```

### Parámetros de Configuración

```json
{
  "failureThreshold": 5,      // Fallos antes de OPEN
  "successThreshold": 2,      // Éxitos en HALF_OPEN antes de CLOSED
  "timeout": 60000,           // Milisegundos antes de pasar a HALF_OPEN
  "halfOpenRequests": 1       // Máximo requests permitidos en HALF_OPEN
}
```

---

## Flujo Detallado

### 1. CLOSED → OPEN (Normal a Caído)

```typescript
// 1. Intento 1: Éxito → failureCount = 0
recordSuccess(endpoint) // failureCount reset

// 2. Intento 2: Fallo → failureCount = 1
recordFailure(endpoint) // Contador aumenta

// 3. Intento 3: Fallo → failureCount = 2
recordFailure(endpoint)

// 4. Intento 4: Fallo → failureCount = 3
recordFailure(endpoint)

// 5. Intento 5: Fallo → failureCount = 4
recordFailure(endpoint)

// 6. Intento 6: Fallo → failureCount = 5 ← Threshold alcanzado
recordFailure(endpoint)
// ⚠️ ¡Circuit Breaker ABIERTO! → state = OPEN

// 7. Intento 7: Rechazado inmediatamente
if (!canExecute(endpoint)) { // false
  return "Circuit Breaker OPEN - Service unavailable"
}
```

### 2. OPEN → HALF_OPEN (Período de Prueba)

```typescript
// Intento después de esperar timeout (60s)
const cbStatus = getCircuitBreakerStatus(endpoint);

if (cbStatus.state === OPEN) {
  const timeSinceOpen = now - cbStatus.openedAt;
  
  if (timeSinceOpen > 60000) { // Timeout alcanzado
    state = HALF_OPEN
    // Permite 1 request de prueba
  }
}
```

### 3. HALF_OPEN → CLOSED (Recuperación Exitosa)

```typescript
// En HALF_OPEN, si el request es exitoso
recordSuccess(endpoint)
successCount++

if (successCount >= 2) { // successThreshold
  state = CLOSED
  failureCount = 0
  // ✅ Sistema recuperado
}
```

### 4. HALF_OPEN → OPEN (Sigue Fallando)

```typescript
// En HALF_OPEN, si el request falla
recordFailure(endpoint)
// ⚠️ Servicio aún está caído
state = OPEN
openedAt = now // Reinicia el timer de 60s
```

---

## Implementación en Edge Function

### webhook-external-notifier

```typescript
serve(async (req) => {
  // ... validaciones ...

  // 1. Obtener estado actual del Circuit Breaker
  const cbStatus = await getCircuitBreakerStatus(emailEndpoint);
  
  // 2. Si está OPEN, rechazar
  if (cbStatus.state === CircuitBreakerState.OPEN) {
    console.warn("🔴 Circuit Breaker OPEN");
    return new Response(
      { error: "Service temporarily unavailable" },
      { status: 503 } // Service Unavailable
    );
  }

  try {
    // 3. Intentar enviar email
    const emailSent = await sendEmail(to, subject, html);
    
    // 4. Registrar éxito
    if (cbStatus.state === CircuitBreakerState.HALF_OPEN) {
      // Si estábamos en HALF_OPEN, volver a CLOSED
      await updateCircuitBreakerStatus(
        emailEndpoint,
        CircuitBreakerState.CLOSED,
        0
      );
      console.log("✅ Recuperado - Circuit Breaker CLOSED");
    }
    
    return new Response({ status: "success" }, { status: 200 });
    
  } catch (error) {
    // 5. Registrar fallo
    const newFailureCount = cbStatus.failureCount + 1;
    
    if (newFailureCount >= 5) {
      // Abrir circuit
      await updateCircuitBreakerStatus(
        emailEndpoint,
        CircuitBreakerState.OPEN,
        newFailureCount
      );
      console.error("🔴 Circuit Breaker ABIERTO");
    }
    
    return new Response(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
});
```

---

## Monitoreo

### Ver Estado Actual

```bash
# En microservicio
curl http://localhost:3001/webhooks/circuit-breaker | jq .

# Respuesta
{
  "https://api.resend.com/emails": {
    "state": "CLOSED",
    "failureCount": 0,
    "lastFailureAt": null,
    "openedAt": null
  }
}
```

### Consultar Base de Datos

```sql
-- Ver estado del Circuit Breaker
SELECT 
  endpoint_url,
  state,
  failure_count,
  last_failure_at,
  opened_at
FROM circuit_breaker_state
WHERE endpoint_url LIKE '%resend%';

-- Resultado:
-- endpoint_url     | state | failure_count | last_failure_at      | opened_at
-- ─────────────────┼───────┼───────────────┼────────────────────┼──────────
-- https://api...   | OPEN  | 5             | 2025-12-15 10:35:42 | 2025-12-15 10:35:42
```

### Resetear Circuit Breaker (Admin)

```bash
# Si quieres forzar el reseteo
curl -X POST http://localhost:3001/webhooks/circuit-breaker/reset \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://api.resend.com/emails"
  }'

# SQL directo
UPDATE circuit_breaker_state
SET state = 'CLOSED', failure_count = 0, opened_at = NULL
WHERE endpoint_url = 'https://api.resend.com/emails';
```

---

## Caso de Uso Real: Fallo de Email Service

### Escenario

```
10:30:00 - Crear producto
         → Webhook enviado a email service
         → Fallo #1 (Timeout)
         → Reintentar
         → Fallo #2 (500 Error)
         
10:30:15 - Crear otro producto
         → Webhook enviado
         → Fallo #3 (Connection refused)
         → Reintentar
         → Fallo #4
         
10:30:30 - Crear tercer producto
         → Webhook enviado
         → Fallo #5 ← THRESHOLD ALCANZADO
         → 🔴 Circuit Breaker OPEN
         
10:30:45 - Crear cuarto producto
         → Webhook enviado
         → ❌ Circuit Breaker RECHAZA inmediatamente
         → Sin timeout, sin reintentos
         → Respuesta 503 (Service Unavailable)
         
10:31:00 - Email service se recupera
         → Pero Circuit aún OPEN (espera timeout)
         
10:31:30 - Timeout de 60s alcanzado
         → Circuit pasa a HALF_OPEN
         
10:31:35 - Próximo webhook
         → Permite 1 request de prueba
         → Email service responde ✅
         → successCount = 1
         
10:31:45 - Otro webhook
         → En HALF_OPEN, puede procesar otro
         → Email service responde ✅
         → successCount = 2 ← SUCCESS THRESHOLD
         → 🟢 Circuit Breaker CLOSED
         → Sistema recuperado ✅
```

---

## Beneficios Implementados

| Beneficio | Cómo Se Logra |
|-----------|--------------|
| **Prevención de cascadas** | Aislar fallos, no propagar |
| **Mejora de UX** | Error inmediato vs timeout |
| **Ahorro de recursos** | No desperdiciar en requests fallidos |
| **Recuperación automática** | HALF_OPEN permite reintentos inteligentes |
| **Observabilidad** | Logs y métricas en BD |
| **Configurabilidad** | Thresholds ajustables |

---

## Comparativa: Con vs Sin Circuit Breaker

### Sin Circuit Breaker ❌

```
6 intentos × 10s timeout = 60s de espera
Acceso al servicio caído constantemente
Acumulación de requests en memoria
Posible crash de la aplicación
```

### Con Circuit Breaker ✅

```
5 fallos → Circuit OPEN
6º intento → Rechazado en <1ms (sin timeout)
Espera inteligente: 60s
HALF_OPEN → Intento de recuperación
Si recuperado → CLOSED automáticamente
Si sigue caído → OPEN nuevamente
```

---

## Troubleshooting

### "Circuit Breaker está OPEN pero servicio está corriendo"

```
1. Verificar estado en BD
2. Esperar timeout de 60s
3. Siguiente request → HALF_OPEN
4. Si servicio responde → CLOSED automáticamente
```

### "Quiero forzar reseteo"

```sql
UPDATE circuit_breaker_state
SET state = 'CLOSED', failure_count = 0
WHERE endpoint_url = 'https://...';
```

### "¿Por qué 5 fallos de threshold?"

Balance entre:
- No abrir muy rápido (evitar falsos positivos)
- Actuar rápido ante problemas reales (5 fallos = ~50ms de operación)

---

## Referencias

- [Martin Fowler - Circuit Breaker](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Release It! - Michael Nygard](https://pragprog.com/titles/mnee2/release-it-second-edition/)
- [AWS Pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/resilience-design-patterns/)

---

**Última actualización**: 15 de Diciembre de 2025
