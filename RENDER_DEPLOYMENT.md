# 🚀 Deployment en Render - Sistema Completo de Microservicios

Guía completa para desplegar el sistema de microservicios para fabricación de bielas en Render con PostgreSQL gratuito.

## 📋 Arquitectura del Deployment

Este deployment incluye:
- **1 Base de datos PostgreSQL** (compartida por todos los servicios)
- **5 Web Services**:
  - `api-gateway` (Puerto 3000) - Gateway principal con Swagger
  - `auth-service` (Puerto 3001) - Autenticación y usuarios
  - `solicitudes-service` (Puerto 3002) - Gestión de solicitudes
  - `pagos-service` (Puerto 3003) - Pagos y facturación
  - `inventario-service` (Puerto 3004) - Control de inventario

## 🎯 Opción 1: Deploy Automático con Blueprint (Recomendado)

### Paso 1: Preparar el Repositorio

```bash
cd /home/bj/Desktop/microservices-bielas

# Asegúrate de tener todos los cambios commiteados
git add .
git commit -m "Configuración para deployment en Render"
git push origin main
```

### Paso 2: Crear Blueprint en Render

1. Ve a https://render.com y crea una cuenta
2. Click en **"New +"** → **"Blueprint"**
3. Conecta tu repositorio de GitHub
4. Render detectará automáticamente el archivo `render.yaml`
5. Click en **"Apply"**
6. **Importante**: Revisa las URLs generadas y actualízalas en las variables de entorno

### Paso 3: Actualizar URLs de Servicios

Después del primer deploy, Render asignará URLs únicas. Debes actualizarlas:

1. Ve a cada servicio en el dashboard de Render
2. Copia la URL real asignada (ej: `https://auth-service-xxxx.onrender.com`)
3. Actualiza las variables de entorno en cada servicio:

**API Gateway:**
- `AUTH_SERVICE_URL`: URL real del auth-service
- `SOLICITUDES_SERVICE_URL`: URL real del solicitudes-service
- `PAGOS_SERVICE_URL`: URL real del pagos-service
- `INVENTARIO_SERVICE_URL`: URL real del inventario-service

**Solicitudes Service:**
- `PAGOS_SERVICE_URL`: URL real del pagos-service
- `INVENTARIO_SERVICE_URL`: URL real del inventario-service

**Pagos Service:**
- `INVENTARIO_SERVICE_URL`: URL real del inventario-service

4. Después de actualizar, haz **"Manual Deploy"** en cada servicio

## 🎯 Opción 2: Deploy Manual (Paso a Paso)

### Paso 1: Crear la Base de Datos

1. En Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configuración:
   - **Name**: `bielas-db`
   - **Database**: `bielas_production`
   - **User**: `bielas_user`
   - **Region**: Oregon (o el más cercano)
   - **Plan**: Free
3. Click **"Create Database"**
4. Espera 2-3 minutos hasta que esté disponible
5. **Guarda** las credenciales (las necesitarás para cada servicio)

### Paso 2: Desplegar Auth Service

1. Click **"New +"** → **"Web Service"**
2. Conecta tu repositorio
3. Configuración:
   - **Name**: `auth-service`
   - **Root Directory**: `auth-service`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Free

4. Variables de entorno:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_HOST=[de bielas-db]
   DATABASE_PORT=[de bielas-db]
   DATABASE_USER=[de bielas-db]
   DATABASE_PASSWORD=[de bielas-db]
   DATABASE_NAME=bielas_production
   JWT_SECRET=[generar valor aleatorio]
   ```

5. Click **"Create Web Service"**

### Paso 3: Desplegar Inventario Service

Repetir el proceso con:
- **Name**: `inventario-service`
- **Root Directory**: `inventario-service`
- Mismas variables de DB
- `PORT=3004`

### Paso 4: Desplegar Pagos Service

- **Name**: `pagos-service`
- **Root Directory**: `pagos-service`
- Variables de DB + `PORT=3003`
- **Agregar**: `INVENTARIO_SERVICE_URL=[URL de inventario-service]`

### Paso 5: Desplegar Solicitudes Service

- **Name**: `solicitudes-service`
- **Root Directory**: `solicitudes-service`
- Variables de DB + `PORT=3002`
- **Agregar**:
  - `PAGOS_SERVICE_URL=[URL de pagos-service]`
  - `INVENTARIO_SERVICE_URL=[URL de inventario-service]`

### Paso 6: Desplegar API Gateway

- **Name**: `api-gateway`
- **Root Directory**: `api-gateway`
- **NO necesita** variables de base de datos
- `PORT=3000`
- **Agregar**:
  - `AUTH_SERVICE_URL=[URL de auth-service]`
  - `SOLICITUDES_SERVICE_URL=[URL de solicitudes-service]`
  - `PAGOS_SERVICE_URL=[URL de pagos-service]`
  - `INVENTARIO_SERVICE_URL=[URL de inventario-service]`

## 📚 Acceder al Sistema

Una vez desplegado:

### Swagger UI
```
https://tu-api-gateway.onrender.com/api/docs
```

### Endpoints Principales
- **Health Check**: `GET /health`
- **Login**: `POST /auth/login`
- **Register**: `POST /auth/register`

## 🔑 Inicializar la Base de Datos

La base de datos se inicializará automáticamente en el primer deploy gracias a TypeORM con `synchronize: true`.

Para crear un usuario administrador inicial, usa Swagger:

1. Ve a `/api/docs`
2. Endpoint: `POST /auth/register`
3. Body:
```json
{
  "email": "admin@bielas.com",
  "password": "tu_password_seguro",
  "nombre": "Administrador",
  "rol": "admin"
}
```

## 🧪 Probar el Sistema

### 1. Registrar Usuario
```bash
curl -X POST https://tu-api-gateway.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@bielas.com",
    "password": "test123",
    "nombre": "Usuario Test",
    "rol": "usuario"
  }'
