<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Visitor;
use App\Events\VisitorStatusUpdated;
use App\Notifications\AdminVisitorStatusNotification;

class TestNotification extends Command
{
    protected $signature = 'test:notification';
    protected $description = 'Probar notificaciones en tiempo real para el panel de admin';

    public function handle()
    {
        $this->info('🧪 Probando notificaciones en tiempo real...');

        // Buscar un administrador
        $admin = User::where('rol', 'administrador')->first();
        if (!$admin) {
            $this->error('❌ No se encontró ningún administrador');
            return 1;
        }

        // Buscar un visitante
        $visitor = Visitor::latest()->first();
        if (!$visitor) {
            $this->error('❌ No se encontró ningún visitante');
            return 1;
        }

        $this->info("✅ Administrador: {$admin->name}");
        $this->info("✅ Visitante: {$visitor->name}");

        // Test 1: Notificación directa de base de datos
        $this->info('📤 Enviando notificación de base de datos...');
        $admin->notify(new AdminVisitorStatusNotification($visitor, 'approved', $visitor->user));
        $this->info('✅ Notificación de base de datos enviada');

        // Test 2: Broadcasting directo
        $this->info('📡 Enviando evento de broadcasting...');
        broadcast(new VisitorStatusUpdated($visitor, 'approved', $visitor->user));
        $this->info('✅ Evento de broadcasting enviado');

        // Test 3: Notificación completa de Filament
        $this->info('🔔 Enviando notificación completa...');
        $notification = new AdminVisitorStatusNotification($visitor, 'approved', $visitor->user);
        $notification->sendFilamentNotification($admin);
        $this->info('✅ Notificación completa enviada');

        $this->info('');
        $this->info('🎯 Verifica tu panel de admin en: /admin');
        $this->info('📱 Abre la consola del navegador para ver eventos de Pusher');
        $this->info('🔍 Deberías ver: "📧 Evento de visitante recibido"');

        return 0;
    }
}
