# Microservicio de Gestión de Menús

## 📋 Descripción

Este microservicio gestiona las entidades **Menu** y **Plato** del sistema de restaurante, implementando una arquitectura híbrida con la estrategia **Database per Service**.

## 🏗️ Arquitectura

### Entidades Gestionadas
- **Menu**: Representa los menús del restaurante con su fecha de vigencia
- **Plato**: Representa los platos/dishes con sus características (nombre, descripción, precio, disponibilidad)
- **CategoriaMenu**: Categorías de menú (Entrantes, Principales, Postres, etc.)

### Estrategia de Arquitectura Híbrida: Database per Service

**Justificación de la selección:**

1. **Independencia de Datos**: Cada microservicio tiene su propia base de datos, permitiendo que el esquema evolucione independientemente sin afectar otros servicios.

2. **Escalabilidad Independiente**: El microservicio de menús puede escalarse horizontalmente según la demanda, sin necesidad de escalar toda la infraestructura.

3. **Aislamiento de Fallos**: Si la base de datos de este microservicio falla, no afecta a otros servicios del sistema (reservas, mesas, clientes, etc.).

4. **Flexibilidad Tecnológica**: Permite usar PostgreSQL para este servicio, mientras otros pueden usar MongoDB, MySQL, etc., según sus necesidades específicas.

5. **Despliegue Independiente**: El microservicio puede ser desplegado y actualizado sin afectar otros servicios.

6. **Responsabilidad Única**: El servicio se enfoca exclusivamente en la gestión de menús y platos, siguiendo el principio de responsabilidad única.

## 🛠️ Tecnologías

- **Node.js** con **TypeScript**
- **Express.js** para el servidor HTTP
- **TypeORM** como ORM
- **PostgreSQL** como base de datos (Database per Service)

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
CREATE DATABASE restaurante_menu_db;
```

### Configuración en .env

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=restaurante_menu_db
```

## 📡 Endpoints

### Menús

- `GET /api/menus` - Obtener todos los menús
- `GET /api/menus/:id` - Obtener un menú por ID
- `POST /api/menus` - Crear un nuevo menú
- `PUT /api/menus/:id` - Actualizar un menú
- `DELETE /api/menus/:id` - Eliminar un menú
- `POST /api/menus/:menuId/platos` - Agregar plato a un menú

### Platos

- `GET /api/platos` - Obtener todos los platos
- `GET /api/platos/:id` - Obtener un plato por ID
- `GET /api/platos/disponibles` - Obtener platos disponibles
- `GET /api/platos/categoria/:categoriaId` - Obtener platos por categoría
- `POST /api/platos` - Crear un nuevo plato
- `PUT /api/platos/:id` - Actualizar un plato
- `DELETE /api/platos/:id` - Eliminar un plato

### Health Check

- `GET /health` - Estado del servicio

## 📝 Ejemplos de Uso

### Crear un menú

```bash
curl -X POST http://localhost:3001/api/menus \
  -H "Content-Type: application/json" \
  -d '{"fecha": "2025-01-15"}'
```

### Crear un plato

```bash
curl -X POST http://localhost:3001/api/platos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Pasta Carbonara",
    "descripcion": "Pasta con salsa carbonara",
    "precio": 15.99,
    "disponible": true,
    "id_categoria": 1
  }'
```

## 🔄 Integración con Otros Microservicios

Este microservicio puede comunicarse con otros servicios mediante:
- **API REST** para comunicación síncrona
- **Eventos** (futuro) para comunicación asíncrona
- **API Gateway** para enrutamiento centralizado

## 📊 Diagrama de Arquitectura

```
┌─────────────────────────────────────┐
│   Microservicio de Menú             │
│   (Puerto 3001)                     │
├─────────────────────────────────────┤
│  - Menu Controller                  │
│  - Plato Controller                 │
│  - TypeORM                          │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   PostgreSQL Database               │
│   (restaurante_menu_db)             │
│   - menu                            │
│   - plato                           │
│   - categoria_menu                  │
└─────────────────────────────────────┘
```

## 🎯 Próximos Pasos

1. Implementar autenticación y autorización
2. Agregar validación de datos con class-validator
3. Implementar manejo de errores centralizado
4. Agregar logging estructurado
5. Implementar tests unitarios e integración
6. Configurar CI/CD

