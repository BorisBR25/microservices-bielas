# ❓ Preguntas Frecuentes - Deployment en Render

## 🚀 Deployment

### ¿Cuánto cuesta desplegar en Render?
**$0/mes** usando el plan Free:
- 1 PostgreSQL (1GB)
- 5 Web Services (750 hrs/mes cada uno)
- 100GB bandwidth compartido
- SSL incluido

### ¿Cuánto tiempo tarda el primer deploy?
Aproximadamente **10-15 minutos**:
- Crear base de datos: 2-3 min
- Build de cada servicio: 1-2 min c/u
- Total: ~15 min

### ¿Necesito tarjeta de crédito?
**No**. El plan Free no requiere tarjeta de crédito.

### ¿Puedo desplegar solo el API Gateway?
Sí, pero no funcionará correctamente. Necesitas **todos los servicios** porque el Gateway llama a los microservicios reales.

Si solo quieres Swagger funcional sin microservicios, contacta para una versión "mock".

## 🔧 Configuración

### ¿Qué es render.yaml?
Es un archivo "Blueprint" que define toda tu infraestructura:
- Base de datos
- Servicios web
- Variables de entorno
- Conexiones entre servicios

Render lo detecta automáticamente y crea todo en un solo paso.

### ¿Cómo actualizo las URLs después del primer deploy?
1. Render asigna URLs únicas tipo `https://servicio-xxxx.onrender.com`
2. Debes copiar estas URLs y actualizarlas en las variables de entorno
3. Ejemplo para API Gateway:
   - `AUTH_SERVICE_URL` = URL real de auth-service
   - `SOLICITUDES_SERVICE_URL` = URL real de solicitudes-service
4. Haz "Manual Deploy" en cada servicio después de actualizar

### ¿Por qué mis servicios no se comunican?
Causas comunes:
1. **URLs incorrectas**: Verifica que las variables de entorno tengan las URLs reales
2. **Servicios dormidos**: El plan Free tiene "spin down". Primera petición puede tardar 30-50s
3. **HTTPS obligatorio**: Usa `https://` no `http://`

## 💾 Base de Datos

### ¿Los datos se borran al redesplegar?
**No**. La base de datos PostgreSQL persiste los datos. Solo se borran si eliminas la base de datos manualmente.

### ¿Cómo accedo a la base de datos?
Render provee credenciales:
- **Internal URL**: Para servicios dentro de Render
- **External URL**: Para conexión desde tu máquina (pgAdmin, DBeaver, etc.)

Usa la **Internal URL** en tus servicios.

### ¿Puedo hacer backup de la base de datos?
Sí:
- Plan Free: Backups manuales via `pg_dump`
- Plan Starter+: Backups automáticos diarios

### ¿Qué pasa si lleno el 1GB del plan Free?
La base de datos dejará de aceptar escrituras. Necesitarás:
1. Limpiar datos antiguos
2. Upgrade a plan Starter (más storage)

## ⚡ Performance

### ¿Por qué la primera petición es tan lenta?
**Spin Down**. El plan Free duerme servicios después de 15 min sin uso. Despertar toma 30-50s.

**Solución**: Usa un servicio de ping como UptimeRobot para mantener activo el API Gateway.

### ¿Cómo evitar el spin down?
**Opción 1**: Servicio de ping externo (UptimeRobot, Pingdom)
```
URL: https://tu-api-gateway.onrender.com/health
Frecuencia: cada 10 minutos
```

**Opción 2**: Upgrade a plan Starter ($7/mes) - no tiene spin down

### ¿El sistema es lento en producción?
El plan Free tiene recursos limitados:
- CPU compartida
- 512MB RAM por servicio
- Spin down después de 15 min

Para producción real, considera:
- Plan Starter: $7/mes por servicio
- Plan Pro: $25/mes por servicio

## 🔐 Seguridad

### ¿Render es seguro?
Sí:
- SSL/TLS automático
- Credenciales encriptadas
- Conexiones internas privadas
- Compliance: SOC 2, GDPR

### ¿Cómo protejo mis variables de entorno?
Render encripta todas las variables de entorno. Nunca se muestran en logs.

### ¿Puedo usar mi propio dominio?
Sí, con planes pagos:
- Plan Starter+: Custom domain
- SSL automático incluido

