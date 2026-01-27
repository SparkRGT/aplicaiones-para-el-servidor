# Circuit Breaker - Documentación Técnica

## Descripción General

El Circuit Breaker es un patrón de diseño que protege sistemas distribuidos de fallos en cascada. En este proyecto, se implementa para proteger los endpoints de las Edge Functions de Supabase cuando están experimentando problemas o sobrecarga.

## Estrategia Implementada: Opción C - Circuit Breaker

### Objetivo

Proteger los endpoints externos (Edge Functions) de sobrecarga y fallos, evitando que el sistema intente enviar webhooks cuando el servicio receptor está caído o experimentando problemas.

## Estados del Circuit Breaker

### CLOSED (Cerrado)

- **Descripción**: Estado normal de operación. Los webhooks se envían normalmente.
- **Comportamiento**: 
  - Cada éxito resetea el contador de fallos a 0
  - Cada fallo incrementa el contador de fallos
  - Cuando se alcanzan 5 fallos consecutivos, transiciona a OPEN

### OPEN (Abierto)

- **Descripción**: El circuito está abierto debido a múltiples fallos. No se envían webhooks.
- **Comportamiento**:
  - Todos los intentos de envío son rechazados inmediatamente
  - Se espera un timeout de 60 segundos antes de transicionar a HALF_OPEN
  - El estado se persiste en PostgreSQL para mantener consistencia

### HALF_OPEN (Semi-Abierto)

- **Descripción**: Estado de prueba. Se permite un número limitado de intentos para verificar si el servicio se recuperó.
- **Comportamiento**:
  - Se permiten intentos de envío
  - Si un intento falla, transiciona inmediatamente a OPEN
  - Si 2 intentos consecutivos tienen éxito, transiciona a CLOSED

## Configuración

```typescript
{
  failureThreshold: 5,      // Número de fallos antes de abrir
  timeout: 60000,           // 60 segundos en estado OPEN
  successThreshold: 2        // 2 éxitos para cerrar desde HALF_OPEN
}
```

## Implementación Técnica

### Persistencia

El estado del Circuit Breaker se guarda en PostgreSQL en la tabla `circuit_breaker_state`:

```sql
CREATE TABLE circuit_breaker_state (
    id SERIAL PRIMARY KEY,
    circuit_key VARCHAR(255) UNIQUE NOT NULL,  -- URL del endpoint
    state VARCHAR(20) NOT NULL,                -- CLOSED, OPEN, HALF_OPEN
    failure_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    last_failure_time TIMESTAMP,
    opened_at TIMESTAMP,
    last_state_change TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Flujo de Decisión

```typescript
async canExecute(circuitKey: string): Promise<boolean> {
  const state = await this.getState(circuitKey);
  
  // Verificar timeout si está en OPEN
  if (state.state === CircuitBreakerState.OPEN) {
    const timeSinceOpen = Date.now() - state.opened_at.getTime();
    if (timeSinceOpen >= timeout) {
      // Transición automática a HALF_OPEN
      state.state = CircuitBreakerState.HALF_OPEN;
      await this.save(state);
    }
  }
  
  return state.state === CLOSED || state.state === HALF_OPEN;
}
```

## Integración con Webhook Publisher

El Circuit Breaker se integra en el flujo de envío de webhooks:

1. **Antes de cada intento**: Se verifica `canExecute()`
2. **Si el circuito está OPEN**: Se rechaza el envío inmediatamente
3. **Después de éxito**: Se llama a `recordSuccess()`
4. **Después de fallo**: Se llama a `recordFailure()`

### Ejemplo de Uso

```typescript
// Verificar si se puede ejecutar
const canExecute = await this.circuitBreaker.canExecute(subscription.url);
if (!canExecute) {
  logger.warn(`Circuit Breaker OPEN para ${subscription.url}`);
  return; // Rechazar inmediatamente
}

try {
  // Intentar envío
  await sendWebhook();
  
  // Registrar éxito
  await this.circuitBreaker.recordSuccess(subscription.url);
} catch (error) {
  // Registrar fallo
  await this.circuitBreaker.recordFailure(subscription.url);
  throw error;
}
```

## Ventajas de esta Implementación

1. **Persistencia**: El estado se mantiene entre reinicios del servicio
2. **Granularidad**: Cada endpoint tiene su propio circuito independiente
3. **Recuperación Automática**: Transición automática de OPEN a HALF_OPEN después del timeout
4. **Observabilidad**: El estado se puede consultar en la base de datos

## Monitoreo

### Consultar Estado de un Circuito

```sql
SELECT 
    circuit_key,
    state,
    failure_count,
    success_count,
    opened_at,
    last_state_change
FROM circuit_breaker_state
WHERE circuit_key = 'https://tu-proyecto.supabase.co/functions/v1/event-logger';
```

### Ver Historial de Cambios

```sql
SELECT 
    circuit_key,
    state,
    last_state_change,
    failure_count
FROM circuit_breaker_state
ORDER BY last_state_change DESC;
```

## Casos de Uso

### Caso 1: Edge Function Caída

1. Se envían 5 webhooks que fallan (timeout, 500, etc.)
2. Circuit Breaker transiciona a OPEN
3. Los siguientes webhooks son rechazados inmediatamente
4. Después de 60 segundos, transiciona a HALF_OPEN
5. Se permite un intento de prueba
6. Si falla, vuelve a OPEN
7. Si tiene éxito, continúa con más intentos hasta cerrar el circuito

### Caso 2: Recuperación Gradual

1. Edge Function se recupera parcialmente (algunos requests funcionan)
2. Circuit Breaker en HALF_OPEN permite intentos limitados
3. Si 2 intentos consecutivos tienen éxito, cierra el circuito
4. El sistema vuelve a operación normal

### Caso 3: Protección contra SobreCarga

1. Edge Function está respondiendo lentamente
2. Múltiples timeouts causan fallos
3. Circuit Breaker se abre para proteger el sistema
4. Evita saturar aún más el servicio receptor

## Mejoras Futuras

1. **Métricas**: Agregar métricas de Prometheus para monitoreo
2. **Alertas**: Configurar alertas cuando un circuito está abierto por mucho tiempo
3. **Configuración Dinámica**: Permitir cambiar umbrales sin reiniciar
4. **Fallback**: Implementar estrategias de fallback cuando el circuito está abierto

## Referencias

- [Martin Fowler - Circuit Breaker](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Netflix Hystrix](https://github.com/Netflix/Hystrix)
- [Resilience4j](https://resilience4j.readme.io/docs/circuitbreaker)

