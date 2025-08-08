<?php
/**
 * Script de prueba para el sistema de notificaciones de aprobación
 * Ejecutar con: php artisan tinker < tests/test_frontend_approval.php
 */

echo "🧪 Test del Sistema de Notificaciones de Aprobación Frontend\n";
echo "==========================================================\n\n";

// 1. Crear o buscar usuario de prueba
echo "1. Preparando usuario de prueba...\n";
try {
    $user = App\Models\User::firstOrCreate([
        'email' => 'residente.test@gatekeeper.com'
    ], [
        'name' => 'Residente Test',
        'phone' => '+521234567890',
        'address' => 'Apartamento 202',
        'whatsapp_notifications' => true,
        'password' => Hash::make('password'),
        'email_verified_at' => now(),
    ]);
    
    echo "✅ Usuario: {$user->name} ({$user->email})\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n2. Creando visitante de prueba...\n";
try {
    $visitor = App\Models\Visitor::create([
        'name' => 'María González Test',
        'id_document' => '87654321',
        'user_id' => $user->id,
        'vehicle_plate' => 'XYZ789',
        'approval_notes' => 'Visitante de prueba para notificaciones del frontend',
    ]);
    
    echo "✅ Visitante: {$visitor->name}\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n3. Solicitando aprobación (con notificación frontend)...\n";
try {
    // Solicitar aprobación
    $visitor->requestApproval();
    
    // Enviar notificación al residente
    $user->notify(new App\Notifications\VisitorApprovalRequest($visitor));
    
    echo "✅ Solicitud enviada con token: " . substr($visitor->approval_token, 0, 10) . "...\n";
    echo "✅ Notificación enviada al frontend\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n4. Verificando notificación en base de datos...\n";
try {
    $notification = $user->notifications()
        ->where('type', 'App\Notifications\VisitorApprovalRequest')
        ->latest()
        ->first();
    
    if ($notification) {
        echo "✅ Notificación creada en base de datos\n";
        echo "📋 ID: {$notification->id}\n";
        echo "📄 Tipo: {$notification->type}\n";
        echo "📅 Creada: {$notification->created_at}\n";
        echo "👁️ Leída: " . ($notification->read_at ? 'Sí' : 'No') . "\n";
        
        $data = $notification->data;
        echo "📊 Datos:\n";
        echo "   - Tipo: {$data['type']}\n";
        echo "   - Mensaje: {$data['message']}\n";
        echo "   - Visitante: {$data['visitor']['name']}\n";
        echo "   - Documento: {$data['visitor']['id_document']}\n";
        echo "   - Acciones disponibles: " . count($data['actions']) . "\n";
        
        foreach ($data['actions'] as $action) {
            echo "     • {$action['label']} ({$action['type']}): {$action['url']}\n";
        }
        
    } else {
        echo "❌ No se encontró la notificación\n";
        exit(1);
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n5. Probando URLs de la notificación...\n";
try {
    $approveUrl = route('approval.approve.public', $visitor->approval_token);
    $rejectUrl = route('approval.reject.public', $visitor->approval_token);
    
    echo "✅ URL de aprobación: {$approveUrl}\n";
    echo "✅ URL de rechazo: {$rejectUrl}\n";
    
} catch (Exception $e) {
    echo "❌ Error generando URLs: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n6. Limpieza...\n";
try {
    // Eliminar la notificación
    if (isset($notification)) {
        $notification->delete();
    }
    
    // Eliminar visitante
    $visitor->delete();
    
    // Solo eliminar usuario si es de prueba
    if ($user->email === 'residente.test@gatekeeper.com') {
        $user->delete();
    }
    
    echo "✅ Datos de prueba eliminados\n";
    
} catch (Exception $e) {
    echo "⚠️ Advertencia eliminando datos: " . $e->getMessage() . "\n";
}

echo "\n🎉 ¡Test completado exitosamente!\n";
echo "====================================\n";
echo "✅ Sistema de notificaciones funcionando\n";
echo "✅ Notificaciones se crean en la base de datos\n";
echo "✅ URLs públicas generadas correctamente\n";
echo "✅ Datos estructurados para el frontend\n";
echo "\n💡 El residente ahora puede:\n";
echo "   • Ver notificaciones en tiempo real\n";
echo "   • Aprobar/rechazar desde el panel web\n";
echo "   • Recibir WhatsApp como respaldo\n";
echo "   • Ver tiempo restante para decidir\n";
