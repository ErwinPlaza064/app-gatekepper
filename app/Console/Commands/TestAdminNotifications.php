<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Visitor;
use App\Notifications\AdminVisitorStatusNotification;

class TestAdminNotifications extends Command
{
    protected $signature = 'test:admin-notifications';
    protected $description = 'Probar el sistema de notificaciones para administradores';

    public function handle()
    {
        $this->info('🧪 Probando sistema de notificaciones de administradores...');
        $this->newLine();

        // Buscar un administrador
        $admin = User::where('rol', 'administrador')->first();
        if (!$admin) {
            $this->error('❌ No se encontró ningún administrador');
            return 1;
        }

        $this->info("✅ Administrador encontrado: {$admin->name}");

        // Buscar un visitante o crear uno de prueba
        $visitor = Visitor::latest()->first();
        if (!$visitor) {
            $this->warn('⚠️ No hay visitantes en el sistema, creando uno de prueba...');

            $residente = User::where('rol', '!=', 'administrador')->first();
            if (!$residente) {
                $this->error('❌ No hay residentes para crear visitante de prueba');
                return 1;
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

        $this->info("✅ Visitante: {$visitor->name}");

        // Enviar notificación de prueba
        $this->info('📤 Enviando notificación de prueba...');

        try {
            // Crear notificación
            $notification = new AdminVisitorStatusNotification($visitor, 'approved', $visitor->user);

            // Enviar notificación tradicional
            $admin->notify($notification);

            // Enviar notificación de Filament
            $notification->sendFilamentNotification($admin);

            $this->info('✅ Notificación enviada correctamente!');
            $this->info("🎯 El administrador '{$admin->name}' debería ver la notificación en el panel de Filament");
            $this->info('🔔 Revisa el panel en: /admin');
            $this->newLine();

            // Mostrar información de la notificación
            $this->info('📋 Detalles de la notificación:');
            $this->line("   - Visitante: {$visitor->name}");
            $this->line("   - Estado: Aprobado");
            $this->line("   - Residente: {$visitor->user->name}");
            $this->line("   - Administrador notificado: {$admin->name}");
            $this->newLine();

            $this->info('🎉 Prueba completada exitosamente!');

            return 0;

        } catch (\Exception $e) {
            $this->error('❌ Error enviando notificación: ' . $e->getMessage());
            return 1;
        }
    }
}
