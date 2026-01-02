# Microservicio de Gestión de Reservas y Mesas

## 📋 Descripción

Este microservicio gestiona las entidades **Reserva** y **Mesa** del sistema de restaurante, implementando una arquitectura híbrida con la estrategia **Event-Driven Architecture** (Arquitectura Orientada a Eventos).

## 🏗️ Arquitectura

### Entidades Gestionadas
- **Reserva**: Representa las reservas de mesas con fecha, hora, cliente y estado
- **Mesa**: Representa las mesas del restaurante con número, capacidad y estado

### Estrategia de Arquitectura Híbrida: Event-Driven Architecture

**Justificación de la selección:**

1. **Desacoplamiento**: Los servicios se comunican mediante eventos, reduciendo el acoplamiento directo.

2. **Escalabilidad**: Los eventos pueden ser procesados de forma asíncrona, permitiendo manejar picos de carga.

3. **Resiliencia**: Si un servicio está temporalmente no disponible, los eventos se almacenan en la cola y se procesan cuando el servicio se recupera.

4. **Trazabilidad**: Todos los eventos quedan registrados, facilitando auditorías y debugging.

5. **Flexibilidad**: Nuevos servicios pueden suscribirse a eventos sin modificar el servicio que los publica.

6. **Comunicación Asíncrona**: Las operaciones no bloquean el flujo principal, mejorando el rendimiento.

## 🛠️ Tecnologías

- **Node.js** con **TypeScript**
- **Express.js** para el servidor HTTP
- **TypeORM** como ORM
- **PostgreSQL** como base de datos (Database per Service)
- **RabbitMQ** para publicación de eventos (Event-Driven)

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

## 🗄️ Base de Datos

### Crear la base de datos PostgreSQL

```sql
CREATE DATABASE restaurante_reservas_db;
```

### Configuración en .env

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=restaurante_reservas_db
```

## 🐰 RabbitMQ (Event-Driven)

### Instalación de RabbitMQ

```bash
# Docker
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# O instalar localmente según tu SO
```

### Configuración en .env

```env
RABBITMQ_URL=amqp://localhost:5672
```

### Eventos Publicados

El microservicio publica los siguientes eventos:

- `reservas.reserva.creada` - Cuando se crea una nueva reserva
- `reservas.reserva.confirmada` - Cuando se confirma una reserva
- `reservas.reserva.cancelada` - Cuando se cancela una reserva
- `reservas.mesa.reservada` - Cuando una mesa es reservada
- `reservas.mesa.liberada` - Cuando una mesa es liberada

## 📡 Endpoints

### Reservas

- `GET /api/reservas` - Obtener todas las reservas
- `GET /api/reservas/:id` - Obtener una reserva por ID
- `GET /api/reservas/cliente/:clienteId` - Obtener reservas de un cliente
- `GET /api/reservas/fecha/:fecha` - Obtener reservas por fecha
- `POST /api/reservas` - Crear una nueva reserva
- `PUT /api/reservas/:id/confirmar` - Confirmar una reserva
- `PUT /api/reservas/:id/cancelar` - Cancelar una reserva

### Mesas

- `GET /api/mesas` - Obtener todas las mesas
- `GET /api/mesas/:id` - Obtener una mesa por ID
- `GET /api/mesas/disponibles` - Obtener mesas disponibles
- `GET /api/mesas/capacidad/:capacidad` - Obtener mesas por capacidad mínima
- `POST /api/mesas` - Crear una nueva mesa
- `PUT /api/mesas/:id` - Actualizar una mesa
- `DELETE /api/mesas/:id` - Eliminar una mesa

### Health Check

- `GET /health` - Estado del servicio

## 📝 Ejemplos de Uso

### Crear una reserva

```bash
curl -X POST http://localhost:3002/api/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "id_cliente": 1,
    "id_mesa": 1,
    "fecha": "2025-01-20",
    "hora_inicio": "19:00",
    "hora_fin": "21:00"
  }'
```

### Crear una mesa

```bash
curl -X POST http://localhost:3002/api/mesas \
  -H "Content-Type: application/json" \
  -d '{
    "numero": "M-01",
    "capacidad": 4,
    "estado": "disponible"
  }'
```

### Confirmar una reserva

```bash
curl -X PUT http://localhost:3002/api/reservas/1/confirmar
```

## 🔄 Integración con Otros Microservicios

Este microservicio publica eventos que otros servicios pueden consumir:

### Ejemplo: Microservicio de Notificaciones

El servicio de notificaciones puede suscribirse a eventos para enviar emails/SMS:

```typescript
// Consumidor de eventos
channel.consume('reservas.reserva.creada', (msg) => {
  const event = JSON.parse(msg.content.toString());
  // Enviar email de confirmación
});
```

### Ejemplo: Microservicio de Menú

El servicio de menú puede escuchar eventos de reservas para preparar menús especiales.

## 📊 Diagrama de Arquitectura

```
┌─────────────────────────────────────┐
│   Microservicio de Reservas         │
│   (Puerto 3002)                     │
├─────────────────────────────────────┤
│  - Reserva Controller               │
│  - Mesa Controller                  │
│  - Event Publisher                  │
└─────────────────────────────────────┘
              │              │
              ▼              ▼
┌─────────────────┐  ┌─────────────────┐
│   PostgreSQL    │  │    RabbitMQ     │
│   (reservas_db) │  │  (Event Queue)  │
└─────────────────┘  └─────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  Otros Microservicios  │
              │  (Consumidores)         │
              └─────────────────────────┘
```

## 🎯 Próximos Pasos

1. Implementar consumidores de eventos
2. Agregar validación de datos con class-validator
3. Implementar manejo de errores centralizado
4. Agregar logging estructurado
5. Implementar tests unitarios e integración
6. Configurar CI/CD
7. Implementar retry logic para eventos fallidos

