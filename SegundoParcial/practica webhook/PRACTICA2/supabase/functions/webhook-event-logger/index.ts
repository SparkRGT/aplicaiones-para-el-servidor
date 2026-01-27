import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") || "webhook_secret_logger_key_123456";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Valida la firma HMAC-SHA256 del webhook
 */
async function validateSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  // Extraer hash de la firma (formato: sha256=hex)
  const receivedHash = signature.replace("sha256=", "");

  // Calcular hash esperado
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(body);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", key, messageData);

  // Convertir a hex
  const expectedHash = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Comparar de forma segura
  return timingSafeEqual(receivedHash, expectedHash);
}

/**
 * Comparación segura para evitar timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Valida timestamp (anti-replay attack)
 */
function validateTimestamp(timestamp: string, maxAgeSeconds: number = 300): boolean {
  const now = Math.floor(Date.now() / 1000);
  const requestTime = parseInt(timestamp);
  const age = now - requestTime;

  // Verificar que no sea muy antiguo (anti-replay)
  if (age > maxAgeSeconds) return false;

  // Verificar que no sea del futuro (clock skew)
  if (age < -60) return false;

  return true;
}

/**
 * Verifica idempotencia con PostgreSQL
 */
async function checkIdempotency(idempotencyKey: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("processed_webhooks")
    .select("id")
    .eq("idempotency_key", idempotencyKey)
    .single();

  // Si existe, es un duplicado
  return !error;
}

/**
 * Guarda el evento en la base de datos
 */
async function saveWebhookEvent(payload: any) {
  const { data, error } = await supabase.from("webhook_events").insert([
    {
      event_id: payload.id,
      event_type: payload.event,
      idempotency_key: payload.idempotency_key,
      payload: payload,
      metadata: payload.metadata,
      received_at: new Date().toISOString(),
      processed_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error("Error saving webhook event:", error);
    throw error;
  }

  // Registrar en processed_webhooks para idempotencia
  await supabase.from("processed_webhooks").insert([
    {
      idempotency_key: payload.idempotency_key,
      event_id: payload.id,
      processed_at: new Date().toISOString(),
    },
  ]);

  return data;
}

serve(async (req: Request) => {
  // Solo permitir POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("X-Webhook-Signature");
    const timestamp = req.headers.get("X-Webhook-Timestamp");
    const correlationId = req.headers.get("X-Correlation-Id") || "unknown";

    console.log(`📥 [${correlationId}] Webhook recibido`);

    // 1. Validar firma HMAC
    if (!signature || !await validateSignature(body, signature, WEBHOOK_SECRET)) {
      console.error(`❌ [${correlationId}] Firma HMAC inválida`);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`✅ [${correlationId}] Firma HMAC validada`);

    // 2. Validar timestamp (anti-replay)
    if (!timestamp || !validateTimestamp(timestamp)) {
      console.error(`⚠️ [${correlationId}] Timestamp inválido o antiguo`);
      return new Response(JSON.stringify({ error: "Invalid or expired timestamp" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`✅ [${correlationId}] Timestamp validado`);

    // 3. Parsear payload
    const payload = JSON.parse(body);

    // 4. Verificar idempotencia
    const isDuplicate = await checkIdempotency(payload.idempotency_key);
    if (isDuplicate) {
      console.warn(`⚠️ [${correlationId}] Webhook duplicado detectado`);
      return new Response(
        JSON.stringify({
          duplicate: true,
          message: "Webhook already processed",
          event_id: payload.id,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(`✅ [${correlationId}] Idempotencia verificada`);

    // 5. Guardar evento
    await saveWebhookEvent(payload);

    console.log(`✅ [${correlationId}] Evento guardado en base de datos`);

    // 6. Retornar respuesta exitosa
    return new Response(
      JSON.stringify({
        status: "success",
        event_id: payload.id,
        message: "Webhook processed successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
