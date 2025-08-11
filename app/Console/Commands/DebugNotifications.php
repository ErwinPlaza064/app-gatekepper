<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Visitor;
use App\Events\VisitorStatusUpdated;
use App\Notifications\AdminVisitorStatusNotification;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Artisan;

class DebugNotifications extends Command
{
    protected $signature = 'debug:notifications';
    protected $description = 'Debug completo del sistema de notificaciones en Railway';

    public function handle()
    {
        $this->info('🔧 === DEBUG COMPLETO DE NOTIFICACIONES ===');
        
        // 1. Verificar configuración
        $this->checkConfiguration();
        
        // 2. Verificar usuarios
        $this->checkUsers();
        
        // 3. Limpiar cache y sesiones
        $this->cleanupSessions();
        
        // 4. Probar notificaciones
        $this->testNotifications();
        
        $this->info('🎯 === DEBUG COMPLETADO ===');
        $this->info('📱 Abre la consola del navegador en /admin para ver eventos de Pusher');
        
        return 0;
    }
    
    private function checkConfiguration()
    {
        $this->info('🔍 Verificando configuración...');
        
        $broadcastDriver = config('broadcasting.default');
        $this->info("📡 BROADCAST_DRIVER: {$broadcastDriver}");
        
        $pusherConfig = config('broadcasting.connections.pusher');
        $this->info("🔑 PUSHER_APP_ID: " . $pusherConfig['app_id'] ?? 'NO SET');
        $this->info("🔑 PUSHER_APP_KEY: " . $pusherConfig['key'] ?? 'NO SET');
        $this->info("🔑 PUSHER_APP_CLUSTER: " . ($pusherConfig['options']['cluster'] ?? 'NO SET'));
        
        if ($broadcastDriver !== 'pusher') {
            $this->error("❌ BROADCAST_DRIVER debe ser 'pusher', actual: {$broadcastDriver}");
        } else {
            $this->info("✅ Configuración de broadcasting correcta");
        }
    }
    
    private function checkUsers()
    {
        $this->info('👥 Verificando usuarios...');
        
        $adminCount = User::where('rol', 'administrador')->count();
        $this->info("👨‍💼 Administradores: {$adminCount}");
        
        $visitorCount = Visitor::count();
        $this->info("👤 Visitantes: {$visitorCount}");
        
        if ($adminCount === 0) {
            $this->error("❌ No hay administradores en el sistema");
            return false;
        }
        
        if ($visitorCount === 0) {
            $this->error("❌ No hay visitantes en el sistema");
            return false;
        }
        
        $this->info("✅ Usuarios verificados");
        return true;
    }
    
    private function cleanupSessions()
    {
        $this->info('🧹 Limpiando cache y sesiones...');
        
        // Limpiar cache
        Cache::flush();
        $this->info("✅ Cache limpiado");
        
        // Limpiar configuración
        Artisan::call('config:clear');
        $this->info("✅ Config cache limpiado");
        
        // Limpiar rutas
        Artisan::call('route:clear');
        $this->info("✅ Route cache limpiado");
    }
    
    private function testNotifications()
    {
        $this->info('🧪 Probando notificaciones...');
        
        $admin = User::where('rol', 'administrador')->first();
        $visitor = Visitor::latest()->first();
        
        if (!$admin || !$visitor) {
            $this->error("❌ No se pueden probar notificaciones sin admin/visitor");
            return;
        }
        
        try {
            // Test 1: Broadcasting directo
            $this->info("📡 Test 1: Broadcasting directo...");
            broadcast(new VisitorStatusUpdated($visitor, 'approved', $visitor->user))->toOthers();
            $this->info("✅ Broadcasting enviado");
            
            // Test 2: Notificación completa
            $this->info("🔔 Test 2: Notificación completa...");
            $notification = new AdminVisitorStatusNotification($visitor, 'approved', $visitor->user);
            $notification->sendFilamentNotification($admin);
            $this->info("✅ Notificación completa enviada");
            
            // Test 3: Notificación de base de datos
            $this->info("💾 Test 3: Notificación de base de datos...");
            $admin->notify(new AdminVisitorStatusNotification($visitor, 'approved', $visitor->user));
            $this->info("✅ Notificación BD enviada");
            
            $this->info("🎉 Todas las notificaciones enviadas correctamente");
            
        } catch (\Exception $e) {
            $this->error("❌ Error enviando notificaciones: " . $e->getMessage());
            $this->error("📋 Trace: " . $e->getTraceAsString());
        }
    }
}
