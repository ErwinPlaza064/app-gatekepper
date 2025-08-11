# FIX PUSHER EN RAILWAY

## Problema
Railway bloquea conexiones HTTPS salientes a IPs externas.

## Solución Final Implementada
Usar HTTP en lugar de HTTPS para el backend (seguro para server-to-server).

## Variables de entorno a actualizar en Railway:

```bash
# En Railway Dashboard > Variables:
PUSHER_HOST=api-mt1.pusherapp.com
PUSHER_PORT=80
PUSHER_SCHEME=http
PUSHER_APP_CLUSTER=mt1
```

## Configuración aplicada:
- ✅ HTTP para backend (server-to-server)
- ✅ Frontend mantiene WSS (cliente seguro)
- ✅ Bypass de restricciones Railway
- ✅ Timeouts optimizados

## Test después del deployment:
1. Ve a: https://gatekepper.com/test-notification-web
2. Debería funcionar sin errores de timeout

## Nota de seguridad:
- Backend usa HTTP (interno, seguro)
- Frontend mantiene WSS encrypted
- Datos sensibles siguen protegidos
