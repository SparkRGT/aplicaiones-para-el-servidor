# Proyecto de Microservicios con Supabase Edge Functions

## 📋 Descripción

Proyecto de microservicios que implementa:
- ✅ Arquitectura orientada a eventos (RabbitMQ)
- ✅ Sistema de webhooks con Circuit Breaker
- ✅ **Auditoría con Supabase Edge Functions**
- ✅ Registro automático de todas las operaciones

## 🏗️ Arquitectura

```
┌─────────────────────┐
│   Microservicio A   │──────┐
│    (Productos)      │      │
│  + Supabase Audit   │      │ Events
└─────────────────────┘      │
          │                  │
          │                  ▼
          │            ┌──────────┐
          │            │ RabbitMQ │
          │            └──────────┘
          │                  │
          │                  │
          ▼                  ▼
┌─────────────────────┐  ┌─────────────────────┐
│     Supabase        │  │   Microservicio B   │
│   (Audit Logs)      │  │     (Órdenes)       │
└─────────────────────┘  └─────────────────────┘
```

## 🚀 Características Nuevas - Supabase

### Auditoría Automática

Cada operación en el microservicio A registra automáticamente:

| Operación | Qué se registra |
|-----------|-----------------|
| **CREATE** | Producto creado con todos sus datos |
| **UPDATE** | Cambios realizados (antes y después) |
| **DELETE** | Producto eliminado (soft delete) |
| **READ** | Consultas realizadas |

### Endpoints de Auditoría

```bash
# Ver últimos logs de auditoría
GET /audit/logs

# Filtrar por tipo de operación
GET /audit/logs?operationType=CREATE&limit=10

# Ver historial de un producto
GET /audit/entity/producto/1
```

## 📁 Estructura del Proyecto

```
practica-webhook/
├── microservicio-a/
│   ├── supabase/              # ⭐ NUEVO
│   │   ├── config.toml
│   │   ├── functions/
│   │   │   └── audit-logger/
│   │   │       └── index.ts   # Edge Function
│   │   └── migrations/
│   │       └── 20231215000000_create_audit_logs.sql
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.config.json  # ⭐ NUEVO
│   │   ├── services/
│   │   │   ├── supabase-audit.service.ts  # ⭐ NUEVO
│   │   │   └── productos.service.ts       # ✏️ Actualizado
│   │   └── controllers/
│   │       ├── audit.controller.ts   # ⭐ NUEVO
│   │       └── productos.controller.ts
├── microservicio-b/
├── webhook-publisher/
├── docs/
│   ├── SUPABASE_INTEGRATION.md    # ⭐ NUEVO
│   └── SUPABASE_SETUP_GUIDE.md    # ⭐ NUEVO
└── docker-compose-supabase.yml    # ⭐ NUEVO
```

## 🛠️ Setup Rápido

### 1. Configurar Supabase

Sigue la guía completa en: [docs/SUPABASE_SETUP_GUIDE.md](docs/SUPABASE_SETUP_GUIDE.md)

Resumen:
1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Copiar credenciales (URL y Service Key)
4. Crear tabla de auditoría (SQL en `microservicio-a/supabase/migrations/`)

### 2. Configurar Credenciales

Editar `microservicio-a/src/config/supabase.config.json`:

```json
{
  "supabaseUrl": "https://TU-PROYECTO.supabase.co",
  "supabaseServiceKey": "TU-SERVICE-KEY",
  "edgeFunctions": {
    "auditLogger": {
      "url": "https://TU-PROYECTO.supabase.co/functions/v1/audit-logger",
      "enabled": true
    }
  }
}
```

### 3. Instalar Dependencias

```bash
cd microservicio-a
npm install
```

### 4. Iniciar Servicios

```bash
# Opción 1: Script Windows
START-MICROSERVICIO-A-SUPABASE.bat

# Opción 2: Manualmente
cd microservicio-a
npm run start:dev
```

## 🧪 Probar la Integración

### 1. Crear un Producto

```bash
curl -X POST http://localhost:3001/productos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Laptop Gaming",
    "precio": 2500,
    "stock": 15
  }'
```

### 2. Verificar en Supabase

