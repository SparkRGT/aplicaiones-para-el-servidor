import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

// Firmar body crudo
async function generarFirmaRaw(raw: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const data = encoder.encode(raw);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  // 1️⃣ Validar firma
  const signatureHeader = req.headers.get('x-signature');
  if (!signatureHeader) {
    return new Response('Missing signature', { status: 401 });
  }

  // 2️⃣ Leer body crudo
  const rawBody = await req.text();
  const payload = JSON.parse(rawBody);

  const secret = Deno.env.get('WEBHOOK_SECRET');
  if (!secret) {
    return new Response('Missing WEBHOOK_SECRET', { status: 500 });
  }

  const expectedSignature = await generarFirmaRaw(rawBody, secret);

  if (signatureHeader !== expectedSignature) {
    return new Response('Invalid signature', { status: 401 });
  }

  // 3️⃣ Variables de entorno Telegram
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

  if (!token || !chatId) {
    return new Response('Telegram config missing', { status: 500 });
  }

  // 4️⃣ Construir mensaje
  let mensaje = '📢 *Evento recibido*';

  if (payload.event === 'servicio_creado') {
    mensaje = `
🆕 *Nuevo Servicio Creado*
📌 ID: ${payload.data.servicio_id}
📝 Nombre: ${payload.data.nombre_servicio}
⏱ Duración: ${payload.data.duracion} minutos
    `;
  }

  if (payload.event === 'comentario_creado') {
    mensaje = `
💬 *Nuevo Comentario*
📌 Servicio ID: ${payload.data.servicio_id}
🧑 Cliente ID: ${payload.data.cliente_id}
📝 ${payload.data.texto}
    `;
  }

  // 5️⃣ Enviar mensaje a Telegram
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: mensaje,
      parse_mode: 'Markdown',
    }),
  });

  return new Response('Notificación enviada a Telegram', { status: 200 });
});
