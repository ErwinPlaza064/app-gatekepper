# FIX PUSHER EN RAILWAY

## Problema
Railway no puede resolver DNS de Pusher: `Could not resolve host: api-mt1.pusherapp.com`

## Solución Implementada
Usar IP directa en lugar de hostname DNS.

## Variables de entorno a agregar en Railway:

```bash
# En Railway Dashboard > Variables:
PUSHER_HOST=18.215.109.111
PUSHER_APP_CLUSTER=mt1
```

## Configuración aplicada:
- ✅ IP directa: 18.215.109.111 (api-mt1.pusherapp.com)
- ✅ Header Host para SSL
- ✅ Verificación SSL deshabilitada para IP
- ✅ Timeouts optimizados

## Test después del deployment:
1. Ve a: https://gatekepper.com/test-notification-web
2. Debería funcionar sin errores DNS

## Alternativa si no funciona:
Cambiar a cluster 'us2' con IP: 54.236.171.222
