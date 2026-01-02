# Estrategia de Arquitectura Híbrida: Event-Driven Architecture

## 📌 Resumen

**Microservicio**: Gestión de Reservas y Mesas  
**Entidades**: Reserva, Mesa  
**Estrategia Seleccionada**: **Event-Driven Architecture** (Arquitectura Orientada a Eventos)

## 🎯 Justificación de la Estrategia

### 1. Desacoplamiento de Servicios

**Ventaja**: Los servicios se comunican mediante eventos, eliminando dependencias directas.

**Ejemplo práctico**: Cuando se crea una reserva, se publica un evento `reserva.creada`. El microservicio de notificaciones puede escuchar este evento para enviar un email al cliente, sin que el servicio de reservas necesite conocer la existencia del servicio de notificaciones.

### 2. Escalabilidad Asíncrona

**Ventaja**: Los eventos se procesan de forma asíncrona, permitiendo manejar picos de carga sin bloquear operaciones.

**Escenario**: Durante las horas pico, se pueden crear muchas reservas. Los eventos se encolan en RabbitMQ y se procesan según la capacidad de los servicios consumidores, sin afectar la respuesta del servicio de reservas.

### 3. Resiliencia y Tolerancia a Fallos

**Ventaja**: Si un servicio consumidor está temporalmente no disponible, los eventos se almacenan en la cola y se procesan cuando el servicio se recupera.

**Beneficio**: Si el servicio de notificaciones está caído, las reservas se siguen creando normalmente. Cuando el servicio se recupere, procesará todos los eventos pendientes.

### 4. Trazabilidad y Auditoría

**Ventaja**: Todos los eventos quedan registrados en la cola de mensajes, facilitando auditorías y debugging.

**Beneficio**: Podemos rastrear todas las operaciones realizadas en el sistema, útil para análisis y cumplimiento normativo.

### 5. Flexibilidad y Extensibilidad

**Ventaja**: Nuevos servicios pueden suscribirse a eventos existentes sin modificar el servicio que los publica.

**Ejemplo**: Si en el futuro necesitamos un servicio de análisis de datos, simplemente lo suscribimos a los eventos de reservas sin tocar el código del servicio de reservas.

### 6. Comunicación No Bloqueante

**Ventaja**: Las operaciones no bloquean el flujo principal, mejorando el rendimiento y la experiencia del usuario.

**Beneficio**: Cuando se crea una reserva, la respuesta se devuelve inmediatamente. Las notificaciones, actualizaciones de inventario, etc., se procesan en segundo plano.

## 📊 Comparación con Otras Estrategias

### Event-Driven vs Síncrono (REST)

| Aspecto | Event-Driven | REST Síncrono |
|---------|--------------|---------------|
| Acoplamiento | ✅ Bajo | ❌ Alto |
| Escalabilidad | ✅ Alta | ⚠️ Media |
| Resiliencia | ✅ Alta | ❌ Baja |
| Latencia | ✅ Baja (no bloqueante) | ⚠️ Depende |
| Complejidad | ⚠️ Mayor | ✅ Menor |

### ¿Por qué no REST Síncrono?

Aunque REST es más simple, presenta problemas en arquitecturas de microservicios:

1. **Acoplamiento**: El servicio de reservas debe conocer todos los servicios que necesitan ser notificados
2. **Bloqueo**: Si un servicio está lento, bloquea toda la operación
3. **Fragilidad**: Si un servicio falla, toda la operación falla

## 🏗️ Arquitectura del Microservicio

```
┌─────────────────────────────────────────┐
│   Microservicio de Reservas             │
│   (Puerto 3002)                         │
├─────────────────────────────────────────┤
│  - Reserva Controller                   │
│  - Mesa Controller                      │
│  - Event Publisher                      │
└─────────────────────────────────────────┘
              │              │
              ▼              ▼
┌─────────────────┐  ┌─────────────────┐
│   PostgreSQL    │  │    RabbitMQ     │
│ (reservas_db)   │  │  (Event Queue)  │
│                 │  │                 │
│ - reserva       │  │ - Exchange:     │
│ - mesa          │  │   restaurante_  │
│                 │  │   events        │
└─────────────────┘  └─────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  Consumidores:          │
              │  - Notificaciones       │
              │  - Análisis             │
              │  - Reportes              │
              └─────────────────────────┘
```

## 🔄 Flujo de Eventos

