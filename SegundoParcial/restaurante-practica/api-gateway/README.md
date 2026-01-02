# API Gateway - Sistema de Restaurante

## 📋 Descripción

El **API Gateway** es el punto único de entrada para todos los microservicios del sistema de restaurante. Actúa como un proxy inverso que enruta las peticiones a los microservicios correspondientes, proporcionando un punto de acceso unificado.

## 🏗️ Arquitectura

### Patrón: API Gateway

**Justificación:**

1. **Punto Único de Entrada**: Los clientes solo necesitan conocer una URL base
2. **Enrutamiento Centralizado**: Facilita el enrutamiento a múltiples microservicios
3. **Cross-Cutting Concerns**: Maneja autenticación, rate limiting, logging de forma centralizada
4. **Desacoplamiento**: Los clientes no necesitan conocer las URLs internas de los servicios
5. **Load Balancing**: Puede distribuir carga entre instancias de servicios
6. **Versionado**: Facilita el versionado de APIs

## 🛠️ Tecnologías

- **Node.js** con **TypeScript**
- **Express.js** para el servidor HTTP
- **http-proxy-middleware** para proxy inverso
- **express-rate-limit** para rate limiting
- **axios** para health checks

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar en modo desarrollo
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar en producción
npm start
```

## ⚙️ Configuración

### Variables de Entorno (.env)

```env
PORT=3000
NODE_ENV=development

# URLs de los microservicios
MENU_SERVICE_URL=http://localhost:3001
RESERVAS_SERVICE_URL=http://localhost:3002
```

## 📡 Endpoints

### Gateway

- `GET /health` - Health check agregado de todos los servicios
- `GET /info` - Información del gateway y servicios configurados

### Proxy a Microservicios

#### Microservicio de Menú
- `GET /api/menus` - Obtener todos los menús
- `GET /api/menus/:id` - Obtener un menú por ID
- `POST /api/menus` - Crear un nuevo menú
- `PUT /api/menus/:id` - Actualizar un menú
- `DELETE /api/menus/:id` - Eliminar un menú
- `GET /api/platos` - Obtener todos los platos
- `GET /api/platos/:id` - Obtener un plato por ID
- `POST /api/platos` - Crear un nuevo plato
- `PUT /api/platos/:id` - Actualizar un plato
- `DELETE /api/platos/:id` - Eliminar un plato

#### Microservicio de Reservas
- `GET /api/reservas` - Obtener todas las reservas
- `GET /api/reservas/:id` - Obtener una reserva por ID
- `POST /api/reservas` - Crear una nueva reserva
- `PUT /api/reservas/:id/confirmar` - Confirmar una reserva
- `PUT /api/reservas/:id/cancelar` - Cancelar una reserva
- `GET /api/mesas` - Obtener todas las mesas
- `GET /api/mesas/:id` - Obtener una mesa por ID
- `POST /api/mesas` - Crear una nueva mesa
- `PUT /api/mesas/:id` - Actualizar una mesa
- `DELETE /api/mesas/:id` - Eliminar una mesa

## 🔒 Características

### Rate Limiting

El gateway implementa rate limiting para proteger los servicios:

- **API General**: 100 requests por IP cada 15 minutos
- **Operaciones Críticas**: 10 requests por IP cada 15 minutos

### Health Checks Agregados

El endpoint `/health` verifica el estado de todos los servicios:

```json
{
  "status": "OK",
  "timestamp": "2025-01-15T10:30:00Z",
  "services": [
    {
      "name": "Microservicio de Menú",
      "status": "healthy",
      "responseTime": 45,
      "details": { ... }
    },
    {
      "name": "Microservicio de Reservas",
      "status": "healthy",
      "responseTime": 52,
      "details": { ... }
    }
  ],
  "gateway": {
    "status": "healthy",
    "uptime": 3600
  }
}
```

### Manejo de Errores

El gateway maneja errores de forma centralizada:

- **Servicio no disponible**: Retorna 503 con información del servicio
- **Ruta no encontrada**: Retorna 404
- **Errores internos**: Retorna 500 con información de error

### Logging

Todos los requests son logueados con:
- Timestamp
- Método HTTP
- Ruta
- Servicio destino

## 📊 Diagrama de Arquitectura

```
┌─────────────────────────────────────┐
│         Cliente / Frontend          │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         API Gateway (3000)          │
│  - Enrutamiento                     │
│  - Rate Limiting                    │
│  - Health Checks                    │
│  - Error Handling                   │
└─────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│  Menú Service   │  │ Reservas Service│
│   (3001)        │  │   (3002)        │
└─────────────────┘  └─────────────────┘
```

## 🔄 Flujo de Petición

```
1. Cliente hace petición a API Gateway
   GET http://localhost:3000/api/menus
   ↓
2. Gateway valida rate limiting
   ↓
3. Gateway enruta a Microservicio de Menú
   GET http://localhost:3001/api/menus
   ↓
4. Microservicio procesa y responde
   ↓
5. Gateway retorna respuesta al cliente
```

## 📝 Ejemplos de Uso

### Obtener todos los menús

```bash
curl http://localhost:3000/api/menus
```

### Crear una reserva

```bash
curl -X POST http://localhost:3000/api/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "id_cliente": 1,
    "id_mesa": 1,
    "fecha": "2025-01-20",
    "hora_inicio": "19:00",
    "hora_fin": "21:00"
  }'
```

### Health Check

```bash
curl http://localhost:3000/health
```

## 🎯 Ventajas del API Gateway

1. ✅ **Simplifica el cliente**: Una sola URL base
2. ✅ **Centraliza configuración**: Rate limiting, CORS, etc.
3. ✅ **Facilita versionado**: Puede manejar múltiples versiones de APIs
4. ✅ **Mejora seguridad**: Punto único para autenticación/autorización
5. ✅ **Monitoreo centralizado**: Logs y métricas en un solo lugar
6. ✅ **Resiliencia**: Puede implementar circuit breakers

## 🚀 Próximos Pasos

1. Implementar autenticación JWT
2. Agregar circuit breakers
3. Implementar caching
4. Agregar métricas y monitoreo (Prometheus)
5. Implementar load balancing entre instancias
6. Agregar documentación con Swagger/OpenAPI

