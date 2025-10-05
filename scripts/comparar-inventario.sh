#!/bin/bash

# Colores
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         COMPARADOR DE INVENTARIO ANTES/DESPUÉS                ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ Error: jq no está instalado${NC}"
    exit 1
fi

API_URL="http://localhost:3000"

# Login
echo -e "${BLUE}🔐 Iniciando sesión...${NC}"
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bielas.com","password":"Admin123!"}' | jq -r '.access_token')

if [ "$TOKEN" == "null" ]; then
    echo -e "${RED}❌ Error en login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Sesión iniciada${NC}"
echo ""

# Obtener inventario completo ANTES
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📦 INVENTARIO ACTUAL (ANTES DE OPERACIONES)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

INVENTARIO_JSON=$(curl -s -X GET "$API_URL/inventario" -H "Authorization: Bearer $TOKEN")

echo "$INVENTARIO_JSON" | jq -r '
["ID", "NOMBRE", "CÓDIGO", "STOCK", "PRECIO"],
["--", "------", "------", "-----", "------"],
(.[] | [.id, .nombre, .codigo, .stock, .precio])
| @tsv' | column -t -s $'\t'

echo ""

# Guardar snapshot ANTES
echo "$INVENTARIO_JSON" > /tmp/inventario_antes.json

# Obtener también de la BD directamente
echo -e "${PURPLE}📊 Verificación desde PostgreSQL:${NC}"
docker exec bielas-db psql -U bielas_user -d bielas_db -c \
  "SELECT id, nombre, codigo, stock, precio FROM productos ORDER BY id;" \
  2>/dev/null

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Snapshot del inventario guardado${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

read -p "Presiona ENTER después de realizar operaciones (crear solicitud y pago)..."

# Obtener inventario DESPUÉS
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📦 INVENTARIO ACTUALIZADO (DESPUÉS DE OPERACIONES)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

INVENTARIO_DESPUES_JSON=$(curl -s -X GET "$API_URL/inventario" -H "Authorization: Bearer $TOKEN")

echo "$INVENTARIO_DESPUES_JSON" | jq -r '
["ID", "NOMBRE", "CÓDIGO", "STOCK", "PRECIO"],
["--", "------", "------", "-----", "------"],
(.[] | [.id, .nombre, .codigo, .stock, .precio])
| @tsv' | column -t -s $'\t'

echo ""

# Guardar snapshot DESPUÉS
echo "$INVENTARIO_DESPUES_JSON" > /tmp/inventario_despues.json

# Comparar y mostrar diferencias
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🔍 COMPARACIÓN DE CAMBIOS${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Usar jq para comparar
jq -n '
  [inputs] |
  (.[0] | map({id: .id, nombre: .nombre, stock: .stock}) | INDEX(.id)) as $antes |
  (.[1] | map({id: .id, nombre: .nombre, stock: .stock}) | INDEX(.id)) as $despues |
  ($antes | keys) as $ids |
  $ids | map(
    . as $id |
    {
      id: $id,
      nombre: $antes[$id].nombre,
      stock_antes: $antes[$id].stock,
      stock_despues: $despues[$id].stock,
      diferencia: ($despues[$id].stock - $antes[$id].stock)
    }
  ) |
  map(
    select(.diferencia != 0)
  )
' /tmp/inventario_antes.json /tmp/inventario_despues.json > /tmp/diferencias.json

CAMBIOS=$(cat /tmp/diferencias.json)

if [ "$CAMBIOS" == "[]" ]; then
    echo -e "${GREEN}✅ No hay cambios en el inventario${NC}"
else
    echo -e "${YELLOW}⚠️  Se detectaron cambios:${NC}"
    echo ""
    cat /tmp/diferencias.json | jq -r '
    ["PRODUCTO", "STOCK ANTES", "STOCK DESPUÉS", "DIFERENCIA"],
    ["--------", "-----------", "-------------", "-----------"],
    (.[] | [.nombre, .stock_antes, .stock_despues, .diferencia])
    | @tsv' | column -t -s $'\t'

    echo ""
    echo -e "${PURPLE}📊 Detalles de los cambios:${NC}"
    cat /tmp/diferencias.json | jq '.[] | "  • \(.nombre): \(.stock_antes) → \(.stock_despues) (\(.diferencia) unidades)"' -r
fi

echo ""
echo -e "${PURPLE}📊 Verificación final desde PostgreSQL:${NC}"
docker exec bielas-db psql -U bielas_user -d bielas_db -c \
  "SELECT id, nombre, codigo, stock, precio FROM productos ORDER BY id;" \
  2>/dev/null

echo ""
echo -e "${GREEN}🎯 Comparación completada${NC}"
echo ""

# Limpiar archivos temporales
rm -f /tmp/inventario_antes.json /tmp/inventario_despues.json /tmp/diferencias.json
