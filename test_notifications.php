<?php

require_once 'vendor/autoload.php';

use App\Models\User;
use App\Models\Visitor;
use App\Notifications\VisitorApprovalRequest;

// Inicializar Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

echo "🧪 Probando sistema de notificaciones para residentes...\n\n";

try {
    // Buscar un usuario residente (no admin)
    $resident = User::where('rol', '!=', 'administrador')
        ->where('rol', '!=', 'admin')
        ->first();

    if (!$resident) {
        echo "❌ No se encontró un residente para la prueba\n";
        exit(1);
    }

    echo "✅ Usuario encontrado: {$resident->name} (ID: {$resident->id})\n";

    // Crear un visitante de prueba
    $visitor = Visitor::create([
        'name' => 'Juan Carlos Pérez',
        'id_document' => '12345678',
        'user_id' => $resident->id,
        'vehicle_plate' => 'ABC-123',
        'approval_notes' => 'Visitante de prueba para verificar notificaciones',
    ]);

    echo "✅ Visitante de prueba creado: {$visitor->name} (ID: {$visitor->id})\n";

    // Solicitar aprobación (esto debería enviar la notificación)
    $visitor->requestApproval('Esta es una prueba del sistema de notificaciones');

    echo "✅ Solicitud de aprobación enviada\n";

    // Verificar que la notificación se guardó en la base de datos
    $notification = $resident->notifications()
        ->where('data->visitor->id', $visitor->id)
        ->where('data->type', 'visitor_approval_request')
        ->first();

    if ($notification) {
        echo "✅ Notificación encontrada en la base de datos:\n";
        echo "   - ID: {$notification->id}\n";
        echo "   - Tipo: {$notification->data['type']}\n";
        echo "   - Título: {$notification->data['title']}\n";
        echo "   - Mensaje: {$notification->data['message']}\n";
        echo "   - Creada: {$notification->created_at}\n";
        echo "   - Leída: " . ($notification->read_at ? $notification->read_at : 'No') . "\n";
    } else {
        echo "❌ No se encontró la notificación en la base de datos\n";
        exit(1);
    }

    // Limpiar - eliminar el visitante de prueba
    $visitor->delete();
    echo "🧹 Visitante de prueba eliminado\n";

    echo "\n🎉 ¡Prueba completada exitosamente! Las notificaciones están funcionando correctamente.\n";

} catch (Exception $e) {
    echo "❌ Error durante la prueba: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
