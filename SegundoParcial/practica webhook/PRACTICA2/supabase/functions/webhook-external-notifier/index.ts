import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") || "webhook_secret_notifier_key_123456";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const DEFAULT_EMAIL = Deno.env.get("DEFAULT_EMAIL") || "admin@example.com";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Estados del Circuit Breaker
enum CircuitBreakerState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

interface CircuitBreakerStatus {
  state: CircuitBreakerState;
  failureCount: number;
  lastFailureAt?: string;
  openedAt?: string;
}

/**
 * Obtiene o crea el estado del Circuit Breaker para un endpoint
 */
async function getCircuitBreakerStatus(
  endpoint: string
): Promise<CircuitBreakerStatus> {
  const { data, error } = await supabase
    .from("circuit_breaker_state")
    .select("*")
    .eq("endpoint_url", endpoint)
    .single();

  if (error || !data) {
    // Crear nuevo registro
    await supabase.from("circuit_breaker_state").insert([
      {
        endpoint_url: endpoint,
        state: CircuitBreakerState.CLOSED,
        failure_count: 0,
      },
    ]);

    return {
      state: CircuitBreakerState.CLOSED,
      failureCount: 0,
    };
  }

  return {
    state: data.state as CircuitBreakerState,
    failureCount: data.failure_count,
    lastFailureAt: data.last_failure_at,
    openedAt: data.opened_at,
  };
}

/**
 * Actualiza el estado del Circuit Breaker
 */
async function updateCircuitBreakerStatus(
  endpoint: string,
  state: CircuitBreakerState,
  failureCount: number
) {
  const updateData: any = {
    state,
    failure_count: failureCount,
    last_checked_at: new Date().toISOString(),
  };

  if (state === CircuitBreakerState.OPEN) {
    updateData.opened_at = new Date().toISOString();
  } else if (state === CircuitBreakerState.CLOSED) {
    updateData.opened_at = null;
    updateData.failure_count = 0;
  }

  await supabase
    .from("circuit_breaker_state")
    .update(updateData)
    .eq("endpoint_url", endpoint);
}

/**
 * Valida la firma HMAC
 */
async function validateSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const receivedHash = signature.replace("sha256=", "");
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
  const expectedHash = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return timingSafeEqual(receivedHash, expectedHash);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Envía email usando Resend API
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY no configurado, simulando envío de email");
    return true;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "notifications@example.com",
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email API error: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Error enviando email:", error);
    throw error;
  }
}

/**
 * Guarda registro de notificación
 */
async function saveNotification(
  eventId: string,
  email: string,
  subject: string,
  content: string,
  status: string,
  error?: string
) {
  await supabase.from("webhook_notifications").insert([
    {
      event_id: eventId,
      recipient_email: email,
      subject,
      message_content: content,
      delivery_status: status,
      sent_at: status === "sent" ? new Date().toISOString() : null,
      error_message: error || null,
    },
  ]);
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("X-Webhook-Signature");
    const correlationId = req.headers.get("X-Correlation-Id") || "unknown";

    console.log(`📧 [${correlationId}] Webhook de notificación recibido`);

    // Validar firma
    if (
      !signature ||
      !(await validateSignature(body, signature, WEBHOOK_SECRET))
    ) {
      console.error(`❌ [${correlationId}] Firma HMAC inválida`);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(body);
    const emailEndpoint = "https://api.resend.com/emails";

    // Obtener estado del Circuit Breaker
    const cbStatus = await getCircuitBreakerStatus(emailEndpoint);

    // Si está OPEN, rechazar
    if (cbStatus.state === CircuitBreakerState.OPEN) {
      console.warn(
        `🔴 [${correlationId}] Circuit Breaker OPEN - Email service no disponible`
      );

      await saveNotification(
        payload.id,
        DEFAULT_EMAIL,
        `Notification Failed: ${payload.event}`,
        JSON.stringify(payload, null, 2),
        "failed",
        "Circuit Breaker OPEN - Service unavailable"
      );

      return new Response(
        JSON.stringify({
          error: "Email service temporarily unavailable (Circuit Breaker OPEN)",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    // Preparar email
    const subject = `Notificación: ${payload.event}`;
    const html = `
      <h2>Evento: ${payload.event}</h2>
      <p><strong>ID:</strong> ${payload.id}</p>
      <p><strong>Timestamp:</strong> ${payload.timestamp}</p>
      <h3>Datos del Evento:</h3>
      <pre>${JSON.stringify(payload.data, null, 2)}</pre>
      <hr>
      <p><small>Correlation ID: ${payload.metadata.correlation_id}</small></p>
    `;

    try {
      // Intentar enviar email
      const emailSent = await sendEmail(DEFAULT_EMAIL, subject, html);

      if (emailSent) {
        console.log(
          `✅ [${correlationId}] Email enviado exitosamente`
        );

        // Registrar éxito
        if (cbStatus.state === CircuitBreakerState.HALF_OPEN) {
          await updateCircuitBreakerStatus(
            emailEndpoint,
            CircuitBreakerState.CLOSED,
            0
          );
          console.log(`✅ [${correlationId}] Circuit Breaker volvió a CLOSED`);
        }

        await saveNotification(
          payload.id,
          DEFAULT_EMAIL,
          subject,
          payload.data,
          "sent"
        );

        return new Response(
          JSON.stringify({
            status: "success",
            message: "Email sent successfully",
            event_id: payload.id,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (error) {
      console.error(`❌ [${correlationId}] Error enviando email:`, error);

      // Incrementar contador de fallos
      const newFailureCount = cbStatus.failureCount + 1;

      if (newFailureCount >= 5) {
        // Abrir Circuit Breaker después de 5 fallos
        await updateCircuitBreakerStatus(
          emailEndpoint,
          CircuitBreakerState.OPEN,
          newFailureCount
        );
        console.error(
          `🔴 [${correlationId}] Circuit Breaker ABIERTO - 5 fallos consecutivos`
        );
      } else {
        // Pasar a HALF_OPEN para probar recuperación
        const newState =
          newFailureCount >= 3
            ? CircuitBreakerState.HALF_OPEN
            : CircuitBreakerState.CLOSED;
        await updateCircuitBreakerStatus(
          emailEndpoint,
          newState,
          newFailureCount
        );
      }

      await saveNotification(
        payload.id,
        DEFAULT_EMAIL,
        subject,
        payload.data,
        "failed",
        error.message
      );

      return new Response(
        JSON.stringify({
          error: "Failed to send email",
          details: error.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("❌ Error procesando webhook:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
