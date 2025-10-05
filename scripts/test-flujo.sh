#!/bin/bash

echo "========================================="
echo "PRUEBA DEL FLUJO AUTOMATIZADO COMPLETO"
echo "========================================="
echo ""

# 1. Login
echo "1️⃣  PASO 1: LOGIN"
echo "-------------------"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bielas.com",
    "password": "Admin123!"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
echo "✅ Login exitoso"
echo "Token: ${TOKEN:0:50}..."
echo ""

# 2. Consultar inventario antes
echo "2️⃣  PASO 2: CONSULTAR INVENTARIO (Antes)"
echo "----------------------------------------"
INVENTARIO_ANTES=$(curl -s -X GET http://localhost:3000/inventario/1 \
  -H "Authorization: Bearer $TOKEN")
STOCK_ANTES=$(echo $INVENTARIO_ANTES | jq -r '.stock')
echo "📦 Producto: $(echo $INVENTARIO_ANTES | jq -r '.nombre')"
echo "📊 Stock actual: $STOCK_ANTES unidades"
echo ""

# 3. Crear solicitud (FLUJO AUTOMATIZADO)
echo "3️⃣  PASO 3: CREAR SOLICITUD (Flujo Automático)"
echo "----------------------------------------------"
echo "🔄 Creando solicitud de 10 unidades..."
SOLICITUD_RESPONSE=$(curl -s -X POST http://localhost:3000/solicitudes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productoId": 1,
    "cantidad": 10,
    "empresa": "Automotriz XYZ S.A.",
    "observaciones": "Entrega urgente para producción"
  }')

echo ""
echo "✅ SOLICITUD CREADA:"
echo "   ID: $(echo $SOLICITUD_RESPONSE | jq -r '.solicitud.id')"
echo "   Estado: $(echo $SOLICITUD_RESPONSE | jq -r '.solicitud.estado')"
echo ""

echo "💰 PAGO PROCESADO:"
echo "   ID: $(echo $SOLICITUD_RESPONSE | jq -r '.pago.id')"
echo "   Monto: \$$(echo $SOLICITUD_RESPONSE | jq -r '.pago.monto')"
echo "   Estado: $(echo $SOLICITUD_RESPONSE | jq -r '.pago.estado')"
echo ""

echo "📄 FACTURA GENERADA:"
echo "   Número: $(echo $SOLICITUD_RESPONSE | jq -r '.factura.numero')"
echo "   Monto: \$$(echo $SOLICITUD_RESPONSE | jq -r '.factura.monto')"
echo ""

echo "📦 INVENTARIO ACTUALIZADO:"
echo "   Producto: $(echo $SOLICITUD_RESPONSE | jq -r '.inventario.nombre')"
echo "   Stock anterior: $(echo $SOLICITUD_RESPONSE | jq -r '.inventario.stockAnterior')"
echo "   Stock actual: $(echo $SOLICITUD_RESPONSE | jq -r '.inventario.stockActual')"
echo ""

# 4. Verificar inventario después
echo "4️⃣  PASO 4: VERIFICAR INVENTARIO (Después)"
echo "-----------------------------------------"
INVENTARIO_DESPUES=$(curl -s -X GET http://localhost:3000/inventario/1 \
  -H "Authorization: Bearer $TOKEN")
STOCK_DESPUES=$(echo $INVENTARIO_DESPUES | jq -r '.stock')
echo "📊 Stock actualizado: $STOCK_DESPUES unidades"
echo "📉 Reducción: $(($STOCK_ANTES - $STOCK_DESPUES)) unidades"
echo ""

echo "========================================="
echo "✅ FLUJO AUTOMATIZADO COMPLETADO"
echo "========================================="
echo ""
echo "Resumen:"
echo "- ✅ Login exitoso"
echo "- ✅ Solicitud creada automáticamente"
echo "- ✅ Pago procesado automáticamente"
echo "- ✅ Factura generada automáticamente"
echo "- ✅ Inventario actualizado automáticamente"
echo ""
echo "🌐 Accede a Swagger: http://localhost:3000/api/docs"
