-- Base de datos para Webhooks Registry y Circuit Breaker

-- Tabla de suscripciones de webhooks
CREATE TABLE IF NOT EXISTS webhook_subscriptions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    secret VARCHAR(255) NOT NULL,
    event_types TEXT[] NOT NULL,
    active BOOLEAN DEFAULT true,
    retry_config JSONB DEFAULT '{"maxAttempts": 6, "delays": [60000, 300000, 1800000, 7200000, 43200000]}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_subscriptions_active ON webhook_subscriptions(active);
CREATE INDEX idx_webhook_subscriptions_event_types ON webhook_subscriptions USING GIN(event_types);

-- Tabla de auditoría de entregas de webhooks
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER REFERENCES webhook_subscriptions(id),
    event_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'pending', 'success', 'failed', 'retrying'
    attempt_number INTEGER DEFAULT 1,
    http_status_code INTEGER,
    response_body TEXT,
    error_message TEXT,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_deliveries_subscription_id ON webhook_deliveries(subscription_id);
CREATE INDEX idx_webhook_deliveries_event_id ON webhook_deliveries(event_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_created_at ON webhook_deliveries(created_at);

-- Tabla para control de idempotencia de webhooks procesados
CREATE TABLE IF NOT EXISTS processed_webhooks (
    id SERIAL PRIMARY KEY,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    event_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edge_function VARCHAR(100) NOT NULL -- 'event-logger' o 'external-notifier'
);

CREATE INDEX idx_processed_webhooks_idempotency_key ON processed_webhooks(idempotency_key);
CREATE INDEX idx_processed_webhooks_event_id ON processed_webhooks(event_id);
CREATE INDEX idx_processed_webhooks_edge_function ON processed_webhooks(edge_function);

-- Tabla de eventos recibidos en Edge Function 1 (Event Logger)
CREATE TABLE IF NOT EXISTS webhook_events (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    source VARCHAR(100) NOT NULL, -- 'microservicio-a' o 'microservicio-b'
    payload JSONB NOT NULL,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    correlation_id VARCHAR(255)
);

CREATE INDEX idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_source ON webhook_events(source);
CREATE INDEX idx_webhook_events_received_at ON webhook_events(received_at);
CREATE INDEX idx_webhook_events_correlation_id ON webhook_events(correlation_id);

-- Tabla de estado del Circuit Breaker
CREATE TABLE IF NOT EXISTS circuit_breaker_state (
    id SERIAL PRIMARY KEY,
    circuit_key VARCHAR(255) UNIQUE NOT NULL, -- URL del endpoint protegido
    state VARCHAR(20) NOT NULL DEFAULT 'CLOSED', -- 'CLOSED', 'OPEN', 'HALF_OPEN'
    failure_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    last_failure_time TIMESTAMP,
    opened_at TIMESTAMP,
    last_state_change TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_circuit_breaker_state_circuit_key ON circuit_breaker_state(circuit_key);
CREATE INDEX idx_circuit_breaker_state_state ON circuit_breaker_state(state);

-- Insertar suscripciones por defecto para Edge Functions
-- NOTA: Actualizar las URLs con las URLs reales de tus Edge Functions de Supabase
-- Ejemplo:
-- INSERT INTO webhook_subscriptions (name, url, secret, event_types, active)
-- VALUES 
--     ('Event Logger', 'https://tu-proyecto.supabase.co/functions/v1/event-logger', 'edge_function_1_secret_key', ARRAY['producto.*', 'orden.*'], true),
--     ('External Notifier', 'https://tu-proyecto.supabase.co/functions/v1/external-notifier', 'edge_function_2_secret_key', ARRAY['producto.*', 'orden.*'], true)
-- ON CONFLICT DO NOTHING;

