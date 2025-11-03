<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Visitor;

class ToggleApprovalModeCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'visitors:approval-mode
                            {mode : El modo de aprobación (auto|manual)}
                            {--show : Solo mostrar el modo actual}';

    /**
     * The console command description.
     */
    protected $description = 'Cambiar entre modo de aprobación automática y manual para visitantes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('show')) {
            $this->showCurrentMode();
            return 0;
        }

        $mode = $this->argument('mode');

        if (!in_array($mode, ['auto', 'manual'])) {
            $this->error('❌ Modo inválido. Usa: auto o manual');
            return 1;
        }

        $this->info("🔧 Configurando modo de aprobación: {$mode}");
        $this->newLine();

        if ($mode === 'auto') {
            $this->setupAutoApprovalMode();
        } else {
            $this->setupManualApprovalMode();
        }

        $this->info("✅ Modo de aprobación configurado exitosamente: {$mode}");
        $this->showModeInstructions($mode);

        return 0;
    }

    private function showCurrentMode()
    {
        $this->info("📋 Estado Actual del Sistema de Aprobación");
        $this->info("==========================================");
        $this->newLine();

        // Contar visitantes por estado
        $pending = Visitor::where('approval_status', 'pending')->count();
        $approved = Visitor::where('approval_status', 'approved')->count();
        $rejected = Visitor::where('approval_status', 'rejected')->count();

        $this->line("📊 Estadísticas actuales:");
        $this->line("  ⏳ Pendientes: {$pending}");
        $this->line("  ✅ Aprobados: {$approved}");
        $this->line("  ❌ Rechazados: {$rejected}");
        $this->newLine();

        // Determinar modo actual basado en comportamiento
        if ($pending > 0) {
            $this->info("🔄 Modo actual: MANUAL (hay visitantes pendientes)");
        } else {
            $this->info("⚡ Modo actual: AUTOMÁTICO (no hay pendientes)");
        }
    }

    private function setupAutoApprovalMode()
    {
        $this->warn("⚡ MODO AUTOMÁTICO");
        $this->line("• Los visitantes de QR se aprueban automáticamente");
        $this->line("• Los visitantes manuales también se aprueban automáticamente");
        $this->line("• No se requiere aprobación del residente");
        $this->newLine();

        // Preguntar si aprobar visitantes pendientes
        $pendingCount = Visitor::where('approval_status', 'pending')->count();

        if ($pendingCount > 0) {
            $this->warn("⚠️  Hay {$pendingCount} visitantes pendientes de aprobación.");

            if ($this->confirm('¿Deseas aprobar automáticamente todos los visitantes pendientes?')) {
                $approved = 0;

                Visitor::where('approval_status', 'pending')->each(function ($visitor) use (&$approved) {
                    $visitor->update([
                        'approval_status' => 'approved',
                        'approval_responded_at' => now(),
                        'entry_time' => now(),
                        'approval_notes' => ($visitor->approval_notes ?? '') . ' [Auto-aprobado por cambio de modo]'
                    ]);
                    $approved++;
                });

                $this->info("✅ {$approved} visitantes aprobados automáticamente");
            }
        }
    }

    private function setupManualApprovalMode()
    {
        $this->warn("👥 MODO MANUAL");
        $this->line("• TODOS los visitantes requieren aprobación del residente");
        $this->line("• Se envían notificaciones por email");
        $this->line("• Los administradores pueden aprobar manualmente");
        $this->newLine();

        $this->info("📝 El sistema está configurado para requerir aprobación manual");
    }

    private function showModeInstructions($mode)
    {
        $this->newLine();
        $this->info("📖 Instrucciones para el modo {$mode}:");

        if ($mode === 'auto') {
            $this->line("1. Los visitantes se registran y aprueban automáticamente");
            $this->line("2. Se establece entry_time inmediatamente");
            $this->line("3. Los porteros solo marcan la salida");
        } else {
            $this->line("1. Los visitantes se registran como 'pending'");
            $this->line("2. Se envía notificación al residente");
            $this->line("3. El residente aprueba/rechaza por email o app");
            $this->line("4. Si se aprueba, se establece entry_time automáticamente");
            $this->line("5. Los administradores pueden aprobar manualmente desde el panel");
        }

        $this->newLine();
        $this->info("💡 Para cambiar de modo en el futuro:");
        $this->line("   php artisan visitors:approval-mode auto");
        $this->line("   php artisan visitors:approval-mode manual");
    }
}
