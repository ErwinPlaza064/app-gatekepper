<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use App\Models\Visitor;
use App\Notifications\NewVisitorNotification;
use App\Notifications\VisitorApprovalRequest;

/*
|--------------------------------------------------------------------------
| Test Email Routes
|--------------------------------------------------------------------------
|
| Estas rutas son para probar el sistema de correos electrónicos en producción
| Eliminar después de confirmar que todo funciona correctamente
|
*/

Route::get('/test-sendgrid-basic', function() {
    try {
        $debug = [];

        // 1. Verificar configuración
        $debug['mail_config'] = [
            'default_mailer' => config('mail.default'),
            'sendgrid_configured' => config('mail.mailers.sendgrid') ? 'YES' : 'NO',
            'from_address' => config('mail.from.address'),
            'from_name' => config('mail.from.name'),
            'sendgrid_api_key' => env('SENDGRID_API_KEY') ? 'CONFIGURED' : 'NOT SET',
        ];

        // 2. Test directo con Mail::raw
        Mail::raw('🧪 Test básico SendGrid - ' . now()->format('Y-m-d H:i:s'), function ($message) {
            $message->to('erwinplaza064@gmail.com') // Usar tu email para prueba
                    ->subject('🧪 Test SendGrid - Gatekeeper')
                    ->from(config('mail.from.address'), config('mail.from.name'));
        });

        $debug['basic_email'] = 'SUCCESS - Email básico enviado';

        return response()->json([
            'success' => true,
            'message' => 'Email de prueba enviado correctamente',
            'debug' => $debug
        ]);

    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'line' => $e->getLine(),
            'file' => basename($e->getFile())
        ], 500);
    }
});

Route::get('/test-visitor-notification', function() {
    try {
        $debug = [];

        // Buscar un usuario para probar
        $user = User::where('email', '!=', null)->first();
        if (!$user) {
            throw new Exception('No se encontró ningún usuario con email');
        }

        $debug['user'] = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ];

        // Crear visitante de prueba
        $visitor = new Visitor([
            'name' => 'Visitante Test Email',
            'id_document' => 'EMAIL' . time(),
            'approval_token' => 'test-' . time(),
            'approval_requested_at' => now(),
            'vehicle_plate' => 'TEST-001',
            'approval_notes' => 'Prueba de notificación por email'
        ]);

        $visitor->user = $user; // Simular relación

        // Test notificación de nuevo visitante
        $user->notify(new NewVisitorNotification($visitor));
        $debug['new_visitor_notification'] = 'SUCCESS';

        // Test notificación de solicitud de aprobación
        $user->notify(new VisitorApprovalRequest($visitor));
        $debug['approval_request_notification'] = 'SUCCESS';

        return response()->json([
            'success' => true,
            'message' => 'Notificaciones de visitante enviadas correctamente',
            'debug' => $debug
        ]);

    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'line' => $e->getLine(),
            'file' => basename($e->getFile())
        ], 500);
    }
});

Route::get('/test-create-visitor-flow', function() {
    try {
        $debug = [];

        // Buscar un usuario residente
        $user = User::where('rol', '!=', 'administrador')
                   ->where('email', '!=', null)
                   ->first();

        if (!$user) {
            throw new Exception('No se encontró ningún residente con email');
        }

        $debug['resident'] = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ];

        // Crear visitante como lo haría Filament
        $visitor = Visitor::create([
            'name' => 'Test Visitor Email Flow',
            'id_document' => 'FLOW' . time(),
            'user_id' => $user->id,
            'vehicle_plate' => 'FLOW-001',
            'entry_time' => now(),
            'approval_status' => 'approved',
            'approval_responded_at' => now(),
            'approved_by' => 1, // Simular admin
            'approval_notes' => 'Creado desde test para verificar flujo completo'
        ]);

        $debug['visitor_created'] = [
            'id' => $visitor->id,
            'name' => $visitor->name,
            'status' => $visitor->approval_status,
            'notifications_triggered' => 'Should be automatic via model events'
        ];

        return response()->json([
            'success' => true,
            'message' => 'Visitante creado exitosamente - revisar email',
            'debug' => $debug
        ]);

    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'line' => $e->getLine(),
            'file' => basename($e->getFile())
        ], 500);
    }
});
