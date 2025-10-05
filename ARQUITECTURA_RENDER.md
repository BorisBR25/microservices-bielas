# 🏗️ Arquitectura de Deployment en Render

## Diagrama de Servicios

```
┌─────────────────────────────────────────────────────────────────┐
│                         RENDER.COM                              │
│                         (Plan Free)                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     🗄️  PostgreSQL Database                     │
│                                                                  │
│  Name: bielas-db                                                │
│  Database: bielas_production                                    │
│  Storage: 1GB (Free)                                            │
│  Connection: Internal (private)                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Shared Database Connection
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 🔐 Auth      │  │ 📦 Inventario│  │ 💰 Pagos     │
│ Service      │  │ Service      │  │ Service      │
│              │  │              │  │              │
│ Port: 3001   │  │ Port: 3004   │  │ Port: 3003   │
│ Free Plan    │  │ Free Plan    │  │ Free Plan    │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                         ▼
                ┌──────────────┐
                │ 📋 Solicitudes│
                │ Service      │
                │              │
                │ Port: 3002   │
                │ Free Plan    │
                └──────┬───────┘
                       │
                       │
                       ▼
              ┌──────────────┐
              │ 🚀 API       │
              │ Gateway      │
              │              │
              │ Port: 3000   │
              │ Free Plan    │
              │              │
              │ + Swagger UI │
              └──────┬───────┘
                     │
                     │ HTTPS (SSL automático)
                     │
                     ▼
            ┌─────────────────┐
            │   🌐 Internet   │
            │                 │
            │  Public Access  │
            └─────────────────┘
```

## 🔗 Comunicación entre Servicios

### URLs Públicas (HTTPS)
```
API Gateway       → https://api-gateway-xxxxx.onrender.com
Auth Service      → https://auth-service-xxxxx.onrender.com
Solicitudes       → https://solicitudes-service-xxxxx.onrender.com
Pagos Service     → https://pagos-service-xxxxx.onrender.com
Inventario        → https://inventario-service-xxxxx.onrender.com
```

### Flujo de Datos

```
Cliente/Browser
      │
      ├─> GET /api/docs (Swagger UI)
      │
      ├─> POST /auth/login
      │        │
      │        └──> Auth Service (DB Query)
      │                  │
      │                  └──> Returns JWT Token
      │
      ├─> POST /solicitudes (+ JWT Header)
      │        │
      │        └──> Solicitudes Service
      │                  ├──> Validates JWT
      │                  ├──> Creates Solicitud (DB)
      │                  └──> Returns Solicitud
      │
      └─> POST /pagos (+ JWT Header)
               │
               └──> Pagos Service
                         ├──> Validates JWT
                         ├──> Creates Pago (DB)
                         ├──> Creates Factura (DB)
                         ├──> HTTP → Inventario Service
                         │            └──> Updates Stock (DB)
                         └──> Returns Pago + Factura + Inventory Update
```

## 🔧 Variables de Entorno por Servicio

### Auth Service
```yaml
NODE_ENV: production
PORT: 3001
DATABASE_HOST: <from bielas-db>
DATABASE_PORT: <from bielas-db>
DATABASE_USER: <from bielas-db>
DATABASE_PASSWORD: <from bielas-db>
DATABASE_NAME: bielas_production
JWT_SECRET: <auto-generated>
```

### Solicitudes Service
```yaml
NODE_ENV: production
PORT: 3002
DATABASE_HOST: <from bielas-db>
DATABASE_PORT: <from bielas-db>
DATABASE_USER: <from bielas-db>
DATABASE_PASSWORD: <from bielas-db>
DATABASE_NAME: bielas_production
PAGOS_SERVICE_URL: https://pagos-service.onrender.com
INVENTARIO_SERVICE_URL: https://inventario-service.onrender.com
```

