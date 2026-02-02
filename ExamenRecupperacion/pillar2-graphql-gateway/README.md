# Pillar 2 - GraphQL Gateway

## Descripción

Gateway GraphQL que actúa como capa de reporting sobre el sistema de préstamos de biblioteca. Este pilar **NO accede directamente a la base de datos**, sino que consume los endpoints REST expuestos por el Pillar 1.

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE                                  │
│                    (Apollo Sandbox)                             │
└─────────────────────────┬───────────────────────────────────────┘
                          │ GraphQL Queries
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 PILLAR 2 - GraphQL Gateway                      │
│                    Puerto: 4001                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              RecupPrestamosResolver                       │  │
│  │  - recupPrestamos                                         │  │
│  │  - recupPrestamosPorEstado(estado)                        │  │
│  │  - recupReporteVencidos                                   │  │
│  │  - recupPrestamosConDetalles                              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                          │                                      │
│  ┌───────────────────────▼───────────────────────────────────┐  │
│  │              RecupPrestamosService                        │  │
│  │                  (HttpModule/Axios)                       │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP/REST
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 PILLAR 1 - Backend REST                         │
│                    Puerto: 3000                                 │
│                                                                 │
│  Endpoint consumido: GET /recup-prestamos                       │
└─────────────────────────────────────────────────────────────────┘
```

## Configuración

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del servidor GraphQL | `4001` |
| `PILLAR1_URL` | URL base del Pillar 1 REST | `http://localhost:3000` |

### Instalación

```bash
cd pillar2-graphql-gateway
npm install
```

### Ejecución

```bash
# Desarrollo (con hot-reload)
npm run start:dev

# Producción
npm run start:prod
```

## Endpoints REST Consumidos (Pillar 1)

### Base URL
```
http://localhost:3000
```

### Endpoints

| Método | Endpoint | Descripción | Usado por |
|--------|----------|-------------|-----------|
| `GET` | `/recup-prestamos` | Obtiene todos los préstamos | `findAll()`, `findByEstado()`, `getReporteVencidos()` |
| `GET` | `/recup-prestamos?includeRelations=true` | Préstamos con lector y libro | `getPrestamosConDetalles()` |

## GraphQL Schema

### ObjectTypes

#### RecupLector
```graphql
type RecupLector {
  lectorId: Int!           # PK, autoincrement
  recup_carnet: String!    # Número de carnet único
  recup_nombreCompleto: String!
  recup_tipoLector: String!  # ESTUDIANTE | DOCENTE | EXTERNO
  recup_telefono: String!
  recup_email: String!
}
```

#### RecupLibro
```graphql
type RecupLibro {
  libroId: Int!            # PK, autoincrement
  recup_isbn: String!      # ISBN único del libro
  recup_titulo: String!
  recup_autor: String!
  recup_categoria: String!
  recup_disponible: Boolean!
}
```

#### RecupPrestamo
```graphql
type RecupPrestamo {
  prestamoId: Int!         # PK, autoincrement
  recup_codigo: String!    # Código único (ej: PRE-001)
  recup_fechaPrestamo: String!
  recup_fechaDevolucion: String!
  recup_estado: String!    # SOLICITADO | APROBADO | ENTREGADO | DEVUELTO | VENCIDO
  recup_fechaRealDevolucion: String
  recup_lectorId: Int!     # FK -> Recup_Lector
  recup_libroId: Int!      # FK -> Recup_Libro
  lector: RecupLector
  libro: RecupLibro
}
```

#### RecupPrestamosVencidosReport
```graphql
type RecupPrestamosVencidosReport {
  totalVencidos: Int!
  fechaReporte: String!
  prestamosVencidos: [RecupPrestamo!]!
}
```

## Queries Disponibles

### 1. Obtener todos los préstamos
```graphql
query {
  recupPrestamos {
    prestamoId
    recup_codigo
    recup_estado
    recup_fechaPrestamo
    recup_fechaDevolucion
  }
}
```

### 2. Filtrar préstamos por estado
```graphql
query {
  recupPrestamosPorEstado(estado: "ENTREGADO") {
    prestamoId
    recup_codigo
    recup_estado
    recup_fechaPrestamo
    recup_fechaDevolucion
  }
}
```

**Estados válidos:**
- `SOLICITADO`
- `APROBADO`
- `ENTREGADO`
- `DEVUELTO`
- `VENCIDO`

### 3. Reporte de préstamos vencidos
```graphql
query {
  recupReporteVencidos {
    totalVencidos
    fechaReporte
    prestamosVencidos {
      prestamoId
      recup_codigo
      recup_estado
      recup_fechaDevolucion
    }
  }
}
```

### 4. Préstamos con detalles (lector y libro)
```graphql
query {
  recupPrestamosConDetalles {
    prestamoId
    recup_codigo
    recup_estado
    lector {
      recup_nombreCompleto
      recup_carnet
      recup_tipoLector
    }
    libro {
      recup_titulo
      recup_autor
      recup_isbn
    }
  }
}
```

## Acceso al Playground

Una vez iniciado el servidor, acceder a:

```
http://localhost:4001/graphql
```

Se abrirá **Apollo Sandbox** donde se pueden ejecutar las queries interactivamente.

## Estructura del Proyecto

```
pillar2-graphql-gateway/
├── src/
│   ├── app.module.ts                    # Configuración GraphQL + Apollo
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── main.ts                          # Entry point (puerto 4001)
│   └── recup-prestamos/
│       ├── index.ts
│       ├── recup-prestamos.module.ts    # Módulo con HttpModule
│       ├── recup-prestamos.resolver.ts  # Resolver GraphQL
│       ├── recup-prestamos.service.ts   # Servicio (consume REST)
│       └── object-types/
│           ├── index.ts
│           ├── recup-lector.type.ts
│           ├── recup-libro.type.ts
│           ├── recup-prestamo.type.ts
│           └── recup-prestamos-vencidos-report.type.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Dependencias Principales

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `@nestjs/graphql` | ^13.x | Integración GraphQL con NestJS |
| `@nestjs/apollo` | ^13.x | Driver Apollo para NestJS |
| `@apollo/server` | ^5.x | Servidor Apollo GraphQL |
| `@nestjs/axios` | ^4.x | Cliente HTTP para consumir REST |
| `graphql` | ^16.x | Librería core de GraphQL |

## Nomenclatura del Dominio

| Componente | Nombre Exacto |
|------------|---------------|
| Evento RabbitMQ | `recup_prestamo.estado.cambiado` |
| Evento Webhook | `recup_prestamo.notificacion` |
| Tool MCP | `recup_consultar_prestamos` |
| Workflow n8n | `recup-flujo-prestamos` |
| Endpoint REST | `GET /recup-prestamos` |

## Requisitos

- Node.js >= 18
- Pillar 1 corriendo en puerto 3000
- npm o yarn

## Autor

Sistema de Préstamos de Biblioteca - Examen Recuperación
