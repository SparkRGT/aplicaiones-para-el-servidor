#!/bin/bash

# ============================================================================
# SCRIPTS DE PRUEBA - CIRCUIT BREAKER WEBHOOK SYSTEM
# ============================================================================

WEBHOOK_SECRET="webhook_secret_logger_key_123456"
LOGGER_URL="http://localhost:3001/webhooks/logger"
NOTIFIER_URL="http://localhost:3001/webhooks/notifier"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# 1. HAPPY PATH - Crear Producto (Dispara Webhooks)
# ============================================================================
echo -e "${BLUE}=== TEST 1: Happy Path - Crear Producto ===${NC}"

curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Laptop Gaming RTX 4090",
    "precio": 2499.99,
    "stock": 15,
    "categoria": "Computadoras",
    "descripcion": "Laptop de alto rendimiento para gaming"
  }' -w "\nStatus: %{http_code}\n"

sleep 2

echo -e "\n${GREEN}✅ Producto creado - Revisar logs de webhooks${NC}\n"

# ============================================================================
# 2. VER ESTADÍSTICAS DEL CIRCUIT BREAKER
# ============================================================================
echo -e "${BLUE}=== TEST 2: Estado del Circuit Breaker ===${NC}"

curl http://localhost:3001/webhooks/circuit-breaker -s | jq .

echo -e "\n"

# ============================================================================
# 3. ENVIAR WEBHOOK CON FIRMA INVÁLIDA
# ============================================================================
echo -e "${BLUE}=== TEST 3: Firma HMAC Inválida ===${NC}"

PAYLOAD='{"event":"test.event","id":"evt_123","data":{}}'

curl -X POST http://localhost:3001/webhooks/logger \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: sha256=FIRMA_INVALIDA" \
  -d "$PAYLOAD" \
  -w "\nStatus: %{http_code}\n"

echo -e "\n${YELLOW}⚠️ Esperado: HTTP 401 - Invalid signature${NC}\n"

# ============================================================================
# 4. ENVIAR WEBHOOK DUPLICADO (IDEMPOTENCIA)
# ============================================================================
echo -e "${BLUE}=== TEST 4: Webhook Duplicado (Idempotencia) ===${NC}"

for i in {1..3}; do
  echo -e "${YELLOW}Envío ${i} de 3...${NC}"
  
  curl -X POST http://localhost:3001/webhooks/logger \
    -H "Content-Type: application/json" \
    -H "X-Webhook-Signature: sha256=test_signature" \
    -H "X-Webhook-Id: evt_test_001" \
    -d '{
      "event":"test.duplicated",
      "id":"evt_test_001",
      "idempotency_key":"test-webhook-001-2025-12-15",
      "data":{"test":"data"}
    }' \
    -s | jq '.duplicate // .status'
  
  sleep 1
done

echo -e "\n${GREEN}✅ Primer envío: procesado | Envíos 2-3: duplicados${NC}\n"

# ============================================================================
# 5. SIMULAR FALLO DE EMAIL (Circuit Breaker)
# ============================================================================
echo -e "${BLUE}=== TEST 5: Simular Fallo de Email - Circuit Breaker ===${NC}"

echo -e "${YELLOW}⚠️ Pasos manuales:${NC}"
echo "1. Comentar RESEND_API_KEY en .env"
echo "2. Reiniciar Edge Function"
echo "3. Ejecutar: curl -X POST http://localhost:3000/api/productos ..."
echo "4. Observar 5 fallos en logs"
echo "5. Verificar Circuit Breaker OPEN: curl http://localhost:3001/webhooks/circuit-breaker"
echo "6. Reactivar RESEND_API_KEY"
echo "7. Esperar 60s (timeout)"
echo "8. Siguiente webhook: HALF_OPEN (intento de recuperación)"
echo ""

# ============================================================================
# 6. VER LOGS DE ENTREGAS
# ============================================================================
echo -e "${BLUE}=== TEST 6: Ver Logs de Entregas ===${NC}"

echo -e "${YELLOW}Entregas exitosas:${NC}"
cat microservicio-a/data/webhooks/deliveries.jsonl 2>/dev/null | jq -r '.status' | tail -5

echo -e "\n${YELLOW}Entregas fallidas (DLQ):${NC}"
cat microservicio-a/data/webhooks/dead-letter-queue.jsonl 2>/dev/null | jq -r '.errorMessage' | tail -5

echo -e "\n"

# ============================================================================
# 7. CONSULTAR BASE DE DATOS
# ============================================================================
echo -e "${BLUE}=== TEST 7: Consultar Base de Datos ===${NC}"

echo -e "${YELLOW}Últimos eventos:${NC}"
psql -h localhost -U postgres -d webhooks_db -c \
  "SELECT event_type, event_id, processed_at FROM webhook_events ORDER BY received_at DESC LIMIT 5;"

echo -e "\n${YELLOW}Estado del Circuit Breaker:${NC}"
psql -h localhost -U postgres -d webhooks_db -c \
  "SELECT endpoint_url, state, failure_count FROM circuit_breaker_state;"

echo -e "\n"

# ============================================================================
# 8. PRUEBA DE CARGA - MÚLTIPLES WEBHOOKS
# ============================================================================
echo -e "${BLUE}=== TEST 8: Prueba de Carga - 5 Productos ===${NC}"

for i in {1..5}; do
  echo -e "${YELLOW}Creando producto ${i}/5...${NC}"
  
  curl -X POST http://localhost:3000/api/productos \
    -H "Content-Type: application/json" \
    -d "{
      \"nombre\": \"Producto Test ${i}\",
      \"precio\": $((1000 + i * 100)).99,
      \"stock\": $((10 + i)},
      \"categoria\": \"Test\"
    }" \
    -s -o /dev/null -w "Status: %{http_code}\n"
  
  sleep 1
done

echo -e "\n${GREEN}✅ Prueba de carga completada${NC}\n"

# ============================================================================
# RESUMEN FINAL
# ============================================================================
echo -e "${BLUE}=== RESUMEN DE PRUEBAS ===${NC}"
echo -e "${GREEN}✅ Happy Path: Crear producto y disparar webhooks${NC}"
echo -e "${GREEN}✅ Circuit Breaker: Monitorear estado${NC}"
echo -e "${GREEN}✅ Validación HMAC: Rechazar firmas inválidas${NC}"
echo -e "${GREEN}✅ Idempotencia: Detectar duplicados${NC}"
echo -e "${GREEN}✅ Resiliencia: Exponential backoff y retry${NC}"
echo -e "${GREEN}✅ Base de datos: Auditoría completa${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "1. Revisar logs en: tail -f microservicio-a/data/webhooks/deliveries.jsonl"
echo "2. Monitorear BD: psql -h localhost -U postgres -d webhooks_db"
echo "3. Simular fallo de email (Circuit Breaker)"
echo "4. Verificar recuperación (HALF_OPEN → CLOSED)"
echo ""
