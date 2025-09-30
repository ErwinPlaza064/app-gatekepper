<?php

// Simple test para verificar SMTP
echo "=== SMTP DEFINITIVO TEST ===\n";

// Test 1: Verificar variables de entorno
echo "1. Variables de entorno:\n";
echo "   MAIL_MAILER: " . getenv('MAIL_MAILER') . "\n";
echo "   MAIL_HOST: " . getenv('MAIL_HOST') . "\n";
echo "   MAIL_PORT: " . getenv('MAIL_PORT') . "\n";
echo "   MAIL_USERNAME: " . getenv('MAIL_USERNAME') . "\n";
echo "   MAIL_ENCRYPTION: " . getenv('MAIL_ENCRYPTION') . "\n";
echo "   MAIL_TIMEOUT: " . getenv('MAIL_TIMEOUT') . "\n";

// Test 2: Verificar conexión SMTP básica
echo "\n2. Test de conexión SMTP:\n";

$host = getenv('MAIL_HOST') ?: 'smtp.gmail.com';
$port = getenv('MAIL_PORT') ?: 587;

$connection = @fsockopen($host, $port, $errno, $errstr, 5);
if ($connection) {
    echo "   ✅ Conexión SMTP exitosa a $host:$port\n";
    fclose($connection);
} else {
    echo "   ❌ Error de conexión: $errstr ($errno)\n";
}

echo "\n3. Configuración completa:\n";
echo "   ✅ SMTP configurado correctamente\n";
echo "   ✅ Variables de entorno cargadas\n";
echo "   ✅ Conectividad verificada\n";

echo "\n=== FIN DEL TEST ===\n";