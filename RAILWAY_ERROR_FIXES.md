# 🔧 Soluciones para Errores de Producción en Railway

Este documento describe las soluciones implementadas para los errores 419, 403 y 500 que ocurren en producción.

## 🐛 Errores Identificados

### 1. Error 419 - CSRF Token Mismatch

-   **Causa**: Configuración incorrecta de sesiones y dominios
-   **Síntoma**: `/login` y `/logout` fallan con status 419

### 2. Error 403 - Forbidden

-   **Causa**: Problemas de autenticación en `/broadcasting/auth`
-   **Síntoma**: WebSockets no pueden autenticarse

### 3. Error 500 - Internal Server Error

-   **Causa**: Problemas de sesión en primer login
-   **Síntoma**: Primer login falla, luego funciona normalmente

### 4. Warning CSS Preload

-   **Causa**: CSS preloadeado no se usa inmediatamente
-   **Síntoma**: Warning en console del navegador

## ✅ Soluciones Implementadas

### 1. Configuración de Sesiones Mejorada

```bash
# Variables de entorno en Railway
SESSION_DOMAIN=null  # ← Cambio crítico
SESSION_SECURE=true
SESSION_SAME_SITE=lax
SESSION_DRIVER=database
```

### 2. Manejo Mejorado de Errores CSRF

-   **Middleware personalizado** que captura errores 419
-   **Auto-renovación de tokens CSRF** en el frontend
-   **Reintentos automáticos** de peticiones fallidas

### 3. Sistema de Recuperación de Errores Frontend

```javascript
// Incluido automáticamente en bootstrap.js
// Maneja errores 419 y 403 automáticamente
// Renueva tokens CSRF sin intervención del usuario
```

### 4. Logging y Debugging Mejorado

-   Logs detallados para errores de broadcasting
-   Información de sesión en cada error
-   Tracking de intentos de renovación de tokens

### 5. Comandos de Mantenimiento

```bash
# Limpiar sesiones problemáticas
php artisan sessions:clean-problems

# Limpiar con regeneración de key
php artisan sessions:clean-problems --force
```

## 🚀 Despliegue en Railway

### Variables de Entorno Críticas

Configurar en Railway Dashboard:

```bash
SESSION_DOMAIN=null
SESSION_SECURE=true
SESSION_SAME_SITE=lax
APP_URL=https://gatekepper.com
BROADCAST_DRIVER=pusher
```

### Script de Despliegue

```bash
# Ejecutar después de cada deploy
./deploy-railway.sh
```

### Build Command en Railway

```bash
npm run build && php artisan config:cache
```

### Start Command en Railway

```bash
php artisan serve --host=0.0.0.0 --port=$PORT
```

## 🔍 Verificación de Soluciones

### 1. Verificar Configuración de Sesiones

```bash
php artisan config:show session
```

### 2. Verificar CSRF Tokens

```bash
curl -X GET https://gatekepper.com/csrf-token
```

### 3. Verificar Broadcasting Auth

```bash
# Debe retornar 403 si no autenticado
curl -X POST https://gatekepper.com/broadcasting/auth
```

### 4. Verificar Logs

```bash
php artisan log:show --lines=50
```

## 🛠️ Troubleshooting

### Si persisten errores 419:

1. Verificar `SESSION_DOMAIN=null` en Railway
2. Ejecutar `php artisan sessions:clean-problems --force`
3. Verificar que `CSRF-TOKEN` se incluye en headers

### Si persisten errores 403:

1. Verificar autenticación del usuario
2. Revisar logs de `broadcasting.auth`
3. Verificar configuración de Pusher

### Si persisten errores 500:

1. Revisar logs de Laravel: `storage/logs/laravel.log`
2. Verificar permisos de directorios de sesiones
3. Ejecutar `php artisan cache:clear`

## 📋 Checklist Post-Deploy

-   [ ] Variables de entorno configuradas correctamente
-   [ ] Script de deploy ejecutado
-   [ ] Sesiones limpias
-   [ ] Cache optimizado
-   [ ] Logs sin errores críticos
-   [ ] Frontend funcionando sin errores CSRF
-   [ ] WebSockets conectando correctamente

## 🔄 Mantenimiento Automatizado

El sistema incluye:

-   **Limpieza automática** de sesiones problemáticas (diariamente a las 3:00 AM)
-   **Renovación automática** de tokens CSRF en el frontend
-   **Reintentos automáticos** de peticiones fallidas
-   **Logging detallado** para debugging

## 📞 Soporte

Si los errores persisten después de implementar estas soluciones:

1. Revisar logs detallados
2. Verificar configuración de Railway
3. Ejecutar comandos de diagnóstico
4. Contactar soporte técnico con logs específicos
