<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Foundation\Console\Kernel::class)->bootstrap();

use App\Models\Visitor;
use App\Models\User; 
use App\Jobs\SendVisitorNotificationJob;
use Illuminate\Support\Facades\Log;

try {
    echo "🔍 Probando creación de visitante completa...\n";
    
    // Buscar un usuario admin
    $admin = User::where('email', 'plazaerwin41@gmail.com')->first();
    if (!$admin) {
        echo "❌ No se encontró usuario admin\n";
        exit(1);
    }
    
    echo "✅ Usuario admin encontrado: {$admin->name}\n";
    
    // Crear visitante de prueba
    $visitor = new Visitor([
        'name' => 'Test Visitor SMTP',
        'id_document' => '12345678',
        'user_id' => $admin->id,
        'entry_time' => now(),
        'status' => 'pending'
    ]);
    
    $visitor->save();
    echo "✅ Visitante creado con ID: {$visitor->id}\n";
    
    // Disparar el job manualmente
    echo "📧 Disparando job de notificación...\n";
    SendVisitorNotificationJob::dispatch($visitor);
    
    echo "✅ Job despachado exitosamente!\n";
    echo "📬 Revisa los logs para ver si el email se envió correctamente\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "📋 Detalles del error:\n";
    echo $e->getTraceAsString() . "\n";
}