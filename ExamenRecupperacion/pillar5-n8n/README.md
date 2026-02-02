# Pillar 5: n8n Workflow - Sistema de Préstamos de Biblioteca

## Información del Workflow

| Componente | Valor |
|------------|-------|
| **Workflow Name** | `recup-flujo-prestamos` |
| **Webhook Event** | `recup_prestamo.notificacion` |
| **Webhook URL** | `http://localhost:5678/webhook/recup_prestamo.notificacion` |
| **Trigger** | Cambio de estado en préstamo |

## Requisitos Previos

1. **Docker** y **Docker Compose** instalados
2. **Bot de Telegram** creado con [@BotFather](https://t.me/BotFather)
3. **Chat ID** de Telegram (puede ser un grupo o usuario)

## Paso 1: Crear Bot de Telegram

1. Abre Telegram y busca `@BotFather`
2. Envía `/newbot`
3. Sigue las instrucciones para crear tu bot
4. Guarda el **Token de API** que te proporciona

### Obtener Chat ID

1. Añade tu bot a un grupo o inicia conversación directa
2. Envía un mensaje al bot
3. Visita: `https://api.telegram.org/bot<TU_TOKEN>/getUpdates`
4. Busca el campo `chat.id` en la respuesta

## Paso 2: Iniciar n8n con Docker

```bash
cd pillar5-n8n
docker-compose up -d
```

n8n estará disponible en: **http://localhost:5678**

## Paso 3: Configurar Credenciales de Telegram en n8n

1. Abre n8n en el navegador: http://localhost:5678
2. Ve a **Settings** > **Credentials**
3. Click en **Add Credential**
4. Selecciona **Telegram API**
5. Ingresa el **Bot Token** obtenido de BotFather
6. Guarda las credenciales

## Paso 4: Importar el Workflow

1. En n8n, ve a **Workflows**
2. Click en **Import from File**
3. Selecciona el archivo: `workflows/recup-flujo-prestamos.json`
4. Actualiza las credenciales de Telegram en el nodo "Enviar Telegram"
5. Configura el **Chat ID** en el nodo de Telegram

## Paso 5: Configurar Variable de Entorno en el Backend

En el archivo `.env` del `pillar1-backend`:

```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook/recup_prestamo.notificacion
```

## Paso 6: Activar el Workflow

1. En n8n, abre el workflow `recup-flujo-prestamos`
2. Click en el toggle **Active** en la esquina superior derecha
3. El webhook estará listo para recibir eventos

## Flujo del Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     recup-flujo-prestamos                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐           │
│  │   Webhook    │───▶│  Formatear   │───▶│   Telegram   │           │
│  │  (Trigger)   │    │   Mensaje    │    │    Send      │           │
│  └──────────────┘    └──────────────┘    └──────────────┘           │
│                                                                      │
│  Evento: recup_prestamo.notificacion                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Payload del Webhook

El backend envía el siguiente payload cuando cambia el estado de un préstamo:

```json
{
  "prestamoId": 1,
  "recup_codigo": "PRE-001",
  "estadoAnterior": "SOLICITADO",
  "estadoNuevo": "APROBADO",
  "lector": {
    "recup_nombreCompleto": "Juan Pérez",
    "recup_email": "juan@example.com",
    "recup_telefono": "5555-1234"
  },
  "libro": {
    "recup_titulo": "Clean Code",
    "recup_autor": "Robert C. Martin"
  },
  "recup_fechaPrestamo": "2026-02-01",
  "recup_fechaDevolucion": "2026-02-15",
  "fechaCambio": "2026-02-02T10:30:00.000Z"
}
```

## Estados Soportados

| Estado | Emoji | Descripción |
|--------|-------|-------------|
| SOLICITADO | 📝 | Préstamo solicitado |
| APROBADO | ✅ | Préstamo aprobado |
| ENTREGADO | 📚 | Libro entregado |
| DEVUELTO | 🔄 | Libro devuelto |
| VENCIDO | ⚠️ | Préstamo vencido |

## Prueba Manual

Puedes probar el webhook con curl:

```bash
curl -X POST http://localhost:5678/webhook/recup_prestamo.notificacion \
  -H "Content-Type: application/json" \
  -d '{
    "prestamoId": 1,
    "recup_codigo": "PRE-001",
    "estadoAnterior": "SOLICITADO",
    "estadoNuevo": "APROBADO",
    "lector": {
      "recup_nombreCompleto": "Juan Pérez",
      "recup_email": "juan@example.com",
      "recup_telefono": "5555-1234"
    },
    "libro": {
      "recup_titulo": "Clean Code",
      "recup_autor": "Robert C. Martin"
    },
    "recup_fechaPrestamo": "2026-02-01",
    "recup_fechaDevolucion": "2026-02-15",
    "fechaCambio": "2026-02-02T10:30:00.000Z"
  }'
```

## Troubleshooting

### El webhook no responde
- Verificar que n8n está corriendo: `docker ps`
- Verificar que el workflow está activo

### No llegan mensajes a Telegram
- Verificar las credenciales del bot
- Verificar que el Chat ID es correcto
- Revisar los logs de n8n: `docker logs n8n-recup-prestamos`

### Error de conexión desde el backend
- Verificar la variable `N8N_WEBHOOK_URL`
- Si usas Docker, usar `host.docker.internal` en lugar de `localhost`
