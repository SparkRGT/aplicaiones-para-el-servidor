# 🍽️ Sistema de Gestión de Restaurante - Arquitectura Híbrida

## 📋 Descripción

Sistema de gestión de restaurante implementado con arquitectura de microservicios híbrida, utilizando diferentes estrategias para cada servicio según sus necesidades específicas.

## 🏗️ Arquitectura

### Componentes

1. **API Gateway** (Puerto 3000)
   - Punto único de entrada
   - Enrutamiento centralizado
   - Rate limiting
   - Health checks agregados

2. **Microservicio de Menú** (Puerto 3001)
   - **Estrategia**: Database per Service
   - **Entidades**: Menu, Plato, CategoriaMenu
   - **Base de Datos**: PostgreSQL (restaurante_menu_db)

3. **Microservicio de Reservas** (Puerto 3002)
   - **Estrategia**: Event-Driven Architecture
   - **Entidades**: Reserva, Mesa
   - **Base de Datos**: PostgreSQL (restaurante_reservas_db)
   - **Message Broker**: RabbitMQ

## 🚀 Inicio Rápido con Docker

### Prerrequisitos

- Docker
- Docker Compose

### Ejecutar todo el sistema

```bash
# Construir y levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Verificar estado
docker-compose ps

# Health check
curl http://localhost:3000/health
```

### Usar Makefile (recomendado)

```bash
# Ver comandos disponibles
make help

# Construir y levantar
make build
make up

# Ver logs
make logs

# Verificar health
make health

# Detener todo
make down
```

## 📡 Endpoints Principales

### A través del API Gateway (http://localhost:3000)

- `GET /health` - Health check agregado
- `GET /info` - Información del gateway
- `GET /api/menus` - Listar menús
- `GET /api/platos` - Listar platos
- `GET /api/reservas` - Listar reservas
- `GET /api/mesas` - Listar mesas

## 🐳 Servicios Docker

| Servicio | Puerto | URL |
|----------|--------|-----|
| API Gateway | 3000 | http://localhost:3000 |
| Menú Service | 3001 | http://localhost:3001 |
| Reservas Service | 3002 | http://localhost:3002 |
| PostgreSQL (Menú) | 5433 | localhost:5433 |
| PostgreSQL (Reservas) | 5434 | localhost:5434 |
| RabbitMQ Management | 15672 | http://localhost:15672 |

## 📚 Documentación

- [DOCKER.md](./DOCKER.md) - Guía completa de Docker
- [ARQUITECTURA_COMPLETA.md](./ARQUITECTURA_COMPLETA.md) - Arquitectura del sistema
- [microservicio-menu/README.md](./microservicio-menu/README.md) - Documentación del servicio de Menú
- [microservicio-reservas/README.md](./microservicio-reservas/README.md) - Documentación del servicio de Reservas
- [api-gateway/README.md](./api-gateway/README.md) - Documentación del API Gateway

## 🎯 Estrategias Implementadas

### 1. Database per Service (Menú)
- Independencia de datos
- Escalabilidad independiente
- Aislamiento de fallos

### 2. Event-Driven Architecture (Reservas)
- Comunicación asíncrona
- Desacoplamiento
- Resiliencia

### 3. API Gateway Pattern
- Punto único de entrada
- Centralización de configuración
- Monitoreo centralizado

## 🧪 Ejemplos de Uso

### Crear un menú

```bash
curl -X POST http://localhost:3000/api/menus \
  -H "Content-Type: application/json" \
  -d '{"fecha": "2025-01-20"}'
```

### Crear un plato

```bash
curl -X POST http://localhost:3000/api/platos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Pasta Carbonara",
    "descripcion": "Pasta con salsa carbonara",
    "precio": 15.99,
    "disponible": true,
    "id_categoria": 2
  }'
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

## 🔧 Comandos Útiles

```bash
# Ver estado de servicios
docker-compose ps

# Ver logs de un servicio
docker-compose logs -f api-gateway

# Reiniciar un servicio
docker-compose restart menu-service

# Reconstruir un servicio
docker-compose build menu-service
docker-compose up -d menu-service

# Acceder a base de datos
docker exec -it restaurante-postgres-menu psql -U postgres -d restaurante_menu_db
```

## 📊 Monitoreo

- **RabbitMQ UI**: http://localhost:15672 (admin/admin123)
- **Health Checks**: http://localhost:3000/health
- **Logs**: `docker-compose logs -f`

## 🛠️ Desarrollo

Para desarrollo local sin Docker (solo infraestructura):

```bash
# Levantar solo bases de datos y RabbitMQ
make dev-up

# Ejecutar servicios localmente
cd microservicio-menu && npm run dev
cd microservicio-reservas && npm run dev
cd api-gateway && npm run dev
```

## 📝 Estructura del Proyecto

```
restaurante-practica/
├── api-gateway/              # API Gateway
├── microservicio-menu/        # Servicio de Menú
├── microservicio-reservas/   # Servicio de Reservas
├── scripts/                   # Scripts de inicialización
├── docker-compose.yml         # Orquestación Docker
├── docker-compose.dev.yml    # Docker para desarrollo
├── Makefile                   # Comandos útiles
└── README.md                  # Este archivo
```

## ✅ Checklist de Verificación

- [x] API Gateway implementado
- [x] Microservicio de Menú (Database per Service)
- [x] Microservicio de Reservas (Event-Driven)
- [x] Dockerización completa
- [x] Health checks configurados
- [x] Documentación completa


