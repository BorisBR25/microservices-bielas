# Sistema de Microservicios - Fabricación de Bielas

Sistema de microservicios basado en arquitectura SOA/REST para gestión de solicitudes, pagos e inventario de bielas para empresas automotrices.

## 🏗️ Arquitectura

El sistema está compuesto por 5 microservicios independientes:

- **API Gateway** (Puerto 3000) - Punto de entrada único con autenticación JWT
- **Auth Service** (Puerto 3001) - Gestión de usuarios y autenticación
- **Solicitudes Service** (Puerto 3002) - CRUD de solicitudes
- **Pagos Service** (Puerto 3003) - Procesamiento de pagos y facturación
- **Inventario Service** (Puerto 3004) - Gestión de stock de productos

## 🛠️ Stack Tecnológico

- **Runtime**: Node.js 18+
- **Framework**: NestJS
- **Lenguaje**: TypeScript
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT
- **Contenedorización**: Docker + Docker Compose
- **Documentación**: Swagger/OpenAPI

## 📋 Requisitos Previos

- Docker 20.10+
- Docker Compose 2.0+
- (Opcional) Node.js 18+ para desarrollo local

## 🚀 Instalación y Ejecución

### 1. Clonar o descargar el proyecto

```bash
cd microservices-bielas
```

### 2. Levantar todos los servicios

```bash
docker-compose up --build
```

Este comando:
- Construye las imágenes Docker de cada microservicio
- Levanta PostgreSQL
- Ejecuta los 5 microservicios
- Inicializa datos de prueba (usuarios y productos)

### 3. Verificar que todos los servicios están corriendo

Espera aproximadamente 30-60 segundos para que todos los servicios inicien. Verás mensajes como:

```
🔐 Auth Service ejecutándose en puerto 3001
📋 Solicitudes Service ejecutándose en puerto 3002
💰 Pagos Service ejecutándose en puerto 3003
📦 Inventario Service ejecutándose en puerto 3004
🚀 API Gateway ejecutándose en http://localhost:3000
📚 Documentación Swagger: http://localhost:3000/api/docs
```

### 4. Acceder a la documentación Swagger

Abre tu navegador en: **http://localhost:3000/api/docs**

Aquí encontrarás toda la documentación interactiva de la API.

## 🧪 Probar el Flujo Completo (MANUAL)

### Paso 1: Login

**Endpoint**: `POST /auth/login`

**Credenciales de prueba**:

**Usuario Admin:**
```json
{
  "email": "admin@bielas.com",
  "password": "Admin123!"
}
```

**Usuario Cliente:**
```json
{
  "email": "cliente@automotriz.com",
  "password": "Cliente123!"
}
```

