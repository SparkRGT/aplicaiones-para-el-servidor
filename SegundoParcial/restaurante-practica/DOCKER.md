# 🐳 Dockerización del Sistema de Restaurante

## 📋 Descripción

Este documento explica cómo ejecutar todo el sistema de restaurante usando Docker y Docker Compose.

## 🏗️ Arquitectura Dockerizada

```
┌─────────────────────────────────────────┐
│         Docker Compose                  │
├─────────────────────────────────────────┤
│  ┌──────────────────────────────────┐   │
│  │  API Gateway (3000)              │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐     │
│  │ Menú (3001)  │  │ Reservas(3002)│     │
│  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐     │
│  │ PostgreSQL   │  │ PostgreSQL   │     │
│  │ (menu_db)    │  │ (reservas_db)│     │
│  └──────────────┘  └──────────────┘     │
│  ┌──────────────────────────────────┐   │
│  │  RabbitMQ                        │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## 🚀 Inicio Rápido

### Opción 1: Todo Dockerizado (Recomendado)

```bash
# Construir y levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f api-gateway
docker-compose logs -f menu-service
docker-compose logs -f reservas-service

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ elimina datos)
docker-compose down -v
```

### Opción 2: Desarrollo Local (Solo Infraestructura)

**¿Cuándo usar `docker-compose.dev.yml`?**

Este archivo es útil cuando quieres:
- ✅ Ejecutar los servicios localmente con `npm run dev` (hot-reload)
- ✅ Debuggear código directamente en tu IDE
- ✅ Hacer cambios rápidos sin reconstruir imágenes Docker
- ✅ Usar herramientas de desarrollo locales

```bash
# Levantar solo bases de datos y RabbitMQ
docker-compose -f docker-compose.dev.yml up -d

# Ejecutar servicios localmente (en terminales separadas)
cd microservicio-menu && npm run dev
cd microservicio-reservas && npm run dev
cd api-gateway && npm run dev
```

**Nota**: Si vas a usar todo dockerizado, puedes ignorar este archivo y usar solo `docker-compose.yml`.

## 📦 Servicios Dockerizados

### 1. API Gateway
- **Puerto**: 3000
- **URL**: http://localhost:3000
- **Health**: http://localhost:3000/health

### 2. Microservicio de Menú
- **Puerto**: 3001
- **URL**: http://localhost:3001
- **Base de Datos**: postgres-menu (puerto 5433)

### 3. Microservicio de Reservas
- **Puerto**: 3002
- **URL**: http://localhost:3002
- **Base de Datos**: postgres-reservas (puerto 5434)
- **RabbitMQ**: rabbitmq (puerto 5672)

### 4. PostgreSQL (Menú)
- **Puerto**: 5433
- **Base de Datos**: restaurante_menu_db
- **Usuario**: postgres
- **Contraseña**: postgres

### 5. PostgreSQL (Reservas)
- **Puerto**: 5434
- **Base de Datos**: restaurante_reservas_db
- **Usuario**: postgres
- **Contraseña**: postgres

### 6. RabbitMQ
- **AMQP Port**: 5672
- **Management UI**: http://localhost:15672
- **Usuario**: admin
- **Contraseña**: admin123

## 🔧 Comandos Útiles

### Ver estado de servicios

```bash
docker-compose ps
```

### Reiniciar un servicio

```bash
docker-compose restart api-gateway
docker-compose restart menu-service
docker-compose restart reservas-service
```

### Reconstruir un servicio

```bash
docker-compose build menu-service
docker-compose up -d menu-service
```

### Acceder a una base de datos

```bash
# Base de datos de Menú
docker exec -it restaurante-postgres-menu psql -U postgres -d restaurante_menu_db

# Base de datos de Reservas
docker exec -it restaurante-postgres-reservas psql -U postgres -d restaurante_reservas_db
```

### Ver logs en tiempo real

```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f api-gateway
```

### Limpiar todo

```bash
# Detener y eliminar contenedores
docker-compose down

# Detener, eliminar contenedores y volúmenes
docker-compose down -v

# Eliminar imágenes también
docker-compose down -v --rmi all
```

## 🧪 Probar el Sistema

### 1. Verificar que todo está corriendo

```bash
# Health check del gateway
curl http://localhost:3000/health

# Debería retornar:
# {
#   "status": "OK",
#   "services": [...]
# }
```

### 2. Crear un menú

```bash
curl -X POST http://localhost:3000/api/menus \
  -H "Content-Type: application/json" \
  -d '{"fecha": "2025-01-20"}'
```

### 3. Crear un plato

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

### 4. Crear una reserva

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

## 🔍 Monitoreo

### RabbitMQ Management UI

Accede a: http://localhost:15672
- Usuario: admin
- Contraseña: admin123

Aquí puedes ver:
- Colas de mensajes
- Exchanges
- Conexiones
- Eventos publicados

### Health Checks

Todos los servicios tienen health checks configurados:

```bash
# Gateway
curl http://localhost:3000/health

# Menú Service
curl http://localhost:3001/health

# Reservas Service
curl http://localhost:3002/health
```

## 🐛 Troubleshooting

### Problema: Servicio no inicia

```bash
# Ver logs del servicio
docker-compose logs servicio-nombre

# Verificar estado
docker-compose ps

# Reiniciar servicio
docker-compose restart servicio-nombre
```

### Problema: Base de datos no conecta

```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps postgres-menu

# Ver logs de PostgreSQL
docker-compose logs postgres-menu

# Verificar conexión
docker exec -it restaurante-postgres-menu psql -U postgres
```

### Problema: RabbitMQ no conecta

```bash
# Verificar que RabbitMQ está corriendo
docker-compose ps rabbitmq

# Ver logs
docker-compose logs rabbitmq

# Acceder a la UI de gestión
# http://localhost:15672
```

### Problema: Puerto ya en uso

Si un puerto está ocupado, puedes cambiarlo en `docker-compose.yml`:

```yaml
ports:
  - "3000:3000"  # Cambiar el primer número
```

## 📊 Variables de Entorno

Las variables de entorno están configuradas en `docker-compose.yml`. Para desarrollo local, puedes crear archivos `.env` en cada servicio.

## 🔒 Seguridad en Producción

⚠️ **Importante**: Antes de desplegar en producción:

1. Cambiar contraseñas por defecto
2. Usar secrets de Docker
3. Configurar HTTPS/TLS
4. Restringir acceso a puertos
5. Configurar firewalls

## 📈 Escalado

### Escalar un servicio

```bash
# Escalar el servicio de menú a 3 instancias
docker-compose up -d --scale menu-service=3
```

Nota: Necesitarás un load balancer delante para distribuir la carga.

## ✅ Checklist de Verificación

- [ ] Todos los servicios están corriendo: `docker-compose ps`
- [ ] Health checks pasan: `curl http://localhost:3000/health`
- [ ] Bases de datos están accesibles
- [ ] RabbitMQ Management UI está accesible
- [ ] Los servicios pueden comunicarse entre sí
- [ ] Los eventos se publican correctamente en RabbitMQ

## 🎯 Próximos Pasos

1. Configurar CI/CD con Docker
2. Agregar monitoreo (Prometheus, Grafana)
3. Implementar logging centralizado (ELK Stack)
4. Configurar backups automáticos de bases de datos
5. Implementar secrets management