### Pagos Service
```yaml
NODE_ENV: production
PORT: 3003
DATABASE_HOST: <from bielas-db>
DATABASE_PORT: <from bielas-db>
DATABASE_USER: <from bielas-db>
DATABASE_PASSWORD: <from bielas-db>
DATABASE_NAME: bielas_production
INVENTARIO_SERVICE_URL: https://inventario-service.onrender.com
```

### Inventario Service
```yaml
NODE_ENV: production
PORT: 3004
DATABASE_HOST: <from bielas-db>
DATABASE_PORT: <from bielas-db>
DATABASE_USER: <from bielas-db>
DATABASE_PASSWORD: <from bielas-db>
DATABASE_NAME: bielas_production
```

### API Gateway
```yaml
NODE_ENV: production
PORT: 3000
AUTH_SERVICE_URL: https://auth-service.onrender.com
SOLICITUDES_SERVICE_URL: https://solicitudes-service.onrender.com
PAGOS_SERVICE_URL: https://pagos-service.onrender.com
INVENTARIO_SERVICE_URL: https://inventario-service.onrender.com
```

## 📊 Recursos del Plan Free

| Servicio | CPU | RAM | Storage | Bandwidth |
|----------|-----|-----|---------|-----------|
| PostgreSQL | Shared | 256MB | 1GB | N/A |
| Auth Service | Shared | 512MB | N/A | 100GB/mes |
| Solicitudes | Shared | 512MB | N/A | 100GB/mes |
| Pagos | Shared | 512MB | N/A | 100GB/mes |
| Inventario | Shared | 512MB | N/A | 100GB/mes |
| API Gateway | Shared | 512MB | N/A | 100GB/mes |

**Total**: 6 servicios gratuitos

## ⚡ Performance

### Cold Start (Spin Down)
- Después de 15 min inactivos, los servicios duermen
- Primera petición: 30-50 segundos para despertar
- Peticiones subsecuentes: <1 segundo

### Solución para Mantener Activo
Usar servicio de ping (UptimeRobot):
```
Ping URL: https://api-gateway-xxxxx.onrender.com/health
Interval: 10 minutos
```

## 🔒 Seguridad

### SSL/TLS
- ✅ Certificado SSL automático
- ✅ HTTPS obligatorio
- ✅ Renovación automática

### Database
- ✅ Conexión interna encriptada
- ✅ Credenciales auto-generadas
- ✅ Backups automáticos

### Secrets
- ✅ JWT_SECRET auto-generado
- ✅ Variables de entorno encriptadas
- ✅ No se exponen en logs

## 📈 Escalabilidad

### Plan Free → Plan Starter ($7/mes)
- Sin spin down
- CPU dedicada
- 1GB RAM
- Más bandwidth

### Plan Free → Plan Pro ($25/mes)
- 4GB RAM
- Priority support
- Custom domains

## 🔄 CI/CD Automático

```
GitHub Push
     ↓
Render detecta cambio
     ↓
Auto-build
     ↓
Run tests (optional)
     ↓
Deploy
     ↓
Health check
     ↓
Live ✅
```

## 🎯 Comparación vs Local

| Característica | Docker Local | Render Cloud |
|----------------|--------------|--------------|
| Costo | Gratis | Gratis |
| Setup Time | 5 min | 15 min |
| Acceso | localhost | URL pública |
| SSL | No | Sí (automático) |
| Compartir | No | Sí |
| Persistencia | Volumen local | PostgreSQL cloud |
| Spin Down | No | Sí (15 min) |
| Auto-deploy | No | Sí (desde Git) |

## 📝 Checklist de Migración Local → Render

- [ ] Código en GitHub
- [ ] `.env` → Variables de entorno en Render
- [ ] `localhost` → URLs públicas
- [ ] `docker-compose.yml` → `render.yaml`
- [ ] PostgreSQL local → PostgreSQL Render
- [ ] Test local → Test en Render
- [ ] Swagger local → Swagger público

---

**Sistema**: Microservicios Bielas
**Cloud**: Render.com
**Costo**: $0/mes (Plan Free)
