<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

class ClearAllSessions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sessions:clear-all {--force : Skip confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear all sessions and force session regeneration';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (!$this->option('force') && !$this->confirm('This will clear all user sessions. Continue?')) {
            return 0;
        }

        $this->info('🧹 Clearing all sessions...');

        try {
            // Clear session files
            $sessionPath = storage_path('framework/sessions');
            if (is_dir($sessionPath)) {
                $files = glob($sessionPath . '/*');
                foreach ($files as $file) {
                    if (is_file($file)) {
                        unlink($file);
                    }
                }
                $this->info("✅ Cleared " . count($files) . " session files");
            }

            // Clear session database table if using database driver
            if (config('session.driver') === 'database') {
                DB::table('sessions')->delete();
                $this->info("✅ Cleared database sessions");
            }

            // Clear application cache
            Artisan::call('cache:clear');
            $this->info("✅ Cleared application cache");

            // Clear config cache
            Artisan::call('config:clear');
            $this->info("✅ Cleared config cache");

            $this->info('🎉 All sessions cleared successfully!');
            $this->warn('💡 Users will need to login again');

        } catch (\Exception $e) {
            $this->error("❌ Error clearing sessions: " . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
