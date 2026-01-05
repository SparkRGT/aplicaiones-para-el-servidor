import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Generar firma HMAC usando BODY CRUDO
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
  // 1️⃣ Leer firma
  const signatureHeader = req.headers.get('x-signature');
  if (!signatureHeader) {
    return new Response('Missing signature', { status: 401 });
  }

  // 2️⃣ Leer BODY CRUDO
  const rawBody = await req.text();
  const payload = JSON.parse(rawBody);

  // 3️⃣ Recalcular firma
  const secret = Deno.env.get('WEBHOOK_SECRET');
  if (!secret) {
    return new Response('Missing WEBHOOK_SECRET', { status: 500 });
  }

  const expectedSignature = await generarFirmaRaw(rawBody, secret);

  // 4️⃣ Comparar firmas
  if (signatureHeader !== expectedSignature) {
    console.log('Firma inválida');
    return new Response('Invalid signature', { status: 401 });
  }

  // 5️⃣ Conectar a Supabase
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // 6️⃣ Idempotencia
  const { data: existing } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('idempotency_key', payload.idempotency_key)
    .maybeSingle();

  if (existing) {
    return new Response('Duplicate event ignored', { status: 200 });
  }

  // 7️⃣ Guardar evento
  await supabase.from('webhook_events').insert({
    id: crypto.randomUUID(),
    event: payload.event,
    idempotency_key: payload.idempotency_key,
    payload,
  });

  return new Response('Event processed', { status: 200 });
});