```

### 2. Login
```bash
curl -X POST https://tu-api-gateway.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@bielas.com",
    "password": "test123"
  }'
```

Copia el `access_token` de la respuesta.

### 3. Crear Solicitud
```bash
curl -X POST https://tu-api-gateway.onrender.com/solicitudes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "productoId": 1,
    "cantidad": 10,
    "empresa": "Test Corp",
    "observaciones": "Prueba"
  }'
```

## ⚠️ Limitaciones del Plan Free de Render

- **Spin Down**: Los servicios se duermen después de 15 minutos de inactividad
- **Primera petición lenta**: Puede tardar 30-50 segundos en despertar
- **Base de datos**: 1GB de almacenamiento
- **Ancho de banda**: 100GB/mes
- **Build time**: 500 horas/mes (compartidas)

## 🔧 Troubleshooting

### Servicio no inicia
1. Revisa los logs en Render Dashboard
2. Verifica que las variables de entorno estén correctas
3. Asegúrate que las URLs de otros servicios sean correctas

### Error de conexión a base de datos
1. Verifica que la base de datos esté activa
2. Comprueba las credenciales en las variables de entorno
3. Asegúrate de usar las credenciales internas de Render, no externas

### Servicios no se comunican
1. Verifica que las URLs en las variables de entorno sean correctas
2. Usa las URLs **públicas** de Render (https://nombre-servicio.onrender.com)
3. NO uses `localhost` o IPs internas

### Swagger no muestra endpoints
1. Verifica que el API Gateway esté corriendo
2. Revisa los logs del API Gateway
3. Asegúrate que las URLs de servicios estén configuradas

## 💡 Optimizaciones

### Mantener Servicios Activos
Para evitar el "spin down" del plan free:

1. Usa un servicio de ping como https://uptimerobot.com
2. Configura ping cada 10 minutos al endpoint `/health`
3. Solo para el API Gateway (los demás pueden dormir)

### Monitoreo
Render provee:
- Logs en tiempo real
- Métricas de CPU y memoria
- Health checks automáticos

## 🔐 Seguridad en Producción

**Importante**: Para producción real:

1. **JWT_SECRET**: Usa valores largos y aleatorios
2. **CORS**: Configura dominios específicos en cada servicio
3. **Rate Limiting**: Implementa rate limiting en el API Gateway
4. **HTTPS**: Render provee SSL/TLS automáticamente
5. **Secrets**: Nunca commits credenciales en el código

## 📊 Estructura de Costos

| Recurso | Plan Free | Límites |
|---------|-----------|---------|
| PostgreSQL | ✅ Gratis | 1GB, 90 días sin actividad |
| Web Services (5) | ✅ Gratis | 750 hrs/mes cada uno |
| Bandwidth | ✅ 100GB | Compartido |
| SSL | ✅ Incluido | Automático |

**Total**: $0/mes para desarrollo y demos

## 🚀 Actualizar el Sistema

```bash
# En tu máquina local
git add .
git commit -m "Actualización del sistema"
git push origin main

# Render detectará el push y hará auto-deploy
```

O manualmente en Render Dashboard:
- Ve a cada servicio
- Click en "Manual Deploy" → "Deploy latest commit"

## 📝 Checklist de Deployment

- [ ] Base de datos PostgreSQL creada
- [ ] Auth Service desplegado y corriendo
- [ ] Inventario Service desplegado y corriendo
- [ ] Pagos Service desplegado y corriendo
- [ ] Solicitudes Service desplegado y corriendo
- [ ] API Gateway desplegado y corriendo
- [ ] URLs de servicios actualizadas en variables de entorno
- [ ] Todos los servicios re-desplegados con URLs correctas
- [ ] Usuario admin creado
- [ ] Swagger accesible en `/api/docs`
- [ ] Health check retorna "healthy"
- [ ] Login funcional
- [ ] Creación de solicitudes funcional

## 🆘 Soporte

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **NestJS Docs**: https://docs.nestjs.com

---

**Sistema**: Microservicios para Fabricación de Bielas
**Plataforma**: Render.com
**Stack**: NestJS + PostgreSQL + TypeORM
**Última actualización**: 2025
