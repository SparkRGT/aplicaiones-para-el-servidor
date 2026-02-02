# PILLAR 1: Backend + Persistence

## 📚 DOMINIO: SISTEMA DE PRÉSTAMOS DE BIBLIOTECA

Este pilar implementa el backend principal con persistencia para el Sistema de Préstamos de Biblioteca.

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|------------|---------|
| **Framework** | NestJS | ^11.0.1 |
| **ORM** | TypeORM | ^0.3.28 |
| **Base de Datos** | SQLite | ^5.1.7 |
| **Lenguaje** | TypeScript | ^5.7.3 |
| **Runtime** | Node.js | v22.x |

---

## 📁 Estructura del Proyecto

```
pillar1-backend/
├── src/
│   ├── lectores/                    # Módulo Recup_Lector
│   │   ├── dto/
│   │   │   ├── create-lector.dto.ts
│   │   │   └── update-lector.dto.ts
│   │   ├── entities/
│   │   │   └── recup_lector.entity.ts
│   │   ├── lectores.controller.ts
│   │   ├── lectores.module.ts
│   │   └── lectores.service.ts
│   │
│   ├── libros/                      # Módulo Recup_Libro
│   │   ├── dto/
│   │   │   ├── create-libro.dto.ts
│   │   │   └── update-libro.dto.ts
│   │   ├── entities/
│   │   │   └── recup_libro.entity.ts
│   │   ├── libros.controller.ts
│   │   ├── libros.module.ts
│   │   └── libros.service.ts
│   │
│   ├── prestamos/                   # Módulo Recup_Prestamo
│   │   ├── dto/
│   │   │   ├── create-prestamo.dto.ts
│   │   │   └── update-prestamo.dto.ts
│   │   ├── entities/
│   │   │   ├── index.ts
│   │   │   ├── recup_lector.entity.ts
│   │   │   ├── recup_libro.entity.ts
│   │   │   └── recup_prestamo.entity.ts
│   │   ├── prestamos.controller.ts
│   │   ├── prestamos.module.ts
│   │   └── prestamos.service.ts
│   │
│   ├── app.module.ts               # Módulo principal
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts                     # Bootstrap
│
├── postman/                         # Colecciones de prueba
│   ├── Pillar1_Evidencia.postman_collection.json
│   └── Recup_Prestamos_API.postman_collection.json
│
├── biblioteca.db                    # Base de datos SQLite
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## 🗃️ Modelo de Datos

### Entidades Maestras

#### 1. Recup_Lector (Entidad Maestra)

| Atributo | Tipo | Descripción |
|----------|------|-------------|
| `lectorId` | number | PK, autoincrement |
| `recup_carnet` | string | Número de carnet único |
| `recup_nombreCompleto` | string | Nombre completo |
| `recup_tipoLector` | string | Tipo (ESTUDIANTE, DOCENTE, EXTERNO) |
| `recup_telefono` | string | Teléfono de contacto |
| `recup_email` | string | Correo electrónico |

#### 2. Recup_Libro (Entidad Maestra)

| Atributo | Tipo | Descripción |
|----------|------|-------------|
| `libroId` | number | PK, autoincrement |
| `recup_isbn` | string | ISBN único del libro |
| `recup_titulo` | string | Título del libro |
| `recup_autor` | string | Autor del libro |
| `recup_categoria` | string | Categoría temática |
| `recup_disponible` | boolean | Estado de disponibilidad |

### Entidad Transaccional

#### 3. Recup_Prestamo (Entidad Transaccional - Principal)

| Atributo | Tipo | Descripción |
|----------|------|-------------|
| `prestamoId` | number | PK, autoincrement |
| `recup_codigo` | string | Código único de préstamo (ej: PRE-001) |
| `recup_fechaPrestamo` | Date | Fecha del préstamo |
| `recup_fechaDevolucion` | Date | Fecha esperada de devolución |
| `recup_estado` | string | SOLICITADO \| APROBADO \| ENTREGADO \| DEVUELTO \| VENCIDO |
| `recup_fechaRealDevolucion` | Date | Fecha real de devolución (nullable) |
| `recup_lectorId` | number | FK → Recup_Lector |
| `recup_libroId` | number | FK → Recup_Libro |

---

## 🔗 Relaciones

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│  Recup_Lector   │       │  Recup_Prestamo  │       │   Recup_Libro   │
│    (Master)     │◄──────│ (Transactional)  │──────►│    (Master)     │
│                 │  1:N  │                  │  N:1  │                 │
│  lectorId (PK)  │       │  recup_lectorId  │       │  libroId (PK)   │
│                 │       │  recup_libroId   │       │                 │
└─────────────────┘       └──────────────────┘       └─────────────────┘
```

