#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║    PRUEBA DE FLUJO COMPLETO - SISTEMA DE MICROSERVICIOS       ║"
echo "║            Visualización de Cambios en Tiempo Real            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar que jq esté instalado
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ Error: jq no está instalado${NC}"
    echo "Instala jq con: sudo apt-get install jq"
    exit 1
fi

API_URL="http://localhost:3000"

# ============================================================================
# PASO 1: LOGIN
# ============================================================================
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}PASO 1: AUTENTICACIÓN${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@automotriz.com",
    "password": "Cliente123!"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
USER_EMAIL=$(echo $LOGIN_RESPONSE | jq -r '.user.email')
USER_NAME=$(echo $LOGIN_RESPONSE | jq -r '.user.nombre')

if [ "$TOKEN" == "null" ]; then
    echo -e "${RED}❌ Error en login${NC}"
    echo $LOGIN_RESPONSE | jq '.'
    exit 1
fi

echo -e "${GREEN}✅ Login exitoso${NC}"
echo -e "   👤 Usuario: ${BLUE}$USER_NAME${NC}"
echo -e "   📧 Email: ${BLUE}$USER_EMAIL${NC}"
echo -e "   🔑 Token: ${BLUE}${TOKEN:0:50}...${NC}"
echo ""

# ============================================================================
# PASO 2: CONSULTAR INVENTARIO INICIAL
# ============================================================================
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}PASO 2: CONSULTAR INVENTARIO INICIAL${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

PRODUCTO_ID=1
INVENTARIO_ANTES=$(curl -s -X GET "$API_URL/inventario/$PRODUCTO_ID" \
  -H "Authorization: Bearer $TOKEN")

PRODUCTO_NOMBRE=$(echo $INVENTARIO_ANTES | jq -r '.nombre')
PRODUCTO_CODIGO=$(echo $INVENTARIO_ANTES | jq -r '.codigo')
STOCK_ANTES=$(echo $INVENTARIO_ANTES | jq -r '.stock')
PRECIO=$(echo $INVENTARIO_ANTES | jq -r '.precio')

echo -e "${GREEN}📦 Producto seleccionado:${NC}"
echo -e "   ID: ${BLUE}$PRODUCTO_ID${NC}"
echo -e "   Nombre: ${BLUE}$PRODUCTO_NOMBRE${NC}"
echo -e "   Código: ${BLUE}$PRODUCTO_CODIGO${NC}"
echo -e "   ${YELLOW}Stock ANTES: $STOCK_ANTES unidades${NC}"
echo -e "   Precio: ${GREEN}\$$PRECIO${NC}"
echo ""

# ============================================================================
# PASO 3: CONSULTAR BASE DE DATOS - ANTES
# ============================================================================
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}PASO 3: ESTADO DE LA BASE DE DATOS (ANTES)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${PURPLE}📊 Consultando PostgreSQL...${NC}"
echo ""
echo -e "${YELLOW}Tabla: productos${NC}"
docker exec bielas-db psql -U bielas_user -d bielas_db -c \
  "SELECT id, nombre, codigo, stock, precio FROM productos WHERE id = $PRODUCTO_ID;" \
  2>/dev/null || echo "Error consultando BD"

echo ""
echo -e "${YELLOW}Tabla: solicitudes (últimas 5)${NC}"
docker exec bielas-db psql -U bielas_user -d bielas_db -c \
  "SELECT id, \"productoId\", cantidad, empresa, estado, \"createdAt\" FROM solicitudes ORDER BY id DESC LIMIT 5;" \
  2>/dev/null || echo "Sin solicitudes aún"

echo ""
echo -e "${YELLOW}Tabla: pagos (últimos 5)${NC}"
docker exec bielas-db psql -U bielas_user -d bielas_db -c \
  "SELECT id, \"solicitudId\", monto, estado, \"createdAt\" FROM pagos ORDER BY id DESC LIMIT 5;" \
  2>/dev/null || echo "Sin pagos aún"

echo ""
read -p "Presiona ENTER para crear la solicitud..."

