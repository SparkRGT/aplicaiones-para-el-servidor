# Estrategia de Arquitectura Híbrida: Database per Service

## 📌 Resumen

**Microservicio**: Gestión de Menús y Platos  
**Entidades**: Menu, Plato, CategoriaMenu  
**Estrategia Seleccionada**: **Database per Service** (Base de Datos por Servicio)

## 🎯 Justificación de la Estrategia

### 1. Independencia de Datos

**Ventaja**: Cada microservicio mantiene su propia base de datos, permitiendo que el esquema evolucione independientemente.

**Ejemplo práctico**: Si necesitamos agregar un campo `imagen_url` a la tabla `plato`, podemos hacerlo sin afectar la estructura de datos de otros microservicios (como el de reservas o mesas).

### 2. Escalabilidad Independiente

**Ventaja**: El microservicio de menús puede escalarse horizontalmente según la demanda específica.

**Escenario**: Durante las horas pico, el servicio de menús puede recibir muchas consultas mientras que el servicio de reservas tiene menos carga. Con Database per Service, podemos escalar solo el servicio de menús sin afectar otros.

### 3. Aislamiento de Fallos

**Ventaja**: Si la base de datos del microservicio de menús falla, no afecta a otros servicios.

**Beneficio**: El sistema de reservas, mesas y clientes continúa funcionando aunque el servicio de menús esté temporalmente no disponible.

### 4. Flexibilidad Tecnológica

**Ventaja**: Cada servicio puede usar la tecnología de base de datos más adecuada para su dominio.

**Ejemplo**: 
- Microservicio de Menú: PostgreSQL (relaciones complejas)
- Microservicio de Reservas: PostgreSQL (transacciones ACID)
- Microservicio de Logs: MongoDB (documentos flexibles)

### 5. Despliegue Independiente

**Ventaja**: El microservicio puede ser desplegado y actualizado sin afectar otros servicios.

**Beneficio**: Podemos actualizar la versión del servicio de menús sin necesidad de detener todo el sistema.

### 6. Responsabilidad Única

**Ventaja**: El servicio se enfoca exclusivamente en la gestión de menús y platos.

**Beneficio**: Facilita el mantenimiento, testing y comprensión del código.

## 📊 Comparación con Otras Estrategias

### Database per Service vs Shared Database

| Aspecto | Database per Service | Shared Database |
|---------|---------------------|-----------------|
| Independencia | ✅ Alta | ❌ Baja |
| Escalabilidad | ✅ Independiente | ❌ Limitada |
| Aislamiento | ✅ Total | ❌ Compartido |
| Complejidad | ⚠️ Mayor | ✅ Menor |
| Transacciones distribuidas | ❌ No soportadas | ✅ Soportadas |

### ¿Por qué no Shared Database?

Aunque Shared Database es más simple inicialmente, presenta problemas en arquitecturas de microservicios:

1. **Acoplamiento**: Cambios en el esquema afectan múltiples servicios
2. **Escalabilidad limitada**: No se puede escalar servicios individualmente
3. **Riesgo de fallos**: Un problema en la BD afecta todo el sistema

## 🏗️ Arquitectura del Microservicio

```
┌─────────────────────────────────────────┐
│         API Gateway / Load Balancer     │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│   Microservicio de Menú (Puerto 3001)  │
│   - Express.js                          │
│   - TypeORM                             │
│   - Controllers                         │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│   PostgreSQL (restaurante_menu_db)      │
│   - menu                                │
│   - plato                               │
│   - categoria_menu                      │
└─────────────────────────────────────────┘
```

## 🔄 Comunicación con Otros Microservicios

### Comunicación Síncrona (REST)

El microservicio expone endpoints REST para que otros servicios consulten información:

```typescript
// Otro microservicio puede consultar:
GET /api/menus/:id
GET /api/platos/:id
```

### Comunicación Asíncrona (Futuro)

Para operaciones que no requieren respuesta inmediata, se puede implementar:

- **Eventos**: Publicar eventos cuando se crea/actualiza un menú
- **Message Queue**: RabbitMQ, Kafka, etc.

## 📈 Métricas y Monitoreo

Con Database per Service, podemos monitorear:

- **Rendimiento de BD**: Queries lentas específicas del servicio
- **Uso de recursos**: CPU, memoria, I/O del servicio
- **Disponibilidad**: Health checks independientes

## ⚠️ Desafíos y Consideraciones

### 1. Transacciones Distribuidas

**Problema**: No podemos hacer transacciones ACID entre servicios.

**Solución**: Usar patrones como Saga para mantener consistencia eventual.

### 2. Consultas Cross-Service

**Problema**: No podemos hacer JOINs entre tablas de diferentes servicios.

**Solución**: 
- API Composition: Agregar datos desde múltiples servicios
- CQRS: Mantener vistas materializadas

### 3. Duplicación de Datos

**Problema**: Puede haber duplicación de datos entre servicios.

**Solución**: Aceptar duplicación controlada para mejorar rendimiento y disponibilidad.

## ✅ Conclusión

La estrategia **Database per Service** es la más adecuada para este microservicio porque:

1. ✅ Proporciona independencia y autonomía
2. ✅ Permite escalabilidad específica
3. ✅ Aísla fallos efectivamente
4. ✅ Facilita el desarrollo y despliegue independiente
5. ✅ Sigue los principios de arquitectura de microservicios

Esta estrategia es especialmente valiosa en sistemas que requieren alta disponibilidad y escalabilidad, como un sistema de gestión de restaurante.

