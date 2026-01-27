-- ============================================================================
-- WEBHOOK EVENT-DRIVEN ARCHITECTURE - DATABASE SCHEMA
-- ============================================================================
-- Tablas para gestionar webhooks, auditoría, resiliencia y Circuit Breaker

-- Tabla: webhook_subscriptions
-- Gestiona suscripciones a eventos y configuración de reintentos
CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  url VARCHAR(500) NOT NULL,
  secret VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  retry_config JSONB DEFAULT '{
    "max_attempts": 6,
    "backoff_type": "exponential",
    "initial_delay_ms": 60000
  }'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_triggered_at TIMESTAMP,
  CONSTRAINT unique_event_url UNIQUE(event_type, url)
);

-- Tabla: webhook_events
-- Registro de todos los eventos recibidos por Edge Functions
CREATE TABLE IF NOT EXISTS webhook_events (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  idempotency_key VARCHAR(255) UNIQUE NOT NULL,
  payload JSONB NOT NULL,
  metadata JSONB,
  received_at TIMESTAMP NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: webhook_deliveries
-- Auditoría completa de todos los intentos de entrega
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id SERIAL PRIMARY KEY,
  subscription_id INTEGER REFERENCES webhook_subscriptions(id),
  event_id VARCHAR(255) REFERENCES webhook_events(event_id),
  attempt_number INTEGER NOT NULL,
  status_code INTEGER,
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'pending', 'circuit_breaker')),
  error_message TEXT,
  delivered_at TIMESTAMP NOT NULL DEFAULT NOW(),
  duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: processed_webhooks
-- Control de idempotencia (deduplicación)
CREATE TABLE IF NOT EXISTS processed_webhooks (
  id SERIAL PRIMARY KEY,
  idempotency_key VARCHAR(255) UNIQUE NOT NULL,
  event_id INTEGER REFERENCES webhook_events(id),
  processed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: circuit_breaker_state
-- Estado del Circuit Breaker para cada endpoint externo
CREATE TABLE IF NOT EXISTS circuit_breaker_state (
  id SERIAL PRIMARY KEY,
  endpoint_url VARCHAR(500) NOT NULL UNIQUE,
  state VARCHAR(20) NOT NULL DEFAULT 'CLOSED' CHECK (state IN ('CLOSED', 'OPEN', 'HALF_OPEN')),
  failure_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  last_failure_at TIMESTAMP,
  last_success_at TIMESTAMP,
  opened_at TIMESTAMP,
  last_checked_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: webhook_failures
-- Dead Letter Queue - webhooks fallidos después de reintentos
CREATE TABLE IF NOT EXISTS webhook_failures (
  id SERIAL PRIMARY KEY,
  subscription_id INTEGER REFERENCES webhook_subscriptions(id),
  event_id VARCHAR(255) REFERENCES webhook_events(event_id),
  payload JSONB NOT NULL,
  error_message TEXT,
  last_error_code INTEGER,
  attempt_count INTEGER DEFAULT 0,
  retry_reason VARCHAR(100),
  failed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'replayed', 'manual_intervention'))
);

-- Tabla: webhook_notifications
-- Registro de notificaciones enviadas por email
CREATE TABLE IF NOT EXISTS webhook_notifications (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(255) REFERENCES webhook_events(event_id),
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  message_content TEXT NOT NULL,
  delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed', 'bounced')),
  sent_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_idempotency_key ON webhook_events(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_delivered_at ON webhook_deliveries(delivered_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_subscription_status ON webhook_deliveries(subscription_id, status);
CREATE INDEX IF NOT EXISTS idx_processed_webhooks_idempotency_key ON processed_webhooks(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_circuit_breaker_state_endpoint ON circuit_breaker_state(endpoint_url);
CREATE INDEX IF NOT EXISTS idx_webhook_failures_status ON webhook_failures(status);
CREATE INDEX IF NOT EXISTS idx_webhook_notifications_status ON webhook_notifications(delivery_status);

-- FUNCIÓN PARA LIMPIAR CLAVES EXPIRADAS DE IDEMPOTENCIA
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS void AS $$
BEGIN
  DELETE FROM processed_webhooks WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DATOS INICIALES
-- ============================================================================

-- Suscripción para Edge Function de logging (webhook-event-logger)
INSERT INTO webhook_subscriptions (event_type, url, secret, is_active)
VALUES (
  'producto.creado',
  'https://YOUR_PROJECT.supabase.co/functions/v1/webhook-event-logger',
  'webhook_secret_logger_key_123456',
  true
)
ON CONFLICT (event_type, url) DO NOTHING;

INSERT INTO webhook_subscriptions (event_type, url, secret, is_active)
VALUES (
  'orden.procesada',
  'https://YOUR_PROJECT.supabase.co/functions/v1/webhook-event-logger',
  'webhook_secret_logger_key_123456',
  true
)
ON CONFLICT (event_type, url) DO NOTHING;

-- Suscripción para Edge Function de notificaciones (webhook-external-notifier)
INSERT INTO webhook_subscriptions (event_type, url, secret, is_active)
VALUES (
  'producto.creado',
  'https://YOUR_PROJECT.supabase.co/functions/v1/webhook-external-notifier',
  'webhook_secret_notifier_key_123456',
  true
)
ON CONFLICT (event_type, url) DO NOTHING;

INSERT INTO webhook_subscriptions (event_type, url, secret, is_active)
VALUES (
  'orden.procesada',
  'https://YOUR_PROJECT.supabase.co/functions/v1/webhook-external-notifier',
  'webhook_secret_notifier_key_123456',
  true
)
ON CONFLICT (event_type, url) DO NOTHING;
