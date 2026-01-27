# 🤖 Sistema de Notificaciones por Telegram - Guía Completa

## Descripción General

Este sistema integra **notificaciones por Telegram** en tu arquitectura de microservicios. Cada evento generado (creación de productos, órdenes, etc.) dispara automáticamente una notificación en Telegram.

**Flujo:**
```
Evento en Microservicio A/B 
  ↓
RabbitMQ (pub/sub)
  ↓
Webhook Publisher (firma HMAC-SHA256)
  ↓
Supabase Edge Function (external-notifier)
  ↓
Telegram Bot API
  ↓
🤖 Mensaje en tu chat personal
```

---

## Parte 1: Configurar Telegram Bot

### Paso 1: Crear el Bot

1. **Abre Telegram** en tu teléfono o web
2. **Busca a:** `@BotFather` (bot oficial de Telegram)
3. **Inicia conversación:** `/start`
4. **Crea nuevo bot:** `/newbot`
5. **Responde las preguntas:**
   - **Nombre:** "Webhook Notifier Bot" (o el que prefieras)
   - **Username:** `webhook_notifier_XXXXX` (debe ser único, con números aleatorios)

### Paso 2: Recibir el Token

BotFather te mostrará algo como:
```
✅ Done! Congratulations on your new bot. 
You will find it at t.me/webhook_notifier_xxxxx. 
You can now add a description, about section and profile picture for your bot, see /help for a list of commands.

Use this token to access the HTTP API:
🔑 123456789:ABCdefGHIjklmnoPQRstuvWXYZ-ABCDEF

Keep your token secure and store it safely!
```

**Guarda el token (la parte después de "Use this token")**

### Paso 3: Obtener tu Chat ID

1. **Envía cualquier mensaje a tu bot** (búscalo en Telegram)
2. **Abre esta URL** en tu navegador:
   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```
   Reemplaza `<TOKEN>` con el token que obtuviste

3. **Busca tu mensaje en la respuesta JSON** y copia el `chat.id`:
   ```json
   {
     "update_id": 123456789,
     "message": {
       "message_id": 1,
       "date": 1234567890,
       "chat": {
         "id": 987654321,  // ← Este es tu CHAT_ID
         "first_name": "Tu Nombre",
         "type": "private"
       },
       "text": "Tu mensaje"
     }
   }
   ```

---

## Parte 2: Configurar Localmente

### Archivo `.env`

Edita el archivo `.env` en la raíz del proyecto:

```dotenv
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklmnoPQRstuvWXYZ
TELEGRAM_CHAT_ID=987654321

# Webhook Secret (debe coincidir con Supabase)
WEBHOOK_SECRET=edge_function_2_secret_key
```

### Script de Configuración Rápida

Ejecuta el script interactivo:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-telegram.ps1
```

Este script:
- ✅ Te pide el Token y Chat ID
- ✅ Verifica que sean válidos
- ✅ Envía un mensaje de prueba
- ✅ Actualiza tu `.env`

---

## Parte 3: Configurar en Supabase (Producción)

### En Supabase Dashboard

1. **Ve a:** Proyecto → Settings → Secrets
2. **Agrega dos nuevos secrets:**

| Nombre | Valor |
|--------|-------|
| `TELEGRAM_BOT_TOKEN` | `123456789:ABCdefGHIjklmnoPQRstuvWXYZ` |
| `TELEGRAM_CHAT_ID` | `987654321` |

3. **Verifica que también esté:** `WEBHOOK_SECRET` = `edge_function_2_secret_key`

### Desplegar Edge Function

```bash
# En la carpeta supabase/functions/external-notifier
supabase functions deploy external-notifier --project-id <tu-project-id>
```

---

## Parte 4: Probar el Sistema

### Prueba 1: Mensaje directo

```bash
# Enviar un mensaje de prueba sin crear eventos
curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": <CHAT_ID>,
    "text": "🤖 Prueba de conexión!",
    "parse_mode": "Markdown"
  }'
```

### Prueba 2: Crear producto (genera webhook)