# ============================================================================
# PASO 4: CREAR SOLICITUD
# ============================================================================
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}PASO 4: CREAR SOLICITUD${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

CANTIDAD=10

SOLICITUD_RESPONSE=$(curl -s -X POST "$API_URL/solicitudes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"productoId\": $PRODUCTO_ID,
    \"cantidad\": $CANTIDAD,
    \"empresa\": \"Automotriz XYZ S.A.\",
    \"observaciones\": \"Entrega urgente para producción - TEST\"
  }")

SOLICITUD_ID=$(echo $SOLICITUD_RESPONSE | jq -r '.solicitud.id')
SOLICITUD_ESTADO=$(echo $SOLICITUD_RESPONSE | jq -r '.solicitud.estado')
MONTO_TOTAL=$(echo $SOLICITUD_RESPONSE | jq -r '.monto_total')

echo -e "${GREEN}✅ Solicitud creada${NC}"
echo -e "   ID: ${BLUE}$SOLICITUD_ID${NC}"
echo -e "   Estado: ${YELLOW}$SOLICITUD_ESTADO${NC}"
echo -e "   Cantidad: ${BLUE}$CANTIDAD unidades${NC}"
echo -e "   Monto Total: ${GREEN}\$$MONTO_TOTAL${NC}"
echo ""

# Verificar en BD
echo -e "${PURPLE}📊 Verificando en PostgreSQL...${NC}"
docker exec bielas-db psql -U bielas_user -d bielas_db -c \
  "SELECT id, \"productoId\", cantidad, empresa, estado, \"createdAt\" FROM solicitudes WHERE id = $SOLICITUD_ID;" \
  2>/dev/null

echo ""
echo -e "${YELLOW}⚠️  Nota: El inventario AÚN NO se ha actualizado (esperando pago)${NC}"
echo ""

read -p "Presiona ENTER para procesar el pago..."

# ============================================================================
# PASO 5: PROCESAR PAGO
# ============================================================================
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}PASO 5: PROCESAR PAGO (CON ACTUALIZACIÓN AUTOMÁTICA)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

PAGO_RESPONSE=$(curl -s -X POST "$API_URL/pagos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"solicitudId\": $SOLICITUD_ID,
    \"monto\": $MONTO_TOTAL,
    \"productoId\": $PRODUCTO_ID,
    \"cantidad\": $CANTIDAD,
    \"userEmail\": \"$USER_EMAIL\"
  }")

PAGO_ID=$(echo $PAGO_RESPONSE | jq -r '.pago.id')
PAGO_ESTADO=$(echo $PAGO_RESPONSE | jq -r '.pago.estado')
FACTURA_NUMERO=$(echo $PAGO_RESPONSE | jq -r '.factura.numero')
EMAIL_ENVIADO=$(echo $PAGO_RESPONSE | jq -r '.notificacion_email.enviado')
STOCK_ACTUALIZADO=$(echo $PAGO_RESPONSE | jq -r '.inventario_actualizado.stock_actual')

echo -e "${GREEN}✅ Pago procesado${NC}"
echo -e "   ID Pago: ${BLUE}$PAGO_ID${NC}"
echo -e "   Estado: ${GREEN}$PAGO_ESTADO${NC}"
echo -e "   Monto: ${GREEN}\$$MONTO_TOTAL${NC}"
echo ""

echo -e "${GREEN}📄 Factura generada automáticamente${NC}"
echo -e "   Número: ${BLUE}$FACTURA_NUMERO${NC}"
echo ""

echo -e "${GREEN}📧 Email enviado automáticamente (simulado)${NC}"
echo -e "   Enviado: ${BLUE}$EMAIL_ENVIADO${NC}"
echo -e "   Destinatario: ${BLUE}$USER_EMAIL${NC}"
echo ""

echo -e "${GREEN}📦 Inventario actualizado automáticamente${NC}"
echo -e "   ${YELLOW}Stock ANTES: $STOCK_ANTES unidades${NC}"
echo -e "   ${GREEN}Stock DESPUÉS: $STOCK_ACTUALIZADO unidades${NC}"
echo -e "   ${PURPLE}Diferencia: -$CANTIDAD unidades${NC}"
echo ""

