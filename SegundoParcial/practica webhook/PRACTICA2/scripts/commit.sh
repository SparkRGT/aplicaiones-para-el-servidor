#!/bin/bash

# ============================================================================
# SCRIPT DE COMMIT - Guardar todo en Git
# ============================================================================

echo "🚀 Preparando commit de la práctica..."
echo ""

# Agregar archivos
git add -A

echo "📝 Archivos a commitear:"
git diff --cached --name-status | head -20
echo ""

# Mensaje de commit
COMMIT_MESSAGE="feat: Implementar Event-Driven Architecture con Circuit Breaker

- Agregar Webhook Publisher Service con retry exponential backoff
- Implementar Circuit Breaker Pattern (CLOSED/OPEN/HALF_OPEN)
- Crear Edge Functions en Supabase (logger + notifier)
- Agregar validación HMAC-SHA256 para webhooks
- Implementar idempotencia con deduplicación
- Crear esquema PostgreSQL con auditoría completa
- Integrar webhooks con microservicios A y B
- Documentación completa y scripts de prueba"

echo "📦 Haciendo commit..."
git commit -m "$COMMIT_MESSAGE"

echo ""
echo "✅ Commit realizado exitosamente!"
echo ""

# Mostrar estado
git log --oneline -5
echo ""

# Instrucciones para push
echo "📤 Para subir a GitHub:"
echo "   git push origin main"
echo ""

echo "🎉 ¡Listo para presentar!"
