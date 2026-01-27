# Script de Prueba - Notificaciones por Telegram

## Requisitos Previos

1. **Crear un Telegram Bot** (ver [TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md))
2. **Obtener el Token del Bot** y **Chat ID**
3. **Configurar en Supabase Secrets** o variables de entorno locales

## Configuración Local (para testing)

Agregar al `.env`:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
WEBHOOK_SECRET=edge_function_2_secret_key
```

## Pruebas Manuales

### 1. Probar conexión al Bot

```bash
# Verificar que el token es válido
curl "https://api.telegram.org/bot<TOKEN>/getMe"

# Respuesta esperada:
{
  "ok": true,
  "result": {
    "id": 123456789,
    "is_bot": true,
    "first_name": "Webhook Notifier Bot",
    "username": "webhook_notifier_bot_xxxxx"
  }
}
```

### 2. Obtener actualizaciones recientes

```bash
curl "https://api.telegram.org/bot<TOKEN>/getUpdates"
```

### 3. Enviar mensaje de prueba directo

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": <CHAT_ID>,
    "text": "🤖 Prueba de conexión - Notificador de Webhooks",
    "parse_mode": "Markdown"
  }'
```

## Prueba del Flujo Completo

### Crear un producto (dispara evento)

```bash
curl -X POST http://localhost:3000/api/microservicio-a/productos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Monitor 4K",
    "descripcion": "Monitor ultrawide 4K para gaming",
    "precio": 800,
    "stock": 3
  }'
```

**Resultado esperado:**
- ✅ Producto creado en BD
- ✅ Evento publicado a RabbitMQ
- ✅ Webhook Publisher procesa el evento
- ✅ Edge Function (external-notifier) recibe el webhook
- ✅ **Mensaje aparece en tu chat de Telegram**

### Crear una orden

```bash
curl -X POST http://localhost:3000/api/microservicio-a/productos/1/ordenes \
  -H "Content-Type: application/json" \
  -d '{
    "cantidad": 2,
    "precioUnitario": 800
  }'
```

**Resultado esperado:**
- ✅ Orden creada en Microservicio B
- ✅ Evento a RabbitMQ: "orden.solicitada"
- ✅ Evento de confirmación: "orden.confirmada"
- ✅ **Múltiples mensajes en Telegram**

## Esperado en Telegram

Verás mensajes así:

```
🔔 *Nuevo Evento*

*Tipo:* producto.creado
*Origen:* microservicio-a
*ID:* a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6
*Fecha:* 15/12/2025, 10:45:30

*Datos:*
{
  "productoId": 1,
  "nombre": "Monitor 4K",
  "precio": 800,
  "stock": 3
}
```

## Troubleshooting

| Problema | Solución |
|----------|----------|
| No recibo mensajes en Telegram | Verificar que TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID estén correctos en Supabase Secrets |
| "Flood control is engaged" | Esperar 1-2 minutos entre envíos masivos |
| Error 404 en Telegram API | Verificar que el token no tenga espacios extra |
| Mensaje truncado | Telegram limita a 4096 caracteres; si el JSON es muy grande, se trunca |

## Logs en Supabase

Para verificar qué sucedió:

1. Ve a **Supabase Dashboard → Functions → external-notifier**
2. Click en **Logs**
3. Busca por `event_id` o `eventId`

Deberías ver:
```
✅ Notificación enviada a Telegram: <event_id>
```

## Variables de Entorno en Supabase

En **Project Settings → Secrets**, agregar:

```
TELEGRAM_BOT_TOKEN = 123456789:ABCdefGHIjklmnoPQRstuvWXYZ
TELEGRAM_CHAT_ID = 987654321
WEBHOOK_SECRET = edge_function_2_secret_key
```

## Próximos Pasos

1. ✅ Configurar Telegram Bot (BotFather)
2. ✅ Obtener Token y Chat ID
3. ✅ Configurar en Supabase Secrets
4. ✅ Probar flujo completo
5. (Opcional) Integrar con más canales (Email, Slack, etc.)
