<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Visitor;
use Carbon\Carbon;

class FixVisitorEntryTimes extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'visitors:fix-entry-times {--dry-run : Solo mostrar qué se actualizaría sin hacer cambios}';

    /**
     * The console command description.
     */
    protected $description = 'Establece entry_time para visitantes que no lo tienen (registros manuales antiguos)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $isDryRun = $this->option('dry-run');

        $this->info('🔍 Buscando visitantes sin entry_time...');

        // Buscar visitantes sin entry_time
        $visitorsWithoutEntryTime = Visitor::whereNull('entry_time')
            ->with('user')
            ->get();

        if ($visitorsWithoutEntryTime->isEmpty()) {
            $this->info('✅ Todos los visitantes ya tienen entry_time registrado.');
            return 0;
        }

        $this->warn("⚠️  Encontrados {$visitorsWithoutEntryTime->count()} visitantes sin entry_time:");
        $this->newLine();

        // Mostrar lista de visitantes
        foreach ($visitorsWithoutEntryTime as $visitor) {
            $residentName = $visitor->user ? $visitor->user->name : 'N/A';
            $this->line("• {$visitor->name} ({$visitor->id_document}) - Creado: {$visitor->created_at->format('d/m/Y H:i')} - Residente: {$residentName}");
        }

        $this->newLine();

        if ($isDryRun) {
            $this->info('🧪 MODO PRUEBA - No se realizarán cambios reales.');
            $this->info('💡 Para aplicar los cambios, ejecuta: php artisan visitors:fix-entry-times');
            return 0;
        }

        if (!$this->confirm('¿Deseas establecer su created_at como entry_time para estos visitantes?')) {
            $this->info('❌ Operación cancelada.');
            return 0;
        }

        $updated = 0;

        foreach ($visitorsWithoutEntryTime as $visitor) {
            // Usar created_at como entry_time
            $currentNotes = $visitor->approval_notes ?: '';
            $visitor->update([
                'entry_time' => $visitor->created_at,
                'approval_status' => 'approved', // Marcar como aprobado si no lo estaba
                'approval_responded_at' => $visitor->created_at,
                'approval_notes' => $currentNotes . ' [Corregido automáticamente - registro manual antiguo]'
            ]);

            $updated++;
            $this->line("✅ {$visitor->name} - Entry time establecido: {$visitor->created_at->format('d/m/Y H:i')}");
        }

        $this->newLine();
        $this->info("🎉 ¡{$updated} visitantes actualizados correctamente!");
        $this->info('💡 Ahora todos los visitantes manuales tendrán entry_time visible.');

        return 0;
    }
}
