# Configuración de Notificaciones por Telegram

## Paso 1: Crear un Telegram Bot

1. **Abre Telegram** y busca a `@BotFather`
2. **Inicia la conversación** con `/start`
3. **Crea un nuevo bot** con `/newbot`
4. **Responde las preguntas:**
   - Nombre del bot: `Webhook Notifier Bot` (o el que prefieras)
   - Username del bot: `webhook_notifier_bot_XXXXX` (debe ser único)
5. **Copia el TOKEN** que te da BotFather (ejemplo: `123456789:ABCdefGHIjklmnoPQRstuvWXYZ`)

## Paso 2: Obtener tu Chat ID

### Opción A: Manualmente
1. **Escribe a tu bot** cualquier mensaje
2. **Abre esta URL** en el navegador:
   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```
   Reemplaza `<TOKEN>` con tu token
3. **Busca tu mensaje** en la respuesta JSON
4. **Copia el `chat.id`** (ejemplo: `123456789`)

### Opción B: Script automático
```bash
curl "https://api.telegram.org/bot<TOKEN>/getUpdates"
```

## Paso 3: Configurar Variables de Entorno

### En tu archivo `.env` (en la raíz del proyecto):

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklmnoPQRstuvWXYZ
TELEGRAM_CHAT_ID=123456789
WEBHOOK_SECRET=edge_function_2_secret_key
```

Este archivo se usa automáticamente por Node.js.

## Paso 4: Crear Directorio de Datos

El sistema usa archivos JSON locales. Asegúrate de que exista la carpeta:

```
proyecto/
└── data/
    └── webhooks/
        ├── processed.json  (se crea automáticamente)
        └── [eventos].json  (se crean automáticamente)
```

La carpeta se crea automáticamente cuando inician los servicios.

## Paso 5: Probar la Integración

Los servicios NestJS procesarán automáticamente los eventos y enviarán a Telegram.

Para probar manualmente:
```powershell
# Crear un producto
curl -X POST http://localhost:3001/api/productos `
  -H "Content-Type: application/json" `
  -d '{
    "nombre": "Test",
    "precio": 100,
    "stock": 5
  }'

# El evento se guardará en data/webhooks/ y se envía a Telegram automáticamente
```

## Estructura de Mensajes de Telegram

El servicio TelegramNotificationService enviará mensajes con este formato:

```
🔔 Notificación de Webhook

📋 Evento: producto.creado
📱 Fuente: microservicio-a
⏰ Timestamp: 2025-12-15T10:30:00Z

📦 Datos:
- ID Producto: 1
- Nombre: Laptop Gaming
- Precio: $1500

✅ Procesado exitosamente
```

## Troubleshooting

### Error: "bot token not provided"
- Verificar que `TELEGRAM_BOT_TOKEN` esté en `.env`
- Verificar que el token sea válido (copiar correctamente desde BotFather)

### Error: "chat not found"
- Verificar que el `TELEGRAM_CHAT_ID` sea correcto
- Asegurarse de haber escrito al bot al menos una vez

### Error: "Flood control is engaged"
- Esperar unos minutos antes de enviar más mensajes
- No enviar más de ~30 mensajes por minuto

### Eventos no aparecen en Telegram
- Verificar que el servicio está corriendo: `npm run start:dev`
- Revisar los logs en la terminal
- Verificar que los archivos JSON se crean en `data/webhooks/`

### Archivos JSON no se crean
- Asegurarse de que exista la carpeta `data/webhooks/`
- Verificar permisos de escritura en la carpeta
- Los archivos se crean automáticamente al enviar eventos

## Variables de Entorno Requeridas

En el archivo `.env` de la raíz del proyecto:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=<tu_token_aqui>        # De BotFather (ej: 123456789:ABCDEF...)
TELEGRAM_CHAT_ID=<tu_chat_id_aqui>        # Tu ID de chat personal (ej: 987654321)

# Webhooks Secret (para validación HMAC)
WEBHOOK_SECRET=edge_function_2_secret_key
```

## Archivos JSON Generados

El sistema crea automáticamente:

```
data/webhooks/
├── processed.json                    # Registro de eventos procesados
├── 1702600200000-uuid-1.json       # Evento 1
├── 1702600201000-uuid-2.json       # Evento 2
└── ...
```

Cada archivo contiene:
```json
{
  "id": "uuid-string",
  "type": "producto.creado",
  "timestamp": "2025-12-15T10:30:00Z",
  "source": "microservicio-a",
  "data": { "productoId": 1, "nombre": "Laptop" },
  "processed": true,
  "telegramSent": true
}
```

## Links Útiles

- **BotFather:** https://t.me/BotFather
- **Telegram Bot API:** https://core.telegram.org/bots/api
- **getUpdates:** https://core.telegram.org/bots/api#getupdates
- **sendMessage:** https://core.telegram.org/bots/api#sendmessage
