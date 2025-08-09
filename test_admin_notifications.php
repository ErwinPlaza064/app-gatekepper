<?php
// Test para probar las notificaciones de administradores

use App\Models\User;
use App\Models\Visitor;
use App\Notifications\AdminVisitorStatusNotification;

echo "🧪 Probando sistema de notificaciones de administradores...\n\n";

// Buscar un administrador
$admin = User::where('rol', 'administrador')->first();
if (!$admin) {
    echo "❌ No se encontró ningún administrador\n";
    exit(1);
}

echo "✅ Administrador encontrado: {$admin->name}\n";

// Buscar un visitante o crear uno de prueba
$visitor = Visitor::latest()->first();
if (!$visitor) {
    echo "⚠️ No hay visitantes en el sistema, creando uno de prueba...\n";

    $residente = User::where('rol', '!=', 'administrador')->first();
    if (!$residente) {
        echo "❌ No hay residentes para crear visitante de prueba\n";
        exit(1);
    }

    $visitor = Visitor::create([
        'name' => 'Visitante de Prueba',
        'id_document' => '12345678',
        'user_id' => $residente->id,
        'vehicle_plate' => 'TEST123',
        'approval_status' => 'approved',
        'approval_responded_at' => now(),
        'approved_by' => $residente->id,
        'approval_notes' => 'Aprobado en prueba del sistema de notificaciones',
        'entry_time' => now(),
    ]);
}

echo "✅ Visitante: {$visitor->name}\n";

// Enviar notificación de prueba
echo "📤 Enviando notificación de prueba...\n";

try {
    // Crear notificación
    $notification = new AdminVisitorStatusNotification($visitor, 'approved', $visitor->user);

    // Enviar notificación tradicional
    $admin->notify($notification);

    // Enviar notificación de Filament
    $notification->sendFilamentNotification($admin);

    echo "✅ Notificación enviada correctamente!\n";
    echo "🎯 El administrador '{$admin->name}' debería ver la notificación en el panel de Filament\n";
    echo "🔔 Revisa el panel en: /admin\n\n";

    // Mostrar información de la notificación
    echo "📋 Detalles de la notificación:\n";
    echo "   - Visitante: {$visitor->name}\n";
    echo "   - Estado: Aprobado\n";
    echo "   - Residente: {$visitor->user->name}\n";
    echo "   - Administrador notificado: {$admin->name}\n\n";

    echo "🎉 Prueba completada exitosamente!\n";

} catch (Exception $e) {
    echo "❌ Error enviando notificación: " . $e->getMessage() . "\n";
    exit(1);
}
