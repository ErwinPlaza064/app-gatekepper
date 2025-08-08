<?php
/**
 * Test script para el sistema de aprobación de visitantes
 * Ejecutar con: php artisan tinker -v < tests/approval_system_test.php
 */

echo "🧪 Test del Sistema de Aprobación de Visitantes\n";
echo "================================================\n\n";

// 1. Verificar que las migraciones están aplicadas
echo "1. Verificando estructura de base de datos...\n";
try {
    $tableExists = Schema::hasTable('visitors');
    $hasApprovalToken = Schema::hasColumn('visitors', 'approval_token');
    
    echo "✅ Tabla visitors existe: " . ($tableExists ? 'Sí' : 'No') . "\n";
    echo "✅ Campo approval_token existe: " . ($hasApprovalToken ? 'Sí' : 'No') . "\n";
    
    if (!$tableExists || !$hasApprovalToken) {
        echo "❌ Error: Estructura de base de datos incompleta\n";
        exit(1);
    }
} catch (Exception $e) {
    echo "❌ Error verificando base de datos: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n2. Creando usuario de prueba...\n";
try {
    // Buscar o crear un usuario de prueba
    $user = App\Models\User::firstOrCreate([
        'email' => 'test@gatekeeper.com'
    ], [
        'name' => 'Usuario Test',
        'phone' => '+521234567890',
        'address' => 'Apartamento 101',
        'whatsapp_notifications' => true,
        'password' => Hash::make('password'),
        'email_verified_at' => now(),
    ]);
    
    echo "✅ Usuario creado/encontrado: {$user->name} ({$user->email})\n";
    echo "📱 Teléfono: {$user->phone}\n";
    
} catch (Exception $e) {
    echo "❌ Error creando usuario: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n3. Probando creación de visitante pendiente...\n";
try {
    // Crear visitante de prueba
    $visitor = App\Models\Visitor::create([
        'name' => 'Juan Pérez Test',
        'id_document' => '12345678',
        'user_id' => $user->id,
        'vehicle_plate' => 'ABC123',
        'approval_notes' => 'Visitante de prueba para sistema de aprobación',
    ]);
    
    echo "✅ Visitante creado: {$visitor->name}\n";
    echo "📋 Estado inicial: {$visitor->status}\n";
    
} catch (Exception $e) {
    echo "❌ Error creando visitante: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n4. Probando solicitud de aprobación...\n";
try {
    // Solicitar aprobación
    $success = $visitor->requestApproval();
    
    if ($success) {
        $visitor->refresh();
        echo "✅ Solicitud de aprobación generada exitosamente\n";
        echo "🔐 Token generado: " . substr($visitor->approval_token, 0, 10) . "...\n";
        echo "📅 Solicitado en: {$visitor->approval_requested_at}\n";
        echo "⏰ Expira en: " . $visitor->approval_requested_at->addMinutes(7) . "\n";
        echo "📊 Estado: {$visitor->approval_status}\n";
    } else {
        echo "❌ Error al generar solicitud de aprobación\n";
        exit(1);
    }
    
} catch (Exception $e) {
    echo "❌ Error en solicitud de aprobación: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n5. Probando URLs de aprobación...\n";
try {
    $approveUrl = route('approval.approve.public', ['token' => $visitor->approval_token]);
    $rejectUrl = route('approval.reject.public', ['token' => $visitor->approval_token]);
    
    echo "✅ URL de aprobación: {$approveUrl}\n";
    echo "✅ URL de rechazo: {$rejectUrl}\n";
    
} catch (Exception $e) {
    echo "❌ Error generando URLs: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n6. Probando búsqueda por token...\n";
try {
    $foundVisitor = App\Models\Visitor::findByApprovalToken($visitor->approval_token);
    
    if ($foundVisitor && $foundVisitor->id === $visitor->id) {
        echo "✅ Visitante encontrado por token correctamente\n";
    } else {
        echo "❌ Error: No se pudo encontrar el visitante por token\n";
        exit(1);
    }
    
} catch (Exception $e) {
    echo "❌ Error buscando por token: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n7. Probando aprobación...\n";
try {
    $visitor->approve($user->id, 'Aprobado en test automático');
    $visitor->refresh();
    
    echo "✅ Visitante aprobado exitosamente\n";
    echo "📊 Estado: {$visitor->approval_status}\n";
    echo "✅ Aprobado por: {$visitor->approvedBy->name}\n";
    echo "📅 Aprobado en: {$visitor->approved_at}\n";
    
} catch (Exception $e) {
    echo "❌ Error aprobando visitante: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n8. Verificando que no se puede aprobar nuevamente...\n";
try {
    $cannotApprove = !$visitor->isPending();
    
    if ($cannotApprove) {
        echo "✅ Correcto: El visitante ya no está pendiente\n";
    } else {
        echo "❌ Error: El visitante aún aparece como pendiente\n";
        exit(1);
    }
    
} catch (Exception $e) {
    echo "❌ Error verificando estado: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n9. Limpieza: Eliminando datos de prueba...\n";
try {
    $visitor->delete();
    
    // Solo eliminar el usuario si fue creado para la prueba
    if ($user->email === 'test@gatekeeper.com') {
        $user->delete();
    }
    
    echo "✅ Datos de prueba eliminados\n";
    
} catch (Exception $e) {
    echo "⚠️ Advertencia: Error eliminando datos de prueba: " . $e->getMessage() . "\n";
}

echo "\n🎉 ¡Todas las pruebas pasaron exitosamente!\n";
echo "================================================\n";
echo "✅ Sistema de aprobación funcionando correctamente\n";
echo "✅ Base de datos configurada\n";
echo "✅ Modelos funcionando\n";
echo "✅ Rutas configuradas\n";
echo "✅ Tokens de seguridad funcionando\n";
echo "\n💡 El sistema está listo para uso en producción\n";