```powershell
# PowerShell
$body = @{
    nombre = "Laptop Gaming Test"
    descripcion = "Para probar Telegram"
    precio = 1500
    stock = 5
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/microservicio-a/productos" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```

**Resultado esperado:** 
- ✅ Ves el mensaje en Telegram en 2-3 segundos

### Prueba 3: Ejecutar script completo

```powershell
powershell -ExecutionPolicy Bypass -File scripts/test-telegram.ps1
```

Este script:
- ✅ Verifica credenciales
- ✅ Envía mensaje de prueba
- ✅ Crea un producto
- ✅ Crea una orden
- ✅ Espera a que se procesen los webhooks

---

## Estructura del Mensaje en Telegram

Verás mensajes como este:

```
🔔 *Nuevo Evento*

*Tipo:* producto.creado
*Origen:* microservicio-a
*ID:* a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6
*Fecha:* 15/12/2025, 10:45:30

*Datos:*
{
  "productoId": 1,
  "nombre": "Laptop Gaming",
  "precio": 1500,
  "stock": 5
}
```

---

## Troubleshooting

### ❌ "bot token not provided"
**Solución:** 
- Verificar que `TELEGRAM_BOT_TOKEN` esté en `.env` o Supabase Secrets
- Verificar que el token no tenga espacios extra

### ❌ "chat not found"
**Solución:**
- Verificar que `TELEGRAM_CHAT_ID` sea correcto
- Asegurarse de haber enviado al menos UN mensaje al bot primero

### ❌ "Flood control is engaged"
**Solución:**
- Telegram limita a ~30 mensajes por minuto
- Esperar 1-2 minutos entre pruebas masivas

### ❌ No recibo mensajes en Telegram
**Pasos para diagnosticar:**

1. **Verifica que el bot está activo:**
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/getMe"
   ```

2. **Revisa los logs de Supabase:**
   - Dashboard → Functions → external-notifier → Logs
   - Busca `TELEGRAM_BOT_TOKEN` o errores

3. **Verifica la URL correcta:**
   ```bash
   # Debe retornar tu bot
   curl "https://api.telegram.org/bot<TOKEN>/getMe" | jq .
   ```

4. **Habilita logs en la Edge Function:**
   - Busca `console.log` en el código
   - Revisa Supabase Dashboard → Functions → Logs

---

## Pasos Rápidos (Resumen)

```powershell
# 1. Crear bot en @BotFather en Telegram
# 2. Copiar el TOKEN y CHAT_ID

# 3. Ejecutar configurador
powershell -ExecutionPolicy Bypass -File scripts/setup-telegram.ps1

# 4. Verificar .env está actualizado
# 5. Si usas Supabase, actualizar Secrets también

# 6. Ejecutar pruebas
powershell -ExecutionPolicy Bypass -File scripts/test-telegram.ps1

# 7. Abre Telegram y verifica los mensajes
```

---

## Archivos Relacionados

- **Edge Function:** `supabase/functions/external-notifier/index.ts`
- **Configuración:** `.env` (local) y Supabase Secrets (producción)
- **Scripts:**
  - `scripts/setup-telegram.ps1` - Configuración interactiva
  - `scripts/test-telegram.ps1` - Pruebas completas
  - `scripts/setup-telegram.sh` - Versión Bash

---

## Variables de Entorno

```env
# Token del bot (de @BotFather)
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklmnoPQRstuvWXYZ

# Tu Chat ID personal
TELEGRAM_CHAT_ID=987654321

# Secret para validar HMAC (debe coincidir en todo el sistema)
WEBHOOK_SECRET=edge_function_2_secret_key

# Supabase (para Edge Functions)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

## Próximos Pasos

1. ✅ Crear bot y obtener TOKEN + CHAT_ID
2. ✅ Ejecutar `setup-telegram.ps1`
3. ✅ Actualizar `.env` y Supabase Secrets
4. ✅ Ejecutar `test-telegram.ps1`
5. ⏭️ (Opcional) Integrar más canales (Email, Slack, Discord)
6. ⏭️ (Opcional) Filtrar eventos (solo notificar ciertos tipos)