### Ejemplo: Crear una Reserva

```
1. Cliente hace POST /api/reservas
   ↓
2. ReservaController.createReserva()
   ↓
3. Guardar en PostgreSQL
   ↓
4. Publicar evento: reserva.creada
   ↓
5. RabbitMQ encola el evento
   ↓
6. Servicios consumidores procesan:
   - Notificaciones: envía email
   - Análisis: actualiza estadísticas
   - Reportes: genera reporte diario
```

## 📡 Eventos Publicados

### Eventos de Reserva

- **reserva.creada**: Se crea una nueva reserva
  ```json
  {
    "type": "reserva.creada",
    "payload": {
      "id_reserva": 1,
      "id_cliente": 5,
      "id_mesa": 3,
      "fecha": "2025-01-20",
      "hora_inicio": "19:00",
      "hora_fin": "21:00"
    },
    "timestamp": "2025-01-15T10:30:00Z",
    "source": "microservicio-reservas"
  }
  ```

- **reserva.confirmada**: Se confirma una reserva
- **reserva.cancelada**: Se cancela una reserva
- **reserva.completada**: Se completa una reserva

### Eventos de Mesa

- **mesa.reservada**: Una mesa es reservada
- **mesa.liberada**: Una mesa es liberada

## 🔌 Integración con Otros Microservicios

### Microservicio de Notificaciones

```typescript
// Suscripción a eventos
channel.consume('reservas.reserva.creada', async (msg) => {
  const event = JSON.parse(msg.content.toString());
  
  // Obtener datos del cliente (llamada a otro servicio)
  const cliente = await clienteService.getCliente(event.payload.id_cliente);
  
  // Enviar email
  await emailService.send({
    to: cliente.correo,
    subject: 'Reserva Confirmada',
    body: `Su reserva para ${event.payload.fecha} ha sido creada`
  });
  
  channel.ack(msg);
});
```

### Microservicio de Análisis

```typescript
// Suscripción a eventos
channel.consume('reservas.reserva.creada', async (msg) => {
  const event = JSON.parse(msg.content.toString());
  
  // Actualizar estadísticas
  await analyticsService.incrementReservas(event.payload.fecha);
  
  channel.ack(msg);
});
```

## ⚠️ Desafíos y Consideraciones

### 1. Consistencia Eventual

**Problema**: Los eventos se procesan de forma asíncrona, por lo que puede haber un retraso en la propagación de cambios.

**Solución**: Diseñar el sistema para que funcione correctamente con consistencia eventual. Usar versiones de eventos si es necesario.

### 2. Orden de Eventos

**Problema**: Los eventos pueden llegar fuera de orden.

**Solución**: Usar timestamps y números de secuencia. Implementar lógica de reordenamiento si es crítico.

### 3. Duplicación de Eventos

**Problema**: Un evento puede ser procesado múltiples veces (at-least-once delivery).

**Solución**: Implementar idempotencia en los consumidores. Usar IDs únicos de eventos.

### 4. Manejo de Errores

**Problema**: ¿Qué pasa si un consumidor falla al procesar un evento?

**Solución**: 
- Implementar retry logic
- Usar dead letter queues para eventos que fallan repetidamente
- Monitoreo y alertas

## 📈 Ventajas Adicionales

### 1. Testing

Los eventos facilitan el testing:
- Podemos simular eventos sin ejecutar el servicio completo
- Podemos verificar que se publican los eventos correctos

### 2. Debugging

Los eventos proporcionan un log completo de todas las operaciones:
- Podemos reproducir escenarios
- Podemos analizar el flujo completo

### 3. Monitoreo

Podemos monitorear:
- Tasa de eventos publicados
- Tiempo de procesamiento
- Eventos fallidos

## ✅ Conclusión

La estrategia **Event-Driven Architecture** es la más adecuada para este microservicio porque:

1. ✅ Reduce el acoplamiento entre servicios
2. ✅ Mejora la escalabilidad y rendimiento
3. ✅ Aumenta la resiliencia del sistema
4. ✅ Facilita la extensibilidad
5. ✅ Proporciona trazabilidad completa
6. ✅ Permite comunicación no bloqueante

Esta estrategia es especialmente valiosa en sistemas que requieren alta disponibilidad, escalabilidad y donde múltiples servicios necesitan reaccionar a cambios en el dominio de reservas.