## 📊 Monitoreo

### ¿Cómo veo los logs?
En el dashboard de Render:
1. Selecciona el servicio
2. Tab "Logs"
3. Logs en tiempo real

También puedes filtrar por:
- Error
- Warning
- Info

### ¿Hay métricas disponibles?
Sí, Render provee:
- CPU usage
- Memory usage
- Bandwidth
- Request count
- Response time (planes pagos)

### ¿Puedo configurar alertas?
Planes pagos tienen alertas para:
- Service down
- High CPU
- High memory
- Build failures

## 🔄 Updates

### ¿Cómo actualizo mi código?
**Auto-deploy** desde GitHub:
```bash
git add .
git commit -m "Update"
git push origin main
```
Render detecta el push y despliega automáticamente.

### ¿Puedo hacer rollback?
Sí:
1. Ve al servicio en Render
2. Tab "Deploys"
3. Click en deploy anterior
4. "Redeploy"

### ¿Cómo desactivo auto-deploy?
En configuración del servicio:
- Settings → Auto-Deploy → Off

Luego haz deploy manualmente cuando quieras.

## 💰 Costos

### ¿Cuándo necesitaré pagar?
Plan Free es suficiente para:
- Demos
- Portfolios
- Proyectos pequeños
- Testing

Necesitarás pago si:
- Tráfico alto (>100GB/mes)
- Necesitas 24/7 uptime (sin spin down)
- Quieres custom domain
- Requieres más de 1GB en base de datos

### ¿Cuál es el costo mensual completo?
Para este sistema (5 servicios + 1 DB):

**Plan Free**: $0/mes
- Limitado por spin down y recursos

**Plan Starter**: ~$42/mes
- 5 servicios × $7 = $35
- PostgreSQL Starter: $7
- Total: $42/mes

**Plan Pro**: ~$132/mes
- 5 servicios × $25 = $125
- PostgreSQL Pro: $7
- Total: $132/mes

## 🛠️ Troubleshooting

### Error: "Build failed"
Causas comunes:
1. Dependencias faltantes en `package.json`
2. Error en `build command`
3. TypeScript errors

**Solución**: Revisa los logs del build en Render.

### Error: "Service unavailable"
1. Servicio dormido (spin down) - espera 30-50s
2. Build falló - revisa logs
3. Crash loop - revisa errores de runtime

### Error: "Database connection failed"
1. Credenciales incorrectas
2. Usa "Internal URL" no "External"
3. Base de datos aún inicializando (espera 2-3 min)

### Swagger no muestra endpoints
1. API Gateway no está corriendo - revisa logs
2. URLs de servicios incorrectas - verifica env vars
3. CORS issue - revisa configuración

### "Cannot communicate with [servicio]"
1. URL del servicio incorrecta en env var
2. Servicio dormido - primera petición lenta
3. HTTPS no configurado - debe ser `https://`

## 📚 Recursos

### ¿Dónde encuentro más ayuda?
- **Render Docs**: https://render.com/docs
- **Community**: https://community.render.com
- **Status**: https://status.render.com

### ¿Render tiene límite de requests?
Plan Free:
- No hay límite hard de requests
- Pero CPU/RAM limitados
- Puede throttlear si abusas

### ¿Puedo usar Render para producción real?
Sí, empresas grandes usan Render. Pero:
- **Plan Free**: Solo para demos/testing
- **Plan Starter+**: Para producción real

## 🎯 Mejores Prácticas

### Configuración Inicial
✅ Usa render.yaml para infraestructura como código
✅ Configura variables de entorno desde el inicio
✅ Habilita auto-deploy desde rama main/master
✅ Configura health checks

### Seguridad
✅ Nunca commits secretos en código
✅ Usa variables de entorno para credenciales
✅ Genera JWT_SECRET aleatorio
✅ Mantén dependencias actualizadas

### Performance
✅ Habilita ping service para evitar spin down
✅ Optimiza queries a base de datos
✅ Usa índices en tablas
✅ Cache respuestas cuando posible

### Monitoreo
✅ Revisa logs regularmente
✅ Configura alertas (planes pagos)
✅ Monitorea uso de base de datos
✅ Track errores en producción

---

**¿Más preguntas?** Abre un issue en el repositorio o consulta la documentación oficial de Render.