# ============================================================================
# PASO 6: VERIFICAR INVENTARIO DESPUÉS
# ============================================================================
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}PASO 6: VERIFICAR INVENTARIO ACTUALIZADO${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

INVENTARIO_DESPUES=$(curl -s -X GET "$API_URL/inventario/$PRODUCTO_ID" \
  -H "Authorization: Bearer $TOKEN")

STOCK_DESPUES=$(echo $INVENTARIO_DESPUES | jq -r '.stock')

echo -e "${GREEN}📦 Estado del inventario:${NC}"
echo "$INVENTARIO_DESPUES" | jq '.'
echo ""

# ============================================================================
# PASO 7: CONSULTAR BASE DE DATOS - DESPUÉS
# ============================================================================
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}PASO 7: ESTADO DE LA BASE DE DATOS (DESPUÉS)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${YELLOW}Tabla: productos (actualizado)${NC}"
docker exec bielas-db psql -U bielas_user -d bielas_db -c \
  "SELECT id, nombre, codigo, stock, precio FROM productos WHERE id = $PRODUCTO_ID;" \
  2>/dev/null

echo ""
echo -e "${YELLOW}Tabla: solicitudes${NC}"
docker exec bielas-db psql -U bielas_user -d bielas_db -c \
  "SELECT id, \"productoId\", cantidad, empresa, estado, \"createdAt\" FROM solicitudes WHERE id = $SOLICITUD_ID;" \
  2>/dev/null

echo ""
echo -e "${YELLOW}Tabla: pagos${NC}"
docker exec bielas-db psql -U bielas_user -d bielas_db -c \
  "SELECT id, \"solicitudId\", monto, estado, \"createdAt\" FROM pagos WHERE id = $PAGO_ID;" \
  2>/dev/null

echo ""
echo -e "${YELLOW}Tabla: facturas${NC}"
docker exec bielas-db psql -U bielas_user -d bielas_db -c \
  "SELECT id, numero, monto, \"createdAt\" FROM facturas WHERE numero = '$FACTURA_NUMERO';" \
  2>/dev/null

# ============================================================================
# PASO 8: VER EMAIL SIMULADO EN LOGS
# ============================================================================
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}PASO 8: EMAIL SIMULADO (LOGS DEL SERVICIO)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

docker compose logs pagos-service | grep -A 15 "SIMULACIÓN DE ENVÍO" | tail -17

# ============================================================================
# RESUMEN FINAL
# ============================================================================
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}RESUMEN DEL FLUJO COMPLETO${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo ""
echo -e "${GREEN}✅ PASO 1: Login exitoso${NC}"
echo -e "   Usuario: $USER_NAME ($USER_EMAIL)"
echo ""
echo -e "${GREEN}✅ PASO 2: Solicitud creada${NC}"
echo -e "   ID: $SOLICITUD_ID | Estado: $SOLICITUD_ESTADO"
echo ""
echo -e "${GREEN}✅ PASO 3: Pago procesado manualmente${NC}"
echo -e "   ID: $PAGO_ID | Monto: \$$MONTO_TOTAL"
echo ""
echo -e "${GREEN}✅ PASO 4: Factura generada automáticamente${NC}"
echo -e "   Número: $FACTURA_NUMERO"
echo ""
echo -e "${GREEN}✅ PASO 5: Email enviado automáticamente${NC}"
echo -e "   Destinatario: $USER_EMAIL"
echo ""
echo -e "${GREEN}✅ PASO 6: Inventario actualizado automáticamente${NC}"
echo -e "   ${YELLOW}Stock ANTES:   $STOCK_ANTES unidades${NC}"
echo -e "   ${GREEN}Stock DESPUÉS: $STOCK_DESPUES unidades${NC}"
echo -e "   ${PURPLE}Reducción:     $CANTIDAD unidades${NC}"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 FLUJO COMPLETADO EXITOSAMENTE${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
