#!/bin/bash

# Colores
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         MONITOR DE BASE DE DATOS EN TIEMPO REAL               ║${NC}"
echo -e "${CYAN}║                    PostgreSQL - Bielas                         ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

DB_CONTAINER="bielas-db"
DB_USER="bielas_user"
DB_NAME="bielas_db"

# Función para ejecutar query
run_query() {
    docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "$1" 2>/dev/null
}

# Menú principal
while true; do
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}OPCIONES DE MONITOREO:${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "  1) Ver todos los usuarios"
    echo "  2) Ver todos los productos (inventario)"
    echo "  3) Ver todas las solicitudes"
    echo "  4) Ver todos los pagos"
    echo "  5) Ver todas las facturas"
    echo "  6) Ver resumen completo del sistema"
    echo "  7) Monitorear cambios en inventario (auto-refresh)"
    echo "  8) Ver última solicitud con todos sus datos"
    echo "  9) Ejecutar query personalizado"
    echo "  0) Salir"
    echo ""
    read -p "Selecciona una opción: " opcion

    case $opcion in
        1)
            echo ""
            echo -e "${YELLOW}═══════════ TABLA: USERS ═══════════${NC}"
            run_query "SELECT id, email, nombre, rol, \"createdAt\" FROM users ORDER BY id;"
            ;;
        2)
            echo ""
            echo -e "${YELLOW}═══════════ TABLA: PRODUCTOS ═══════════${NC}"
            run_query "SELECT id, nombre, codigo, stock, precio, descripcion FROM productos ORDER BY id;"
            ;;
        3)
            echo ""
            echo -e "${YELLOW}═══════════ TABLA: SOLICITUDES ═══════════${NC}"
            run_query "SELECT id, \"productoId\", cantidad, empresa, estado, \"userId\", \"createdAt\" FROM solicitudes ORDER BY id DESC LIMIT 20;"
            ;;
        4)
            echo ""
            echo -e "${YELLOW}═══════════ TABLA: PAGOS ═══════════${NC}"
            run_query "SELECT id, \"solicitudId\", \"userId\", monto, estado, \"createdAt\" FROM pagos ORDER BY id DESC LIMIT 20;"
            ;;
        5)
            echo ""
            echo -e "${YELLOW}═══════════ TABLA: FACTURAS ═══════════${NC}"
            run_query "SELECT id, numero, monto, \"createdAt\" FROM facturas ORDER BY id DESC LIMIT 20;"
            ;;
        6)
            echo ""
            echo -e "${YELLOW}═══════════ RESUMEN DEL SISTEMA ═══════════${NC}"
            echo ""
            echo -e "${GREEN}📊 Estadísticas Generales:${NC}"
            run_query "
                SELECT
                    'Usuarios' as tabla, COUNT(*) as total FROM users
                UNION ALL
                SELECT 'Productos', COUNT(*) FROM productos
                UNION ALL
                SELECT 'Solicitudes', COUNT(*) FROM solicitudes
                UNION ALL
                SELECT 'Pagos', COUNT(*) FROM pagos
                UNION ALL
                SELECT 'Facturas', COUNT(*) FROM facturas;
            "

            echo ""
            echo -e "${GREEN}💰 Total de Ventas:${NC}"
            run_query "SELECT COALESCE(SUM(monto), 0) as total_ventas FROM pagos WHERE estado = 'completado';"

            echo ""
            echo -e "${GREEN}📦 Stock Total de Productos:${NC}"
            run_query "SELECT nombre, stock FROM productos ORDER BY stock DESC;"

            echo ""
            echo -e "${GREEN}📋 Solicitudes por Estado:${NC}"
            run_query "SELECT estado, COUNT(*) as cantidad FROM solicitudes GROUP BY estado;"
            ;;
        7)
            echo ""
            echo -e "${YELLOW}═══════════ MONITOR DE INVENTARIO (Ctrl+C para salir) ═══════════${NC}"
            while true; do
                clear
                echo -e "${CYAN}🔄 Actualizando cada 2 segundos...${NC}"
                echo ""
                run_query "
                    SELECT
                        id,
                        nombre,
                        codigo,
                        stock,
                        precio,
                        TO_CHAR(\"createdAt\", 'YYYY-MM-DD HH24:MI:SS') as actualizado
                    FROM productos
                    ORDER BY id;
                "
                sleep 2
            done
            ;;
        8)
            echo ""
            read -p "Ingresa el ID de la solicitud: " sol_id
            echo ""
            echo -e "${YELLOW}═══════════ DETALLES COMPLETOS DE SOLICITUD #$sol_id ═══════════${NC}"

            echo ""
            echo -e "${GREEN}📋 Solicitud:${NC}"
            run_query "
                SELECT
                    s.id,
                    s.\"productoId\",
                    p.nombre as producto,
                    s.cantidad,
                    s.empresa,
                    s.estado,
                    s.\"userId\",
                    u.email as usuario,
                    s.\"createdAt\"
                FROM solicitudes s
                LEFT JOIN productos p ON s.\"productoId\" = p.id
                LEFT JOIN users u ON s.\"userId\" = u.id
                WHERE s.id = $sol_id;
            "

            echo ""
            echo -e "${GREEN}💰 Pago:${NC}"
            run_query "
                SELECT
                    id,
                    \"solicitudId\",
                    monto,
                    estado,
                    \"createdAt\"
                FROM pagos
                WHERE \"solicitudId\" = $sol_id;
            "

            echo ""
            echo -e "${GREEN}📄 Factura:${NC}"
            run_query "
                SELECT
                    f.id,
                    f.numero,
                    f.monto,
                    f.\"createdAt\"
                FROM facturas f
                INNER JOIN pagos p ON f.\"pagoId\" = p.id
                WHERE p.\"solicitudId\" = $sol_id;
            "
            ;;
        9)
            echo ""
            echo "Ingresa tu query SQL (termina con punto y coma):"
            read -p "> " custom_query
            echo ""
            run_query "$custom_query"
            ;;
        0)
            echo ""
            echo -e "${GREEN}👋 Saliendo del monitor...${NC}"
            echo ""
            exit 0
            ;;
        *)
            echo ""
            echo -e "${YELLOW}⚠️  Opción inválida${NC}"
            ;;
    esac

    echo ""
    read -p "Presiona ENTER para continuar..."
done
