<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VisitorController;
use App\Http\Controllers\QrCodeController;
use App\Http\Controllers\ApprovalController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ContactController;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;


Route::get('/check-auth', function () {
    if (Auth::check()) {
        $user = Auth::user();
        return "Autenticado: {$user->email}, Rol: {$user->rol}";
    }
    return 'No autenticado';
});

Route::get('/test-whatsapp', function() {
    $whatsapp = new \App\Services\WhatsAppService();

    // FORMATO CORRECTO SIN +52
    $resultado = $whatsapp->enviarMensaje('4641226304', '🎉 ¡Prueba de WhatsApp desde Gatekeeper! 🎉');

    return response()->json($resultado);
});

Route::get('/debug-approval-system', function() {
    try {
        $debug = [];

        // 1. Verificar configuración de queue
        $debug['queue_connection'] = config('queue.default');
        $debug['queue_driver'] = config("queue.connections.{$debug['queue_connection']}.driver");

        // 2. Verificar cantidad de jobs en cola
        $debug['jobs_pendientes'] = DB::table('jobs')->count();
        $debug['jobs_fallidos'] = DB::table('failed_jobs')->count();

        // 3. Buscar usuario de prueba
        $user = \App\Models\User::where('phone', '4641226304')->first();
        if (!$user) {
            throw new \Exception('Usuario con teléfono 4641226304 no encontrado');
        }

        $debug['usuario_encontrado'] = [
            'id' => $user->id,
            'name' => $user->name,
            'phone' => $user->phone,
            'whatsapp_notifications' => $user->whatsapp_notifications
        ];

        // 4. Crear visitante de prueba
        $visitor = new \App\Models\Visitor([
            'name' => 'Debug Test Visitor',
            'id_document' => 'DEBUG123',
            'user_id' => $user->id,
            'entry_time' => now(),
            'approval_status' => 'pending'
        ]);

        $debug['antes_de_guardar'] = [
            'jobs_count' => DB::table('jobs')->count()
        ];

        // 5. Guardar visitante (esto debería disparar el evento created)
        $visitor->save();

        $debug['despues_de_guardar'] = [
            'visitor_id' => $visitor->id,
            'jobs_count' => DB::table('jobs')->count(),
            'jobs_nuevos' => DB::table('jobs')->count() - $debug['antes_de_guardar']['jobs_count']
        ];

        // 6. Probar requestApproval manualmente
        $debug['antes_request_approval'] = [
            'jobs_count' => DB::table('jobs')->count()
        ];

        $visitor->requestApproval('Debug test manual');

        $debug['despues_request_approval'] = [
            'jobs_count' => DB::table('jobs')->count(),
            'jobs_nuevos' => DB::table('jobs')->count() - $debug['antes_request_approval']['jobs_count'],
            'approval_token' => $visitor->approval_token
        ];

        // 7. Ver últimos jobs
        $debug['ultimos_jobs'] = DB::table('jobs')
            ->orderBy('id', 'desc')
            ->limit(3)
            ->get(['id', 'queue', 'payload'])
            ->map(function($job) {
                $payload = json_decode($job->payload, true);
                return [
                    'id' => $job->id,
                    'queue' => $job->queue,
                    'job_class' => $payload['displayName'] ?? 'Unknown'
                ];
            });

        return response()->json([
            'success' => true,
            'debug' => $debug
        ], 200, [], JSON_PRETTY_PRINT);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500, [], JSON_PRETTY_PRINT);
    }
});

