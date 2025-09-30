<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class CleanProblemSessions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sessions:clean-problems {--force : Force cleanup without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean problematic sessions that might cause CSRF and authentication issues';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔧 Cleaning problematic sessions...');

        try {
            // Limpiar sesiones de base de datos si se usa database driver
            if (config('session.driver') === 'database') {
                $this->cleanDatabaseSessions();
            }

            // Limpiar archivos de sesión si se usa file driver
            if (config('session.driver') === 'file') {
                $this->cleanFileSessions();
            }

            // Limpiar cache de autenticación
            $this->cleanAuthCache();

            // Regenerar application key si es necesario
            if ($this->option('force') || $this->confirm('¿Desea regenerar la application key? (Esto cerrará todas las sesiones activas)')) {
                $this->call('key:generate', ['--force' => true]);
            }

            $this->info('✅ Sessions cleaned successfully!');
            $this->info('💡 Restart your web server for changes to take effect.');

        } catch (\Exception $e) {
            $this->error('❌ Error cleaning sessions: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }

    /**
     * Clean database sessions
     */
    private function cleanDatabaseSessions()
    {
        $this->info('🗄️ Cleaning database sessions...');

        $sessionTable = config('session.table', 'sessions');

        // Eliminar sesiones expiradas
        $expiredCount = DB::table($sessionTable)
            ->where('last_activity', '<', now()->subHours(24)->timestamp)
            ->delete();

        // Eliminar sesiones corruptas (sin user_id válido o payload corrupto)
        $corruptedCount = DB::table($sessionTable)
            ->whereRaw('LENGTH(payload) < 50')
            ->orWhereNull('payload')
            ->delete();

        $this->info("   • Removed {$expiredCount} expired sessions");
        $this->info("   • Removed {$corruptedCount} corrupted sessions");
    }

    /**
     * Clean file sessions
     */
    private function cleanFileSessions()
    {
        $this->info('📁 Cleaning file sessions...');

        $sessionPath = config('session.files', storage_path('framework/sessions'));

        if (!File::exists($sessionPath)) {
            $this->warn("   • Session path does not exist: {$sessionPath}");
            return;
        }

        $files = File::glob($sessionPath . '/sess_*');
        $cleanedCount = 0;

        foreach ($files as $file) {
            // Eliminar archivos de sesión antiguos (más de 24 horas)
            if (File::lastModified($file) < now()->subHours(24)->timestamp) {
                File::delete($file);
                $cleanedCount++;
            }
        }

        $this->info("   • Removed {$cleanedCount} expired session files");
    }

    /**
     * Clean authentication cache
     */
    private function cleanAuthCache()
    {
        $this->info('🔐 Cleaning authentication cache...');

        try {
            // Limpiar cache de autenticación
            $this->call('cache:clear');
            $this->call('config:clear');
            $this->call('route:clear');
            $this->call('view:clear');

            $this->info('   • Cache cleared successfully');
        } catch (\Exception $e) {
            $this->warn('   • Warning: Could not clear some caches: ' . $e->getMessage());
        }
    }
}