1. Ve a tu proyecto en [app.supabase.com](https://app.supabase.com)
2. Table Editor > `audit_logs`
3. Deberías ver el registro de la creación

### 3. Consultar Auditoría

```bash
# Ver todos los logs
curl http://localhost:3001/audit/logs

# Ver solo creaciones
curl "http://localhost:3001/audit/logs?operationType=CREATE"

# Ver historial del producto 1
curl http://localhost:3001/audit/entity/producto/1
```

## 📊 Tabla de Auditoría

La tabla `audit_logs` en Supabase contiene:

```sql
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    operation_type  VARCHAR(50) NOT NULL,    -- CREATE, UPDATE, DELETE, READ
    entity_type     VARCHAR(50) NOT NULL,    -- producto, orden, etc.
    entity_id       BIGINT,
    user_id         VARCHAR(255),
    metadata        JSONB DEFAULT '{}',
    timestamp       TIMESTAMPTZ NOT NULL,
    source          VARCHAR(100) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 📖 Ejemplos de Uso

### Ejemplo 1: Crear y Auditar Producto

```bash
# Crear producto
curl -X POST http://localhost:3001/productos \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Mouse", "precio": 50, "stock": 100}'

# Ver el log de creación
curl http://localhost:3001/audit/logs?operationType=CREATE&limit=1
```

### Ejemplo 2: Actualizar y Ver Historial

```bash
# Actualizar producto
curl -X PUT http://localhost:3001/productos/1 \
  -H "Content-Type: application/json" \
  -d '{"precio": 55}'

# Ver historial completo del producto
curl http://localhost:3001/audit/entity/producto/1
```

### Ejemplo 3: Análisis de Auditoría

```sql
-- En Supabase SQL Editor

-- Operaciones por tipo
SELECT operation_type, COUNT(*) 
FROM audit_logs 
GROUP BY operation_type;

-- Productos más modificados
SELECT entity_id, COUNT(*) as cambios
FROM audit_logs 
WHERE entity_type = 'producto' 
AND operation_type = 'UPDATE'
GROUP BY entity_id
ORDER BY cambios DESC;

-- Actividad por día
SELECT DATE(timestamp), COUNT(*)
FROM audit_logs
GROUP BY DATE(timestamp)
ORDER BY DATE(timestamp) DESC;
```

## 🔧 Configuración Avanzada

### Deshabilitar Auditoría Temporalmente

En `supabase.config.json`:

```json
{
  "edgeFunctions": {
    "auditLogger": {
      "enabled": false
    }
  }
}
```

### Usar Variables de Entorno

```bash
export SUPABASE_URL="https://tu-proyecto.supabase.co"
export SUPABASE_SERVICE_KEY="tu-service-key"
```

## 📚 Documentación

- [Integración Completa](docs/SUPABASE_INTEGRATION.md)
- [Guía de Setup](docs/SUPABASE_SETUP_GUIDE.md)
- [Documentación Original](README.md)

## 🎯 Ventajas de esta Implementación

✅ **Automática**: No requiere código adicional para cada operación  
✅ **Completa**: Registra CREATE, READ, UPDATE, DELETE  
✅ **Flexible**: Metadata en JSON para datos adicionales  
✅ **Escalable**: Supabase maneja millones de registros  
✅ **Consultable**: API REST + SQL directo  
✅ **No intrusiva**: Los errores no afectan operaciones principales  

## 🐛 Troubleshooting

### "Supabase credentials not configured"

→ Verifica `src/config/supabase.config.json` tenga las credenciales correctas

### "Table audit_logs does not exist"

→ Ejecuta la migración SQL en Supabase (ver Setup Guide)

### Los logs no aparecen

1. Verifica logs en consola del microservicio
2. Verifica en Supabase Dashboard > Logs
3. Asegúrate que `enabled: true`

## 🚀 Próximos Pasos

- [ ] Implementar autenticación de usuarios
- [ ] Agregar auditoría al Microservicio B
- [ ] Implementar alertas por operaciones sospechosas
- [ ] Dashboard de visualización de auditoría
- [ ] Exportación de reportes

## 📝 Licencia

MIT

## 👥 Contribuir

Pull requests son bienvenidos. Para cambios mayores, por favor abre un issue primero.
