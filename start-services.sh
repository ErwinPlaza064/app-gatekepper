#!/bin/bash

# Script para iniciar múltiples servicios en Railway
echo "🚀 Iniciando servicios de Gatekeeper..."

# Ejecutar migraciones
echo "📊 Ejecutando migraciones..."
php artisan migrate --force

# Crear directorios necesarios
echo "📁 Creando directorios de cache..."
mkdir -p storage/framework/cache/data
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p bootstrap/cache

# Limpiar caches
echo "🧹 Limpiando caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Función para iniciar el queue worker
start_queue_worker() {
    echo "⚡ Iniciando Queue Worker..."
    while true; do
        php artisan queue:work --verbose --tries=3 --timeout=90 --memory=512 --sleep=3 --max-jobs=1000 --max-time=3600
        echo "⚠️  Queue worker se detuvo. Reiniciando en 5 segundos..."
        sleep 5
    done
}

# Función para iniciar el servidor web
start_web_server() {
    echo "🌐 Iniciando servidor web..."
    php artisan serve --host=0.0.0.0 --port=$PORT
}

# Iniciar queue worker en segundo plano
start_queue_worker &
QUEUE_PID=$!

# Iniciar servidor web en primer plano
start_web_server &
WEB_PID=$!

# Función para manejar la terminación
cleanup() {
    echo "🛑 Deteniendo servicios..."
    kill $QUEUE_PID 2>/dev/null
    kill $WEB_PID 2>/dev/null
    exit 0
}

# Capturar señales de terminación
trap cleanup SIGTERM SIGINT

# Esperar a que termine cualquiera de los procesos
wait $WEB_PID
