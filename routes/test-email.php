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
            'notifications_triggered' => 'Jobs scheduled asynchronously - check queue logs'
        ];

        return response()->json([
            'success' => true,
            'message' => 'Visitante creado exitosamente - notifications via jobs!',
            'debug' => $debug,
            'note' => 'Los emails se procesan en background via queue jobs. Revisar logs para confirmación.'
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

Route::get('/test-queue-email', function() {
    try {
        // Test directo del job de email
        \App\Jobs\SendEmailJob::dispatch(
            'erwinplaza064@gmail.com',
            '🧪 Test Queue Email - Gatekeeper',
            '<h1>Hola!</h1><p>Este es un email de prueba enviado via queue job.</p><p>Timestamp: ' . now() . '</p>'
        );

        return response()->json([
            'success' => true,
            'message' => 'Email job dispatched successfully',
            'note' => 'Email será procesado por el queue worker'
        ]);

    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::get('/test-approval-flow', function() {
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

        // Crear visitante SIN entry_time y SIN approval_status (para que pase por aprobación)
        $visitor = Visitor::create([
            'name' => 'Test Approval Flow ' . time(),
            'id_document' => 'APPROVAL' . time(),
            'user_id' => $user->id,
            'vehicle_plate' => 'APPR-001',
            // NO establecer entry_time - se establece cuando se aprueba
            'approval_notes' => 'Visitante de prueba para sistema de aprobación'
        ]);

        $visitorFresh = $visitor->fresh();
        $debug['visitor_created'] = [
            'id' => $visitor->id,
            'name' => $visitor->name,
            'status' => $visitorFresh->approval_status,
            'entry_time' => $visitorFresh->entry_time,
            'approval_token' => $visitorFresh->approval_token,
            'approve_url' => $visitorFresh->approval_token ? route('approval.approve.public', $visitorFresh->approval_token) : null,
            'reject_url' => $visitorFresh->approval_token ? route('approval.reject.public', $visitorFresh->approval_token) : null,
        ];

        return response()->json([
            'success' => true,
            'message' => 'Visitante creado correctamente',
            'debug' => $debug,
            'expected' => [
                'status' => 'pending',
                'entry_time' => null,
                'approval_token' => 'should_exist'
            ],
            'note' => 'El visitante debe estar en "pending" sin entry_time hasta ser aprobado.'
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

Route::get('/preview-email-design', function() {
    try {
        // Crear un visitante ficticio para preview
        $visitor = new \App\Models\Visitor([
            'name' => 'María García López',
            'id_document' => 'CC-12345678',
            'vehicle_plate' => 'ABC-123',
            'approval_notes' => 'Viene a entregar documentos importantes',
            'approval_token' => 'preview-token-123',
            'approval_requested_at' => now(),
        ]);

        $user = new \App\Models\User([
            'name' => 'Juan Carlos Pérez',
            'email' => 'residente@example.com'
        ]);

        // Crear el job para generar el HTML
        $job = new \App\Jobs\SendVisitorNotificationJob(0, 0, 'approval_request');

        // Usar reflection para acceder al método privado
        $reflection = new ReflectionClass($job);
        $method = $reflection->getMethod('buildApprovalRequestEmailContent');
        $method->setAccessible(true);

        $html = $method->invoke($job, $visitor, $user);

        // Mostrar el HTML directamente para preview
        return response($html)->header('Content-Type', 'text/html');

    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
});
