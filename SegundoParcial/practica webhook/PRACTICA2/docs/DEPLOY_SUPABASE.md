# 🚀 Guía de Deploy en Supabase

## Paso 1: Crear Proyecto en Supabase

```bash
# Ir a https://supabase.com
# Crear nuevo proyecto
# Nota el PROJECT_REF (ej: abcdef123456)
```

## Paso 2: Configurar Supabase CLI

```bash
# Instalar CLI
npm install -g supabase

# Inicializar en el proyecto
cd PRACTICA2
supabase init

# Vincular con proyecto remoto
supabase link --project-ref YOUR_PROJECT_REF

# Autenticarse
supabase login
```

## Paso 3: Crear Esquema de Base de Datos

```bash
# Opción 1: Desde Supabase Dashboard
# 1. Ir a SQL Editor
# 2. Pegar contenido de supabase/schema.sql
# 3. Ejecutar

# Opción 2: Desde CLI
psql postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres < supabase/schema.sql
```

## Paso 4: Desplegar Edge Functions

```bash
# Crear las funciones
supabase functions new webhook-event-logger
supabase functions new webhook-external-notifier

# Copiar código de:
# - supabase/functions/webhook-event-logger/index.ts
# - supabase/functions/webhook-external-notifier/index.ts

# Configurar secrets
supabase secrets set \
  WEBHOOK_SECRET=webhook_secret_logger_key_123456 \
  RESEND_API_KEY=your_resend_api_key \
  SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co \
  SUPABASE_ANON_KEY=YOUR_ANON_KEY

# Desplegar
supabase functions deploy webhook-event-logger
supabase functions deploy webhook-external-notifier

# Verificar
supabase functions list
```

## Paso 5: Obtener URLs de Edge Functions

```bash
# Las URLs serán:
WEBHOOK_EVENT_LOGGER_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/webhook-event-logger
WEBHOOK_EXTERNAL_NOTIFIER_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/webhook-external-notifier
```

## Paso 6: Actualizar .env

```bash
# Copiar valores de Supabase Dashboard
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Actualizar URLs de webhooks
WEBHOOK_EVENT_LOGGER_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/webhook-event-logger
WEBHOOK_EXTERNAL_NOTIFIER_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/webhook-external-notifier
```

## Paso 7: Verificar Deployment

```bash
# Probar Edge Function 1
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/webhook-event-logger \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: sha256=test" \
  -H "X-Webhook-Timestamp: $(date +%s)" \
  -d '{
    "event": "test",
    "id": "evt_test",
    "idempotency_key": "test-key",
    "data": {},
    "metadata": {}
  }' -v

# Resultado esperado: HTTP 200 o 401 (si firma invalida)
```

## Paso 8: Monitoreo en Supabase

```bash
# Ver Edge Function Logs
supabase functions list --linked
supabase functions list --no-linked

# Ver logs en tiempo real
supabase functions logs webhook-event-logger

# Ver datos en BD
# Dashboard → SQL Editor → Select * from webhook_events;
```

---

## Troubleshooting

### "Project not found"
```
supabase link --project-ref YOUR_CORRECT_PROJECT_REF
```

### "Authentication failed"
```
supabase logout
supabase login
```

### "Edge Function returns 404"
```
# Verificar que fue desplegado
supabase functions list

# Re-desplegar
supabase functions deploy webhook-event-logger --force
```

### "Secret not accessible in function"
```
# Re-configurar secrets
supabase secrets list
supabase secrets unset WEBHOOK_SECRET
supabase secrets set WEBHOOK_SECRET=new_value
```

---

## Variables Necesarias en Supabase

```
WEBHOOK_SECRET = webhook_secret_logger_key_123456
RESEND_API_KEY = re_xxxxxxxxxxxxx (opcional, para emails reales)
SUPABASE_URL = https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIs...
```

---

## Test Rápido Después de Deploy

```bash
# 1. Crear producto en local
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Test", "precio": 100, "stock": 5}'

# 2. Verificar en Supabase
# Dashboard → SQL Editor
# SELECT * FROM webhook_events ORDER BY received_at DESC LIMIT 1;

# 3. Ver logs de Edge Function
supabase functions logs webhook-event-logger
```

---

## Referencias

- [Supabase Docs](https://supabase.com/docs)
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [CLI Reference](https://supabase.com/docs/reference/cli/introduction)

---

**¡Listo para producción!** 🚀
