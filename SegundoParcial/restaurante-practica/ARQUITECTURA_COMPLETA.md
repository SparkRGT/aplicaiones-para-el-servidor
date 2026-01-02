# Arquitectura Híbrida Completa - Sistema de Restaurante

## 📋 Resumen del Sistema

Este documento describe la arquitectura híbrida completa del sistema de gestión de restaurante, implementando múltiples estrategias de arquitectura de microservicios.

## 🏗️ Componentes del Sistema

### 1. API Gateway (Puerto 3000)
**Patrón**: API Gateway Pattern  
**Función**: Punto único de entrada para todos los microservicios

**Características**:
- Enrutamiento centralizado
- Rate limiting
- Health checks agregados
- Manejo de errores centralizado
- Logging de todas las peticiones

### 2. Microservicio de Menú (Puerto 3001)
**Entidades**: Menu, Plato, CategoriaMenu  
**Estrategia**: **Database per Service**

**Justificación**: Independencia de datos, escalabilidad independiente, aislamiento de fallos

**Base de Datos**: `restaurante_menu_db` (PostgreSQL)

### 3. Microservicio de Reservas (Puerto 3002)
**Entidades**: Reserva, Mesa  
**Estrategia**: **Event-Driven Architecture**

**Justificación**: Desacoplamiento, comunicación asíncrona, resiliencia

**Base de Datos**: `restaurante_reservas_db` (PostgreSQL)  
**Message Broker**: RabbitMQ

## 📊 Diagrama de Arquitectura Completa

```
┌─────────────────────────────────────────────────────────┐
│              Cliente / Frontend / Mobile                │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              API Gateway (Puerto 3000)                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  - Enrutamiento                                  │  │
│  │  - Rate Limiting                                │  │
│  │  - Health Checks                                │  │
│  │  - Error Handling                               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │                              │
         │                              │
         ▼                              ▼
┌──────────────────────┐    ┌──────────────────────┐
│  Menú Service (3001)  │    │ Reservas Service(3002)│
│                      │    │                      │
│  Estrategia:         │    │  Estrategia:         │
│  Database per Service│    │  Event-Driven        │
│                      │    │                      │
│  - Menu Controller   │    │  - Reserva Controller│
│  - Plato Controller  │    │  - Mesa Controller   │
│                      │    │  - Event Publisher   │
└──────────────────────┘    └──────────────────────┘
         │                              │
         │                              │
         ▼                              ▼
┌──────────────────────┐    ┌──────────────────────┐
│  PostgreSQL          │    │  PostgreSQL          │
│  restaurante_menu_db │    │  restaurante_reservas │
│                      │    │  _db                 │
│  - menu              │    │                      │
│  - plato             │    │  - reserva           │
│  - categoria_menu    │    │  - mesa              │
└──────────────────────┘    └──────────────────────┘
                                     │
                                     ▼
                            ┌──────────────────────┐
                            │      RabbitMQ        │
                            │   (Event Queue)      │
                            │                      │
                            │  - reserva.creada    │
                            │  - reserva.confirmada│
                            │  - mesa.reservada     │
                            └──────────────────────┘
                                     │
                                     ▼
                            ┌──────────────────────┐
                            │  Consumidores:      │
                            │  - Notificaciones   │
                            │  - Análisis         │
                            │  - Reportes         │
                            └──────────────────────┘
```

## 🔄 Flujos de Comunicación

### Flujo 1: Consultar Menú

```
Cliente → API Gateway → Menú Service → PostgreSQL
         (3000)        (3001)         (menu_db)
```

### Flujo 2: Crear Reserva (Event-Driven)

```
Cliente → API Gateway → Reservas Service → PostgreSQL
         (3000)        (3002)            (reservas_db)
                              │
                              ▼
                         RabbitMQ
                              │
                              ▼
                    ┌─────────┴─────────┐
                    │                   │
              Notificaciones      Análisis
```

## 📡 Endpoints Completos

### A través del API Gateway (http://localhost:3000)

#### Menús
- `GET /api/menus` - Listar menús
- `GET /api/menus/:id` - Obtener menú
- `POST /api/menus` - Crear menú
- `PUT /api/menus/:id` - Actualizar menú
- `DELETE /api/menus/:id` - Eliminar menú

#### Platos
- `GET /api/platos` - Listar platos
- `GET /api/platos/:id` - Obtener plato
- `POST /api/platos` - Crear plato
- `PUT /api/platos/:id` - Actualizar plato
- `DELETE /api/platos/:id` - Eliminar plato
- `GET /api/platos/disponibles` - Platos disponibles
- `GET /api/platos/categoria/:id` - Platos por categoría

#### Reservas
- `GET /api/reservas` - Listar reservas
- `GET /api/reservas/:id` - Obtener reserva
- `POST /api/reservas` - Crear reserva (publica evento)
- `PUT /api/reservas/:id/confirmar` - Confirmar reserva
- `PUT /api/reservas/:id/cancelar` - Cancelar reserva
- `GET /api/reservas/cliente/:id` - Reservas por cliente
- `GET /api/reservas/fecha/:fecha` - Reservas por fecha