Route::get('/test-visitor-approval', function() {
    try {
        // Buscar un usuario residente
        $resident = App\Models\User::where('rol', 'residente')->first();
        if (!$resident) {
            return 'No se encontró residente para prueba';
        }

        // Crear visitante de prueba
        $visitor = App\Models\Visitor::create([
            'name' => 'María García Test',
            'id_document' => 'TEST789123',
            'user_id' => $resident->id,
            'vehicle_plate' => 'TEST-999',
            'approval_notes' => 'Visitante de prueba del sistema de aprobación',
            'entry_time' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Visitante de prueba creado',
            'visitor' => [
                'id' => $visitor->id,
                'name' => $visitor->name,
                'status' => $visitor->approval_status,
                'token' => $visitor->approval_token,
                'resident' => $resident->name,
            ],
            'urls' => [
                'approve' => route('approval.approve.public', $visitor->approval_token),
                'reject' => route('approval.reject.public', $visitor->approval_token),
            ]
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/welcome',function(){
    return Inertia::render('Welcome');
})->name('welcome');

Route::middleware(['auth', 'verified'])->get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

Route::post('/notifications/mark-all-read', [DashboardController::class, 'markNotificationsAsRead'])
    ->middleware('auth')
    ->name('notifications.markAllRead');

Route::get('/mis-visitas', [DashboardController::class, 'misVisitas'])->middleware(['auth', 'verified'])->name('mis-visitas');

Route::get("/contacto", function(){
    return Inertia::render('Links/Contact');
})->name('contacto');

Route::get("/reglamento", function(){
    return Inertia::render('Links/Reglamento');
})->name('reglamento');

Route::get('/success', function () {
    return Inertia::render('Email/ResponseEmail');
})->name('success');

Route::post('/send-email', [ContactController::class, 'send'])->name('contact.send');

Route::get('/error', function () {
    return Inertia::render('Auth/Error');
})->name('error');

Route::post('/complaints', [DashboardController::class, 'store'])->name('complaints.store');

// Rutas públicas para enlaces de aprobación desde WhatsApp (sin autenticación)
Route::prefix('approval')->group(function () {
    Route::get('/{token}/approve', [ApprovalController::class, 'approvePublic'])
         ->name('approval.approve.public');

    Route::get('/{token}/reject', [ApprovalController::class, 'rejectPublic'])
         ->name('approval.reject.public');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/api/user/qr-codes', [QrCodeController::class, 'getUserQrCodes']);
    Route::patch('/api/qr-codes/{qrId}/deactivate', [QrCodeController::class, 'deactivateQr']);
    Route::patch('/api/qr-codes/{qrId}/reactivate', [QrCodeController::class, 'reactivateQr']);
    Route::get('/api/user/visitors', [VisitorController::class, 'getUserVisitors']);
    Route::post('/api/qr-codes', [QrCodeController::class, 'store']);

    // Rutas de aprobación autenticadas (frontend) - prefijo api
    Route::prefix('api/approval')->name('api.approval.')->group(function () {
        Route::post('/approve', [ApprovalController::class, 'approveApi'])->name('approve');
        Route::post('/reject', [ApprovalController::class, 'rejectApi'])->name('reject');
        Route::get('/pending', [ApprovalController::class, 'pendingVisitors'])->name('pending');
    });

    // Rutas web de aprobación (para el dashboard frontend) - sin prefijo api
    Route::prefix('approval')->name('web.approval.')->group(function () {
        Route::post('/approve', [ApprovalController::class, 'approveApi'])->name('approve');
        Route::post('/reject', [ApprovalController::class, 'rejectApi'])->name('reject');
        Route::get('/pending', [ApprovalController::class, 'pendingVisitors'])->name('pending');
    });
});

Route::get('/create-admin', function () {
    if (App\Models\User::count() === 0) {
        App\Models\User::create([
            'name' => 'Admin',
            'email' => 'admin@admin.com',
            'password' => Hash::make('admin'),
            'email_verified_at' => now(),
        ]);
        return 'Usuario admin creado! Email: admin@admin.com, Password: password123';
    }
    return 'Ya existe un usuario admin';
});

Route::get('/clear-cache', function () {
    Artisan::call('cache:clear');
    Artisan::call('config:clear');
    Artisan::call('route:clear');
    return 'Cache limpiado';
});

Route::get('/csrf-token', function() {
    return response()->json([
        'csrf_token' => csrf_token(),
        'app_url' => config('app.url'),
        'session_domain' => config('session.domain'),
        'session_secure' => config('session.secure'),
        'cors_origins' => config('cors.allowed_origins'),
    ]);
});

// Debug para verificar usuario autenticado
Route::get('/debug-user', function() {
    $user = Auth::user();
    return response()->json([
        'authenticated' => Auth::check(),
        'user_id' => $user ? $user->id : null,
        'user_email' => $user ? $user->email : null,
        'user_rol' => $user ? $user->rol : null,
        'is_admin' => $user ? in_array($user->rol, ['administrador', 'admin']) : false,
        'session_id' => session()->getId(),
    ]);
})->middleware(['web', 'auth']);

// Rutas para notificaciones de Filament (polling simple y efectivo)
Route::get('/admin/notifications/check', [App\Http\Controllers\FilamentNotificationController::class, 'checkNotifications'])
    ->middleware(['web', 'auth'])
    ->name('admin.notifications.check');

Route::post('/admin/notifications/mark-sent', [App\Http\Controllers\FilamentNotificationController::class, 'markSent'])
    ->middleware(['web', 'auth'])
    ->name('admin.notifications.mark-sent');

Route::get('/admin/notifications/test', [App\Http\Controllers\FilamentNotificationController::class, 'testNotification'])
    ->middleware(['web', 'auth'])
    ->name('admin.notifications.test');

Route::get('/admin/notifications/force/{visitor}', [App\Http\Controllers\FilamentNotificationController::class, 'forceNotification'])
    ->middleware(['web', 'auth'])
    ->name('admin.notifications.force');

Route::get('/admin/notifications/clear-cache', [App\Http\Controllers\FilamentNotificationController::class, 'clearNotificationCache'])
    ->middleware(['web', 'auth'])
    ->name('admin.notifications.clear-cache');

// Rutas SSE para notificaciones en tiempo real (alternativa a Pusher)
Route::get('/notifications/sse', [App\Http\Controllers\NotificationController::class, 'sseNotifications'])
    ->middleware(['web', 'auth'])
    ->name('notifications.sse');

Route::get('/test-sse-notification', [App\Http\Controllers\NotificationController::class, 'testSseNotification'])
    ->middleware(['web', 'auth'])
    ->name('test.sse.notification');

// Ruta temporal para probar notificaciones desde el navegador
Route::get('/test-notification-web', function() {
    try {
        $admin = App\Models\User::where('rol', 'administrador')->first();
        $visitor = App\Models\Visitor::latest()->first();

        if (!$admin || !$visitor) {
            return response()->json(['error' => 'No admin or visitor found'], 404);
        }

        // Enviar notificación completa
        $notification = new App\Notifications\AdminVisitorStatusNotification($visitor, 'approved', $visitor->user);
        $notification->sendFilamentNotification($admin);

        // También enviar evento directo
        broadcast(new App\Events\VisitorStatusUpdated($visitor, 'approved', $visitor->user));

        return response()->json([
            'success' => true,
            'message' => 'Notificación enviada correctamente',
            'admin' => $admin->name,
            'visitor' => $visitor->name
        ]);

    } catch (Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
})->middleware(['web', 'auth']);

Route::get('/debug-email-system', function() {
    try {
        $debug = [];
        
        // 1. Verificar configuración de email
        $debug['mail_config'] = [
            'default_mailer' => config('mail.default'),
            'smtp_host' => config('mail.mailers.smtp.host'),
            'smtp_port' => config('mail.mailers.smtp.port'),
            'smtp_encryption' => config('mail.mailers.smtp.encryption'),
            'smtp_username' => config('mail.mailers.smtp.username') ? '***configurado***' : null,
            'smtp_password' => config('mail.mailers.smtp.password') ? '***configurado***' : null,
            'from_address' => config('mail.from.address'),
            'from_name' => config('mail.from.name'),
            'timeout' => config('mail.mailers.smtp.timeout'),
        ];
        
        // 2. Buscar usuario para prueba
        $user = \App\Models\User::where('phone', '4641226304')->first();
        if (!$user) {
            throw new \Exception('Usuario con teléfono 4641226304 no encontrado');
        }
        
        $debug['usuario_prueba'] = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'email_notifications' => $user->email_notifications ?? 'no_definido'
        ];
        
        // 3. Verificar canales de notificación actual
        $visitor = new \App\Models\Visitor([
            'name' => 'Test Email',
            'id_document' => 'EMAIL001',
            'approval_token' => 'test-token-123'
        ]);
        
        $notification = new \App\Notifications\VisitorApprovalRequest($visitor);
        $channels = $notification->via($user);
        
        $debug['notification_channels'] = $channels;
        
        // 4. Probar envío directo de email
        try {
            Mail::raw('🧪 Prueba de email desde Gatekeeper - ' . now(), function ($message) use ($user) {
                $message->to($user->email, $user->name)
                        ->subject('🧪 Test Email - Gatekeeper')
                        ->from(config('mail.from.address'), config('mail.from.name'));
            });
            
            $debug['test_email_sent'] = true;
            $debug['test_email_message'] = 'Email de prueba enviado correctamente';
            
        } catch (\Exception $e) {
            $debug['test_email_sent'] = false;
            $debug['test_email_error'] = $e->getMessage();
        }
        
        // 5. Información del entorno
        $debug['environment'] = [
            'app_env' => config('app.env'),
            'app_debug' => config('app.debug'),
            'mail_log_channel' => config('mail.mailers.log.channel')
        ];
        
        return response()->json([
            'success' => true,
            'debug' => $debug
        ], 200, [], JSON_PRETTY_PRINT);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500, [], JSON_PRETTY_PRINT);
    }
});

// Rutas de broadcasting para autenticación WebSocket ya están definidas en BroadcastServiceProvider
// Broadcast::routes(['middleware' => ['web', 'auth']]);

// Incluir rutas de testing para debugging
require __DIR__.'/test.php';

require __DIR__.'/auth.php';

