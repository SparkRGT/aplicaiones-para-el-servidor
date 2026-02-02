# Pillar 5 - n8n Workflow Automation

## Descripción
Este pilar implementa la automatización de notificaciones usando n8n. Cuando el estado de un préstamo cambia en el backend (Pillar 1), se envía un webhook a n8n que:
1. Valida el evento recibido
2. Llama a Gemini para generar un mensaje amigable
3. Envía la notificación a Telegram

## Nomenclatura Oficial
| Componente | Nombre Exacto |
|------------|---------------|
| Workflow n8n | `recup-flujo-prestamos` |
| Evento Webhook | `recup_prestamo.notificacion` |
| Evento RabbitMQ | `recup_prestamo.estado-cambiado` |

## Arquitectura del Flujo

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Backend       │────▶│   Webhook       │────▶│   IF Validate   │────▶│   HTTP Request  │
│   (Pillar 1)    │     │   Trigger       │     │   Event         │     │   Gemini        │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │                        │
                                                        ▼                        ▼
                                                ┌─────────────────┐     ┌─────────────────┐
                                                │   Respond       │     │   Telegram      │
                                                │   Invalid       │     │   Send Message  │
                                                └─────────────────┘     └─────────────────┘
```

## Cadena de Nodos (Obligatoria)
1. **Webhook Trigger** - Recibe POST en `/webhook/recup_prestamo.notificacion`
2. **IF Validate Event** - Valida que el evento sea `recup_prestamo.estado-cambiado`
3. **HTTP Request Gemini** - Genera mensaje amigable con IA
4. **Telegram** - Envía notificación al chat configurado

## Estructura del Payload (Webhook)

```json
{
  "evento": "recup_prestamo.estado-cambiado",
  "prestamoId": 1,
  "recup_codigo": "PRE-001",
  "estadoAnterior": "SOLICITADO",
  "estadoNuevo": "APROBADO",
  "fechaCambio": "2026-02-02T10:30:00.000Z",
  "lector": {
    "lectorId": 1,
    "recup_nombreCompleto": "Juan Pérez",
    "recup_email": "juan@email.com",
    "recup_tipoLector": "ESTUDIANTE"
  },
  "libro": {
    "libroId": 1,
    "recup_titulo": "Clean Code",
    "recup_autor": "Robert C. Martin",
    "recup_isbn": "978-0132350884"
  }
}
```

## Instalación y Configuración

### 1. Iniciar n8n con Docker
```bash
cd pillar5-n8n
docker-compose up -d
```

### 2. Acceder a n8n
Abrir navegador en: http://localhost:5678

### 3. Importar Workflow
1. En n8n, ir a **Settings** > **Import from file**
2. Seleccionar `workflows/recup-flujo-prestamos.json`
3. Activar el workflow

### 4. Configurar Credenciales

#### Variables de Entorno (en n8n)
- `GEMINI_API_KEY`: Tu API key de Google Gemini
- `TELEGRAM_CHAT_ID`: ID del chat de Telegram

#### Credenciales de Telegram
1. Crear bot con @BotFather en Telegram
2. Obtener el token del bot
3. En n8n: **Credentials** > **New** > **Telegram API**
4. Ingresar el token del bot

### 5. Configurar Backend (Pillar 1)
Asegurarse que el archivo `.env` del backend tenga:
```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook/recup_prestamo.notificacion
```

## Probar el Flujo

### Opción 1: Desde Postman
```http
PATCH http://localhost:3000/recup-prestamos/1
Content-Type: application/json

{
  "recup_estado": "APROBADO"
}
```

### Opción 2: Webhook directo a n8n
```bash
curl -X POST http://localhost:5678/webhook/recup_prestamo.notificacion \
  -H "Content-Type: application/json" \
  -d '{
    "evento": "recup_prestamo.estado-cambiado",
    "prestamoId": 1,
    "recup_codigo": "PRE-001",
    "estadoAnterior": "SOLICITADO",
    "estadoNuevo": "APROBADO",
    "fechaCambio": "2026-02-02T10:30:00.000Z",
    "lector": {
      "lectorId": 1,
      "recup_nombreCompleto": "Juan Pérez",
      "recup_email": "juan@email.com",
      "recup_tipoLector": "ESTUDIANTE"
    },
    "libro": {
      "libroId": 1,
      "recup_titulo": "Clean Code",
      "recup_autor": "Robert C. Martin",
      "recup_isbn": "978-0132350884"
    }
  }'
```

## Estados Válidos del Préstamo
- `SOLICITADO`
- `APROBADO`
- `ENTREGADO`
- `DEVUELTO`
- `VENCIDO`

## Archivos del Pilar

```
pillar5-n8n/
├── docker-compose.yml          # Configuración Docker para n8n
├── .env.example                 # Variables de entorno de ejemplo
├── README.md                    # Este archivo
└── workflows/
    └── recup-flujo-prestamos.json  # Workflow exportado de n8n
```

## Evidencia Requerida
- [ ] Workflow visible en n8n UI con nombre `recup-flujo-prestamos`
- [ ] JSON exportado: `recup-flujo-prestamos.json`
- [ ] Screenshot de Telegram recibiendo mensaje
- [ ] Demostración del flujo completo: Backend → n8n → Gemini → Telegram

## Troubleshooting

### El webhook no responde
- Verificar que n8n esté corriendo: `docker ps`
- Verificar URL: `http://localhost:5678/webhook/recup_prestamo.notificacion`
- Revisar logs: `docker logs recup-n8n`

### Gemini no genera mensaje
- Verificar que `GEMINI_API_KEY` esté configurada
- Probar la API key directamente con curl

### Telegram no envía mensaje
- Verificar credenciales del bot
- Verificar `TELEGRAM_CHAT_ID`
- El bot debe estar agregado al chat/grupo
