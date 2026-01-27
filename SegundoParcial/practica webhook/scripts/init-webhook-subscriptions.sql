-- Script para inicializar suscripciones de webhooks
-- Ejecutar después de desplegar las Edge Functions en Supabase
-- Reemplazar las URLs con las URLs reales de tus Edge Functions

-- Eliminar suscripciones existentes si es necesario (opcional)
-- DELETE FROM webhook_subscriptions WHERE name IN ('Event Logger', 'External Notifier');

-- Insertar suscripciones para Edge Functions
INSERT INTO webhook_subscriptions (name, url, secret, event_types, active, retry_config)
VALUES 
    (
        'Event Logger',
        'https://TU-PROYECTO.supabase.co/functions/v1/event-logger',
        'edge_function_1_secret_key',
        ARRAY['producto.*', 'orden.*'],
        true,
        '{"maxAttempts": 6, "delays": [60000, 300000, 1800000, 7200000, 43200000]}'::jsonb
    ),
    (
        'External Notifier',
        'https://TU-PROYECTO.supabase.co/functions/v1/external-notifier',
        'edge_function_2_secret_key',
        ARRAY['producto.*', 'orden.*'],
        true,
        '{"maxAttempts": 6, "delays": [60000, 300000, 1800000, 7200000, 43200000]}'::jsonb
    )
ON CONFLICT DO NOTHING;

-- Verificar que se insertaron correctamente
SELECT id, name, url, active FROM webhook_subscriptions;