**Respuesta**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@bielas.com",
    "nombre": "Juan Administrador",
    "rol": "admin"
  }
}
```

⚠️ **Copia el `access_token`**, lo necesitarás para los siguientes pasos.

### Paso 2: Autorizar en Swagger

1. En la documentación Swagger, haz clic en el botón **"Authorize"** (candado verde)
2. Ingresa el token en el formato: `tu-token-aquí` (sin "Bearer")
3. Haz clic en "Authorize" y luego "Close"

### Paso 3: Consultar inventario disponible

**Endpoint**: `GET /inventario`

**Respuesta**:
```json
[
  {
    "id": 1,
    "nombre": "Biela Motor V8",
    "codigo": "BIE-V8-001",
    "stock": 100,
    "precio": 250.00,
    "descripcion": "Biela para motor V8 alta resistencia"
  },
  {
    "id": 2,
    "nombre": "Biela Motor V6",
    "codigo": "BIE-V6-002",
    "stock": 150,
    "precio": 180.00,
    "descripcion": "Biela para motor V6 estándar"
  },
  {
    "id": 3,
    "nombre": "Biela Motor 4 Cilindros",
    "codigo": "BIE-4C-003",
    "stock": 200,
    "precio": 120.00,
    "descripcion": "Biela para motor 4 cilindros"
  }
]
```

### Paso 4: Crear solicitud

**Endpoint**: `POST /solicitudes`

**Body**:
```json
{
  "productoId": 1,
  "cantidad": 10,
  "empresa": "Automotriz XYZ S.A.",
  "observaciones": "Entrega urgente para producción"
}
```

**Respuesta**:
```json
{
  "solicitud": {
    "id": 1,
    "productoId": 1,
    "cantidad": 10,
    "empresa": "Automotriz XYZ S.A.",
    "observaciones": "Entrega urgente para producción",
    "userId": 1,
    "estado": "pendiente_pago",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "monto_total": 2500,
  "producto": {
    "id": 1,
    "nombre": "Biela Motor V8",
    "precio": "250.00"
  },
  "mensaje": "Solicitud creada. Proceda a realizar el pago en el endpoint POST /pagos"
}
```

⚠️ **Importante**: La solicitud queda en estado `pendiente_pago`. Debes procesar el pago manualmente.

### Paso 5: Procesar pago manualmente

**Endpoint**: `POST /pagos`

**Body**:
```json
{
  "solicitudId": 1,
  "monto": 2500,
  "productoId": 1,
  "cantidad": 10,
  "userEmail": "admin@bielas.com"
}
```

**Respuesta**:
```json
{
  "pago": {
    "id": 1,
    "solicitudId": 1,
    "monto": 2500,
    "estado": "completado",
    "createdAt": "2024-01-15T10:31:00.000Z"
  },
  "factura": {
    "id": 1,
    "numero": "FACT-000001",
    "monto": 2500,
    "createdAt": "2024-01-15T10:31:00.000Z"
  },
  "notificacion_email": {
    "enviado": true,
    "destinatario": "admin@bielas.com",
    "asunto": "Factura FACT-000001 - Pago Confirmado",
    "mensaje": "Email enviado exitosamente (simulado)"
  },
  "inventario_actualizado": {
    "productoId": 1,
    "nombre": "Biela Motor V8",
    "stock_actual": 90
  }
}
```

✅ **¡Pago procesado!** El proceso ejecutó automáticamente:
1. Creación del pago
2. Generación automática de factura
3. Envío de email simulado (ver logs del contenedor)
4. Actualización automática del inventario (stock reducido de 100 a 90)

### Paso 6: Ver el email simulado en los logs

```bash
docker compose logs pagos-service | grep -A 15 "SIMULACIÓN DE ENVÍO"
```

Verás algo como:
```
📧 ========================================
📧 SIMULACIÓN DE ENVÍO DE EMAIL
📧 ========================================
📧 Para: admin@bielas.com
📧 Asunto: Factura FACT-000001 - Pago Confirmado
📧 Mensaje:
📧
📧 Estimado cliente,
📧
📧 Su pago ha sido procesado exitosamente.
📧
📧 Detalles del pago:
📧 - Número de factura: FACT-000001
📧 - Monto: $2500
📧
📧 Gracias por su compra.
📧
📧 ========================================
```

### Paso 7: Verificar el inventario actualizado

**Endpoint**: `GET /inventario/1`

Verás que el stock ahora es **90** (se restaron las 10 unidades).

## 📊 Health Checks

Verifica el estado de todos los servicios:

**Endpoint**: `GET /health`

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "auth-service": "healthy",
    "solicitudes-service": "healthy",
    "pagos-service": "healthy",
    "inventario-service": "healthy"
  }
}
```

## 🔧 Comandos Útiles

### Ver logs de un servicio específico
```bash
docker-compose logs -f api-gateway
docker-compose logs -f auth-service
docker-compose logs -f solicitudes-service
docker-compose logs -f pagos-service
docker-compose logs -f inventario-service
```

### Detener todos los servicios
```bash
docker-compose down
```

### Detener y eliminar volúmenes (resetear base de datos)
```bash
docker-compose down -v
```

### Reconstruir un servicio específico
```bash
docker-compose up --build api-gateway
```

### Acceder a la base de datos PostgreSQL
```bash
docker exec -it bielas-db psql -U bielas_user -d bielas_db
```

## 🛠️ Scripts de Monitoreo y Visualización

El proyecto incluye tres scripts bash para monitorear y visualizar cambios en el sistema:

### 1. Test de Flujo Completo con Visualización

Script automatizado que muestra el flujo completo del sistema con comparación de inventario:

```bash
./scripts/test-flujo-completo.sh
```

**Características**:
- ✅ Login automático
- 📦 Muestra inventario ANTES de operaciones (API + PostgreSQL)
- 📋 Crea solicitud
- 💰 Procesa pago manualmente
- 📄 Genera factura automáticamente
- 📧 Muestra email simulado en logs
- 📦 Muestra inventario DESPUÉS con comparación
- 🔍 Verifica cambios en PostgreSQL
- 📊 Resumen completo con diferencias

### 2. Monitor Interactivo de Base de Datos

Herramienta interactiva para consultar PostgreSQL en tiempo real:

```bash
./scripts/monitor-db.sh
```

**Opciones del menú**:
1. Ver todos los usuarios
2. Ver todos los productos (inventario)
3. Ver todas las solicitudes
4. Ver todos los pagos
5. Ver todas las facturas
6. Ver resumen completo del sistema
7. Monitorear cambios en inventario (auto-refresh cada 2 segundos)
8. Ver última solicitud con todos sus datos
9. Ejecutar query personalizado
0. Salir

### 3. Comparador de Inventario Antes/Después

Script para comparar inventario antes y después de operaciones:

```bash
./scripts/comparar-inventario.sh
```

**Flujo**:
1. 📸 Toma snapshot del inventario ANTES
2. ⏸️ Pausa para que realices operaciones (crear solicitud y pago)
3. 📸 Toma snapshot del inventario DESPUÉS
4. 🔍 Muestra comparación detallada con diferencias
5. ✅ Verifica cambios directamente en PostgreSQL

**Requisitos para los scripts**:
- `jq` instalado: `sudo apt-get install jq`
- Sistema debe estar corriendo: `docker-compose up`

## 🌐 URLs de Acceso

| Servicio | URL | Descripción |
|----------|-----|-------------|
| API Gateway | http://localhost:3000 | Punto de entrada principal |
| Swagger Docs | http://localhost:3000/api/docs | Documentación interactiva |
| Auth Service | http://localhost:3001 | Servicio de autenticación |
| Solicitudes Service | http://localhost:3002 | Servicio de solicitudes |
| Pagos Service | http://localhost:3003 | Servicio de pagos |
| Inventario Service | http://localhost:3004 | Servicio de inventario |
| PostgreSQL | localhost:5432 | Base de datos |

## 📚 Endpoints Principales

### Autenticación
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Login (obtener JWT)
- `GET /auth/profile` - Perfil del usuario autenticado
- `GET /auth/users` - Listar usuarios
- `DELETE /auth/users/:id` - **NUEVO:** Eliminar usuario

### Solicitudes
- `POST /solicitudes` - Crear solicitud (queda en estado pendiente_pago)
- `GET /solicitudes` - Listar solicitudes
- `GET /solicitudes/:id` - Obtener solicitud
- `PUT /solicitudes/:id` - Actualizar solicitud
- `DELETE /solicitudes/:id` - Eliminar solicitud

### Pagos
- `POST /pagos` - **NUEVO:** Procesar pago manual (genera factura, envía email y actualiza inventario automáticamente)
- `GET /pagos/solicitud/:solicitudId` - Obtener pago por solicitud
- `GET /pagos/factura/:id` - Obtener factura

### Inventario
- `GET /inventario` - Listar productos
- `GET /inventario/:id` - Obtener producto

### Health
- `GET /health` - Estado del sistema

## 🔐 Seguridad

- Todos los endpoints (excepto `/auth/login`, `/auth/register` y `/health`) requieren JWT válido
- Los tokens expiran en 24 horas
- Las contraseñas se almacenan hasheadas con bcrypt
- CORS habilitado para desarrollo

## 🗄️ Base de Datos

Credenciales PostgreSQL (para desarrollo):
- **Host**: localhost
- **Puerto**: 5432
- **Usuario**: bielas_user
- **Contraseña**: bielas_pass
- **Base de datos**: bielas_db

## 🎯 Casos de Uso Implementados

### ✅ Criterios de Éxito Cumplidos

- [x] Usuario puede hacer login y recibir JWT
- [x] Usuario autenticado puede crear solicitud (queda en estado pendiente_pago)
- [x] Usuario puede eliminar otros usuarios (DELETE /auth/users/:id)
- [x] Pago se procesa MANUALMENTE en endpoint separado (POST /pagos)
- [x] Al procesar pago, se genera factura AUTOMÁTICAMENTE
- [x] Al procesar pago, se envía email simulado AUTOMÁTICAMENTE
- [x] Al procesar pago, se actualiza inventario AUTOMÁTICAMENTE (resta stock)
- [x] Toda la comunicación pasa por API Gateway
- [x] Swagger muestra todos los endpoints con ejemplos interactivos
- [x] Servicios se levantan con `docker-compose up`
- [x] Sistema es resiliente: si un servicio falla, no cae todo

### 📋 Flujo de Negocio Implementado

1. **Usuario hace login** → Recibe JWT
2. **Usuario crea solicitud** → Solicitud queda en estado `pendiente_pago`
3. **Usuario procesa pago manualmente** → Al procesar pago:
   - ✅ Se crea el pago
   - ✅ Se genera factura automáticamente
   - ✅ Se envía email simulado automáticamente (ver logs)
   - ✅ Se actualiza inventario automáticamente

## 🐛 Troubleshooting

### Los servicios no inician
```bash
# Verificar logs
docker-compose logs

# Reconstruir desde cero
docker-compose down -v
docker-compose up --build
```

### Error de conexión a base de datos
Espera 30-60 segundos adicionales. PostgreSQL puede tardar en iniciar completamente.

### Puerto ya en uso
```bash
# Cambiar puertos en docker-compose.yml o detener procesos conflictivos
lsof -i :3000  # Ver qué proceso usa el puerto 3000
```

### Token JWT inválido
- Verifica que copiaste el token completo
- Asegúrate de no incluir "Bearer " al pegar en Swagger
- El token expira en 24h, haz login nuevamente

## 👥 Datos de Prueba Iniciales

### Usuarios
| Email | Password | Rol |
|-------|----------|-----|
| admin@bielas.com | Admin123! | admin |
| cliente@automotriz.com | Cliente123! | cliente |

### Productos en Inventario
| ID | Nombre | Código | Stock | Precio |
|----|--------|--------|-------|--------|
| 1 | Biela Motor V8 | BIE-V8-001 | 100 | $250.00 |
| 2 | Biela Motor V6 | BIE-V6-002 | 150 | $180.00 |
| 3 | Biela Motor 4 Cilindros | BIE-4C-003 | 200 | $120.00 |

## 📞 Soporte

Para problemas o preguntas, consulta:
- Documentación Swagger: http://localhost:3000/api/docs
- Logs de servicios: `docker-compose logs -f`

---

**Desarrollado con NestJS + TypeScript + Docker**
