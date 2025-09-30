<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\SendVisitorNotificationJob;
use App\Models\Visitor;
use Illuminate\Support\Facades\Log;

class TestSMTPCommand extends Command
{
    protected $signature = 'test:smtp {visitor_id?}';
    protected $description = 'Probar SMTP con un visitante específico';

    public function handle()
    {
        $visitorId = $this->argument('visitor_id') ?? 1;

        $this->info("🔍 Probando SMTP con Visitor ID: {$visitorId}");

        try {
            $visitor = Visitor::find($visitorId);

            if (!$visitor) {
                $this->error("❌ No se encontró el visitante con ID: {$visitorId}");
                return;
            }

            $this->info("✅ Visitante encontrado: {$visitor->name}");

            // Ejecutar el job directamente
            $this->info("📧 Ejecutando SendVisitorNotificationJob...");

            $job = new SendVisitorNotificationJob($visitor->user, $visitor, 'approval');
            $job->handle();

            $this->info("✅ ¡Job ejecutado exitosamente!");

        } catch (\Exception $e) {
            $this->error("❌ Error: " . $e->getMessage());
            Log::error("Test SMTP Error: " . $e->getMessage());
        }
    }
}
