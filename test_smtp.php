<?php

require_once 'vendor/autoload.php';

// Cargar configuración de Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Foundation\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

try {
    echo "🔍 Probando configuración SMTP...\n";

    // Verificar configuración
    echo "✅ MAIL_MAILER: " . config('mail.default') . "\n";
    echo "✅ MAIL_HOST: " . config('mail.mailers.smtp.host') . "\n";
    echo "✅ MAIL_PORT: " . config('mail.mailers.smtp.port') . "\n";
    echo "✅ MAIL_ENCRYPTION: " . config('mail.mailers.smtp.encryption') . "\n";
    echo "✅ MAIL_USERNAME: " . config('mail.mailers.smtp.username') . "\n";
    echo "✅ MAIL_TIMEOUT: " . config('mail.mailers.smtp.timeout') . "\n";

    // Enviar email de prueba
    echo "\n📧 Enviando email de prueba...\n";

    Mail::raw('Este es un email de prueba desde Railway', function ($message) {
        $message->to('plazaerwin41@gmail.com')
                ->subject('🧪 Prueba SMTP - Railway')
                ->from('plazaerwin41@gmail.com', 'Gatekepper Test');
    });

    echo "✅ ¡Email enviado exitosamente!\n";
    echo "📬 Revisa tu bandeja de entrada en plazaerwin41@gmail.com\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    // Evitar imprimir stack trace que puede causar problemas de formato
    error_log("SMTP Test Error: " . $e->getMessage());
}