---

## 🌐 API REST Endpoints

### Recup_Lector
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/recup-lectores` | Obtener todos los lectores |
| GET | `/recup-lectores/:id` | Obtener lector por ID |
| POST | `/recup-lectores` | Crear nuevo lector |
| PATCH | `/recup-lectores/:id` | Actualizar lector |
| DELETE | `/recup-lectores/:id` | Eliminar lector |

### Recup_Libro
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/recup-libros` | Obtener todos los libros |
| GET | `/recup-libros/:id` | Obtener libro por ID |
| POST | `/recup-libros` | Crear nuevo libro |
| PATCH | `/recup-libros/:id` | Actualizar libro |
| DELETE | `/recup-libros/:id` | Eliminar libro |

### Recup_Prestamo (Endpoint Principal)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| **GET** | **`/recup-prestamos`** | **Endpoint REST requerido por el dominio** |
| GET | `/recup-prestamos/:id` | Obtener préstamo por ID |
| POST | `/recup-prestamos` | Crear nuevo préstamo |
| PATCH | `/recup-prestamos/:id` | Actualizar préstamo |
| DELETE | `/recup-prestamos/:id` | Eliminar préstamo |

---

## 🚀 Comandos

### Instalación
```bash
cd pillar1-backend
npm install
```

### Desarrollo
```bash
# Iniciar en modo desarrollo (hot reload)
npm run start:dev

# Iniciar en modo producción
npm run start:prod

# Compilar
npm run build
```

### Troubleshooting - Puerto en uso
Si el puerto 3000 está en uso:
```powershell
# Ver procesos usando el puerto 3000
netstat -ano | findstr :3000

# Matar el proceso (reemplazar PID con el número del proceso)
taskkill /PID <PID> /F
```

---

## 📋 Nomenclatura del Dominio

| Componente | Nombre Exacto |
|------------|---------------|
| Evento RabbitMQ | `recup_prestamo.estado.cambiado` |
| Evento Webhook | `recup_prestamo.notificacion` |
| Tool MCP | `recup_consultar_prestamos` |
| Workflow n8n | `recup-flujo-prestamos` |
| **Endpoint REST** | **`GET /recup-prestamos`** |
| Query GraphQL | Préstamos vencidos con información del lector y libro prestado |

---

## ⚠️ Restricciones del Pilar 1

| Elemento | Estado |
|----------|--------|
| Recup_Lector | ✅ Implementado |
| Recup_Libro | ✅ Implementado |
| Recup_Prestamo | ✅ Implementado |
| Recup_HistorialPrestamo | ❌ **NO IMPLEMENTAR** (Pilar 3 - Auditoría) |

---

## 🧪 Pruebas con Postman

1. Importar la colección desde: `postman/Pillar1_Evidencia.postman_collection.json`
2. Verificar que la variable `{{baseUrl}}` esté configurada como `http://localhost:3000`
3. Ejecutar las pruebas en orden:
   - **1. SETUP DATOS MAESTROS** - Crear lectores y libros
   - **2. CRUD RECUP_PRESTAMO** - Operaciones CRUD completas
   - **3. VERIFICAR ENTIDADES MAESTRAS** - Validar relaciones
   - **4. EVIDENCIA FINAL** - Capturas para documentación

---

## 📝 Configuración TypeORM

```typescript
// app.module.ts
TypeOrmModule.forRoot({
  type: 'sqlite',
  database: 'biblioteca.db',
  entities: [Recup_Lector, Recup_Libro, Recup_Prestamo],
  synchronize: true,  // Solo desarrollo
})
```

---

## 👨‍💻 Autor

**Examen de Recuperación - Aplicaciones para el Servidor**

Fecha: Febrero 2026
