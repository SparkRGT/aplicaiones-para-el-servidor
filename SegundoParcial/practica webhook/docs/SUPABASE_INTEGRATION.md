# Integración con Supabase - Edge Functions

Este documento describe cómo se ha configurado el microservicio-a para usar Supabase Edge Functions y auditoría.

## Estructura del Proyecto

```
microservicio-a/
├── supabase/
│   ├── config.toml                    # Configuración de Supabase
│   ├── migrations/
│   │   └── 20231215000000_create_audit_logs.sql  # Schema de auditoría
│   └── functions/
│       └── audit-logger/
│           └── index.ts               # Edge Function de auditoría
├── src/
│   ├── config/
│   │   └── supabase.config.json       # Credenciales de Supabase
│   ├── services/
│   │   ├── supabase-audit.service.ts  # Servicio de auditoría
│   │   └── productos.service.ts       # Integrado con auditoría
│   └── controllers/
│       └── audit.controller.ts        # API de consulta de auditoría
```

## Configuración Inicial

### 1. Instalar Supabase CLI

```bash
npm install -g supabase
```

### 2. Iniciar Proyecto de Supabase

Si aún no tienes un proyecto de Supabase:

```bash
# Crear cuenta en https://supabase.com
# Crear nuevo proyecto
# Obtener las credenciales
```

### 3. Configurar Credenciales

Editar `src/config/supabase.config.json`:

```json
{
  "supabaseUrl": "https://tu-proyecto.supabase.co",
  "supabaseAnonKey": "tu-anon-key",
  "supabaseServiceKey": "tu-service-role-key",
  "edgeFunctions": {
    "auditLogger": {
      "url": "https://tu-proyecto.supabase.co/functions/v1/audit-logger",
      "enabled": true
    }
  }
}
```

### 4. Crear la Tabla de Auditoría

Ejecutar la migración en Supabase:

```bash
# Opción 1: Usar Supabase CLI
cd microservicio-a
supabase db push

# Opción 2: Copiar y ejecutar el SQL desde el Dashboard de Supabase
# El archivo está en: supabase/migrations/20231215000000_create_audit_logs.sql
```

### 5. Desplegar Edge Function (Opcional)

La Edge Function está lista pero es **opcional** porque el servicio registra directamente en la tabla:

```bash
cd microservicio-a
supabase functions deploy audit-logger
```

## Funcionalidades Implementadas

### Registro Automático de Operaciones

Todas las operaciones CRUD en productos son registradas automáticamente:

- **CREATE**: Al crear un producto
- **UPDATE**: Al actualizar un producto
- **DELETE**: Al eliminar (soft delete) un producto
- **READ**: Al listar o consultar productos

### Estructura de Registro

Cada log de auditoría contiene:

```typescript
{
  operation_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ',
  entity_type: 'producto' | 'orden',
  entity_id: number,
  user_id: string,
  metadata: {
    // Datos específicos de la operación
  },
  timestamp: string,
  source: 'microservicio-a'
}
```

## API de Consulta de Auditoría

### Obtener Logs con Filtros

```http
GET /audit/logs?entityType=producto&operationType=CREATE&limit=10
```

Parámetros de query:
- `entityType`: Filtrar por tipo de entidad (producto, orden)
- `operationType`: Filtrar por tipo de operación (CREATE, UPDATE, DELETE, READ)
- `limit`: Número máximo de resultados (default: 50)

### Obtener Historial de una Entidad

```http
GET /audit/entity/producto/1
```

Retorna todos los logs de auditoría para el producto con ID 1.

## Ejemplos de Uso

### Crear un Producto (Con Auditoría)

```bash
curl -X POST http://localhost:3001/productos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Laptop",
    "precio": 1200,
    "stock": 10
  }'
```

Esto creará:
1. El producto en PostgreSQL
2. Un log de auditoría en Supabase
3. Un evento en RabbitMQ

### Consultar Auditoría

```bash
# Ver últimas operaciones
curl http://localhost:3001/audit/logs

# Ver operaciones de creación
curl http://localhost:3001/audit/logs?operationType=CREATE

# Ver historial de un producto específico
curl http://localhost:3001/audit/entity/producto/1
```

## Tabla de Auditoría en Supabase

La tabla `audit_logs` incluye:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigserial | ID único del log |
| operation_type | varchar(50) | Tipo de operación |
| entity_type | varchar(50) | Tipo de entidad |
| entity_id | bigint | ID de la entidad |
| user_id | varchar(255) | Usuario que realizó la operación |
| metadata | jsonb | Datos adicionales en JSON |
| timestamp | timestamptz | Momento de la operación |
| source | varchar(100) | Microservicio origen |
| created_at | timestamptz | Fecha de creación del registro |

### Índices Optimizados

- Por tipo de operación
- Por tipo de entidad
- Por ID de entidad
- Por timestamp
- Por fuente
- Compuesto por tipo y ID de entidad

## Ventajas de esta Implementación

✅ **Registro automático**: Toda operación queda registrada sin código adicional
✅ **Trazabilidad completa**: Historial detallado de cada entidad
✅ **Consultas rápidas**: Índices optimizados para búsquedas
✅ **Metadata flexible**: JSON permite almacenar cualquier dato adicional
✅ **Escalable**: Supabase maneja el almacenamiento y consultas
✅ **No bloquea operaciones**: Los errores de auditoría no afectan la operación principal

## Instalación de Dependencias

```bash
cd microservicio-a
npm install
```

La dependencia `@supabase/supabase-js` ya está agregada en `package.json`.

## Variables de Entorno (Opcional)

Puedes usar variables de entorno en lugar del archivo de configuración:

```bash
export SUPABASE_URL="https://tu-proyecto.supabase.co"
export SUPABASE_SERVICE_KEY="tu-service-role-key"
```

## Monitoreo

Puedes monitorear los logs desde:

1. **Dashboard de Supabase**: Table Editor > audit_logs
2. **API del microservicio**: `/audit/logs`
3. **SQL directo en Supabase**:

```sql
-- Últimas 10 operaciones
SELECT * FROM audit_logs 
ORDER BY timestamp DESC 
LIMIT 10;

-- Operaciones por tipo
SELECT operation_type, COUNT(*) 
FROM audit_logs 
GROUP BY operation_type;

-- Historial de un producto
SELECT * FROM audit_logs 
WHERE entity_type = 'producto' 
AND entity_id = 1 
ORDER BY timestamp;
```

## Troubleshooting

### Error: "Supabase credentials not configured"

Verifica que `src/config/supabase.config.json` tenga las credenciales correctas.

### Los logs no aparecen en Supabase

1. Verifica que la tabla `audit_logs` exista
2. Verifica las credenciales
3. Revisa los logs de la consola del microservicio
4. Asegúrate de que `enabled: true` en la configuración

### Performance lento

Si tienes muchos logs (millones), considera:
- Implementar particionamiento por fecha
- Archivar logs antiguos
- Ajustar los índices según tus patrones de consulta
