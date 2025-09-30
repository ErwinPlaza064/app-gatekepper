#!/bin/bash

# Script de despliegue para Railway
# Este script debe ejecutarse después del build en Railway

echo "🚀 Starting Railway deployment script..."

# 1. Limpiar cache de configuración
echo "🧹 Clearing configuration cache..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# 2. Ejecutar migraciones
echo "📊 Running database migrations..."
php artisan migrate --force

# 3. Limpiar sesiones problemáticas
echo "🔧 Cleaning problematic sessions..."
php artisan sessions:clean-problems --force

# 4. Optimizar para producción
echo "⚡ Optimizing for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 5. Generar storage link si no existe
echo "🔗 Creating storage link..."
php artisan storage:link || echo "Storage link already exists"

# 6. Verificar permisos de directorios
echo "🔒 Setting directory permissions..."
chmod -R 755 storage bootstrap/cache
chmod -R 777 storage/logs storage/framework/sessions storage/framework/cache storage/framework/views

# 7. Compilar assets si es necesario
if [ -f "package.json" ]; then
    echo "📦 Installing and building frontend assets..."
    npm install --production
    npm run build
fi

# 8. Verificar configuración crítica
echo "✅ Verifying critical configuration..."
php artisan config:show session --json > /tmp/session_config.json
echo "Session driver: $(php artisan tinker --execute='echo config("session.driver");')"
echo "Session domain: $(php artisan tinker --execute='echo config("session.domain");')"
echo "App URL: $(php artisan tinker --execute='echo config("app.url");')"

echo "🎉 Railway deployment completed successfully!"
echo "💡 Make sure to set the following environment variables in Railway:"
echo "   - SESSION_DOMAIN=null"
echo "   - SESSION_SECURE=true"
echo "   - SESSION_SAME_SITE=lax"
echo "   - APP_URL=https://gatekepper.com"