#### Mesas
- `GET /api/mesas` - Listar mesas
- `GET /api/mesas/:id` - Obtener mesa
- `POST /api/mesas` - Crear mesa
- `PUT /api/mesas/:id` - Actualizar mesa
- `DELETE /api/mesas/:id` - Eliminar mesa
- `GET /api/mesas/disponibles` - Mesas disponibles
- `GET /api/mesas/capacidad/:capacidad` - Mesas por capacidad

#### Gateway
- `GET /health` - Health check agregado
- `GET /info` - Información del gateway

## 🎯 Estrategias Implementadas

### 1. Database per Service (Menú)
**Ventajas**:
- ✅ Independencia de datos
- ✅ Escalabilidad independiente
- ✅ Aislamiento de fallos
- ✅ Flexibilidad tecnológica

### 2. Event-Driven Architecture (Reservas)
**Ventajas**:
- ✅ Desacoplamiento
- ✅ Escalabilidad asíncrona
- ✅ Resiliencia
- ✅ Trazabilidad

### 3. API Gateway Pattern
**Ventajas**:
- ✅ Punto único de entrada
- ✅ Centralización de configuración
- ✅ Simplificación del cliente
- ✅ Monitoreo centralizado

### 4. Estrategia de Resiliencia Avanzada: Idempotent Consumer
**Estrategia Seleccionada**: Consumidor Idempotente (Opción B del Punto 4)

**Problema que Resuelve**: RabbitMQ garantiza "At-least-once delivery", lo que significa que los eventos pueden ser procesados múltiples veces si hay fallos de red o reinicios del servicio. Esto podría causar:
- Duplicación de reservas
- Inconsistencias en el estado de mesas
- Pérdida de integridad de datos

**Solución Implementada**: 
- Claves de idempotencia únicas para cada evento
- Almacenamiento en Redis para verificar eventos ya procesados
- Middleware de consumo que verifica idempotencia antes de procesar
- Garantía de procesamiento exactamente una vez (Exactly-Once semantics)

**Ventajas**:
- ✅ Protege la integridad de datos críticos
- ✅ Resuelve el problema de duplicación de eventos
- ✅ Escalable con múltiples consumidores
- ✅ Proporciona auditoría y trazabilidad

**Documentación Completa**: Ver [ESTRATEGIA_PUNTO_4.md](./ESTRATEGIA_PUNTO_4.md) para detalles técnicos, implementación y pruebas de resiliencia.

## 🚀 Inicio Rápido

### 1. Iniciar Base de Datos

```bash
# PostgreSQL
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -p 5432:5432 \
  postgres:15

# Crear bases de datos
createdb restaurante_menu_db
createdb restaurante_reservas_db
```

### 2. Iniciar RabbitMQ

```bash
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

### 3. Iniciar Microservicios

```bash
# Terminal 1 - Menú Service
cd microservicio-menu
npm install
npm run dev

# Terminal 2 - Reservas Service
cd microservicio-reservas
npm install
npm run dev

# Terminal 3 - API Gateway
cd api-gateway
npm install
npm run dev
```

### 4. Verificar

```bash
# Health check del gateway
curl http://localhost:3000/health

# Obtener menús
curl http://localhost:3000/api/menus

# Obtener mesas disponibles
curl http://localhost:3000/api/mesas/disponibles
```

## 📈 Escalabilidad

### Escalado Horizontal

Cada componente puede escalarse independientemente:

```
Load Balancer
    │
    ├── API Gateway (Instancia 1)
    ├── API Gateway (Instancia 2)
    └── API Gateway (Instancia 3)
            │
            ├── Menú Service (Múltiples instancias)
            └── Reservas Service (Múltiples instancias)
```

## 🔒 Seguridad

### Implementado
- ✅ Rate limiting en API Gateway
- ✅ CORS configurado
- ✅ Manejo de errores sin exponer detalles internos

### Pendiente
- ⏳ Autenticación JWT
- ⏳ Autorización por roles
- ⏳ HTTPS/TLS
- ⏳ Validación de entrada

## 📊 Monitoreo

### Health Checks
- Gateway: `/health` (agregado)
- Menú Service: `/health`
- Reservas Service: `/health`

### Logging
- Todos los requests son logueados
- Eventos publicados son registrados
- Errores son capturados y logueados

## ✅ Ventajas de la Arquitectura Híbrida

1. **Flexibilidad**: Cada servicio usa la estrategia más adecuada
2. **Escalabilidad**: Componentes escalan independientemente
3. **Resiliencia**: Fallos aislados no afectan todo el sistema
4. **Mantenibilidad**: Servicios pequeños y enfocados
5. **Tecnología**: Cada servicio puede usar tecnologías diferentes
6. **Desarrollo**: Equipos pueden trabajar en paralelo

## 🎓 Conclusión

Esta arquitectura híbrida combina lo mejor de diferentes patrones:

- **Database per Service** para independencia de datos
- **Event-Driven** para comunicación asíncrona
- **API Gateway** para simplificación del acceso

Juntos forman un sistema robusto, escalable y mantenible que puede evolucionar con las necesidades del negocio.

