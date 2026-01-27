# Guía de Setup - Supabase Edge Functions

Esta guía te ayudará a configurar Supabase para el proyecto.

## Paso 1: Crear Cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Haz clic en "New Project"

## Paso 2: Crear Nuevo Proyecto

1. Nombre del proyecto: `microservicio-a-audit`
2. Contraseña de la base de datos: (guarda esta contraseña)
3. Región: Elige la más cercana
4. Plan: Free (suficiente para desarrollo)
5. Haz clic en "Create new project"

⏱️ Espera 2-3 minutos mientras se crea el proyecto

## Paso 3: Obtener Credenciales

Una vez creado el proyecto:

1. Ve a Settings (⚙️) > API
2. Copia los siguientes valores:

```
Project URL: https://xxxxx.supabase.co
anon public key: eyJhbGc...
service_role key: eyJhbGc... (⚠️ Mantén esto secreto)
```

## Paso 4: Configurar el Proyecto

### Opción A: Usando archivo de configuración

Edita `microservicio-a/src/config/supabase.config.json`:

```json
{
  "supabaseUrl": "https://xxxxx.supabase.co",
  "supabaseAnonKey": "tu-anon-key",
  "supabaseServiceKey": "tu-service-role-key",
  "edgeFunctions": {
    "auditLogger": {
      "url": "https://xxxxx.supabase.co/functions/v1/audit-logger",
      "enabled": true
    }
  }
}
```

### Opción B: Usando variables de entorno

```bash
cp .env.example .env
# Luego edita .env con tus credenciales
```

## Paso 5: Crear la Tabla de Auditoría

### Opción A: Desde el Dashboard de Supabase (Recomendado)

1. Ve a tu proyecto en Supabase
2. Haz clic en "SQL Editor"
3. Copia el contenido de `microservicio-a/supabase/migrations/20231215000000_create_audit_logs.sql`
4. Pégalo en el editor y haz clic en "Run"

### Opción B: Usando Supabase CLI

```bash
# Instalar CLI
npm install -g supabase

# Iniciar sesión
supabase login

# Vincular proyecto
cd microservicio-a
supabase link --project-ref tu-project-id

# Aplicar migraciones
supabase db push
```

## Paso 6: Verificar la Tabla

1. Ve a "Table Editor" en Supabase
2. Deberías ver la tabla `audit_logs` con estas columnas:
   - id
   - operation_type
   - entity_type
   - entity_id
   - user_id
   - metadata
   - timestamp
   - source
   - created_at

## Paso 7: Instalar Dependencias del Microservicio

```bash
cd microservicio-a
npm install
```

## Paso 8: Iniciar el Microservicio

```bash
npm run start:dev
```

## Paso 9: Probar la Integración

### Crear un producto

```bash
curl -X POST http://localhost:3001/productos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Laptop Test",
    "precio": 1500,
    "stock": 5
  }'
```

### Verificar en Supabase

1. Ve a "Table Editor" > `audit_logs`
2. Deberías ver un registro con:
   - operation_type: "CREATE"
   - entity_type: "producto"
   - metadata con los datos del producto

### Consultar auditoría desde la API

```bash
# Ver todos los logs
curl http://localhost:3001/audit/logs

# Ver solo creaciones
curl http://localhost:3001/audit/logs?operationType=CREATE

# Ver historial de producto 1
curl http://localhost:3001/audit/entity/producto/1
```

## Paso 10: (Opcional) Desplegar Edge Function

Si quieres usar la Edge Function en lugar del acceso directo:

```bash
cd microservicio-a
supabase functions deploy audit-logger
```

Luego actualiza la configuración para usar la URL de la función.

## Troubleshooting

### Error: "Failed to connect to Supabase"

- Verifica que las credenciales sean correctas
- Verifica que el proyecto esté activo en Supabase
- Revisa la URL (debe empezar con https://)

### Error: "Table audit_logs does not exist"

- Ve al paso 5 y crea la tabla
- Verifica en Table Editor que la tabla exista

### Los logs no aparecen

1. Revisa la consola del microservicio (debería decir "Audit log created successfully")
2. Verifica en Supabase Dashboard > Logs si hay errores
3. Asegúrate de que `enabled: true` en la configuración

### Error: "Invalid API key"

- Verifica que estés usando `service_role` key, no `anon` key
- Regenera las keys desde Settings > API si es necesario

## Siguientes Pasos

Una vez que todo funcione:

1. ✅ Los productos se guardan en PostgreSQL local
2. ✅ La auditoría se guarda en Supabase
3. ✅ Los eventos se publican en RabbitMQ
4. ✅ Puedes consultar el historial de cambios

Ahora puedes:
- Ver el historial completo de cada producto
- Auditar quién hizo qué cambios y cuándo
- Analizar patrones de uso
- Cumplir con requisitos de compliance

## Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [Dashboard de Supabase](https://app.supabase.com)
