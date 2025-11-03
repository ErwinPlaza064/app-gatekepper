<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use App\Models\User;

class EmailDiagnosticCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'email:diagnose {--fix : Attempt to fix common issues}';

    /**
     * The console command description.
     */
    protected $description = 'Diagnose email configuration and queue issues';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("🔍 Gatekeeper Email Diagnostic Tool");
        $this->info("==================================");
        $this->newLine();

        $fix = $this->option('fix');
        $issues = 0;

        // 1. Check environment variables
        $issues += $this->checkEnvironmentVariables();

        // 2. Check database connection
        $issues += $this->checkDatabaseConnection();

        // 3. Check jobs table
        $issues += $this->checkJobsTable($fix);

        // 4. Check failed jobs
        $issues += $this->checkFailedJobs($fix);

        // 5. Check queue configuration
        $issues += $this->checkQueueConfiguration();

        // 6. Check mail configuration
        $issues += $this->checkMailConfiguration();

        // 7. Check recent logs
        $issues += $this->checkRecentLogs();

        $this->newLine();
        if ($issues === 0) {
            $this->info("✅ All checks passed! Your email system should be working correctly.");
            $this->info("💡 If you're still having issues, try running: php artisan email:test your-email@domain.com");
        } else {
            $this->error("❌ Found {$issues} potential issues. Please review the output above.");
            if (!$fix) {
                $this->info("💡 Try running with --fix flag to automatically resolve some issues.");
            }
        }

        return $issues === 0 ? 0 : 1;
    }

    private function checkEnvironmentVariables()
    {
        $this->info("1️⃣  Checking Environment Variables...");
        $issues = 0;

        $requiredVars = [
            'MAIL_MAILER' => config('mail.default'),
            'MAIL_FROM_ADDRESS' => config('mail.from.address'),
            'MAIL_FROM_NAME' => config('mail.from.name'),
            'SENDGRID_API_KEY' => env('SENDGRID_API_KEY'),
            'QUEUE_CONNECTION' => config('queue.default'),
        ];

        foreach ($requiredVars as $name => $value) {
            if (empty($value)) {
                $this->error("   ❌ {$name} is not set or empty");
                $issues++;
            } else {
                if ($name === 'SENDGRID_API_KEY') {
                    $value = substr($value, 0, 20) . '...';
                }
                $this->line("   ✅ {$name}: {$value}");
            }
        }

        return $issues;
    }

    private function checkDatabaseConnection()
    {
        $this->info("2️⃣  Checking Database Connection...");

        try {
            DB::connection()->getPdo();
            $this->line("   ✅ Database connection successful");
            return 0;
        } catch (\Exception $e) {
            $this->error("   ❌ Database connection failed: " . $e->getMessage());
            return 1;
        }
    }

    private function checkJobsTable($fix)
    {
        $this->info("3️⃣  Checking Jobs Table...");

        try {
            $exists = DB::getSchemaBuilder()->hasTable('jobs');

            if (!$exists) {
                $this->error("   ❌ Jobs table does not exist");
                if ($fix) {
                    $this->line("   🔧 Creating jobs table...");
                    $this->call('queue:table');
                    $this->call('migrate', ['--force' => true]);
                    $this->info("   ✅ Jobs table created");
                    return 0;
                }
                $this->line("   💡 Run: php artisan queue:table && php artisan migrate");
                return 1;
            }

            $jobCount = DB::table('jobs')->count();
            $this->line("   ✅ Jobs table exists with {$jobCount} pending jobs");

            if ($jobCount > 100) {
                $this->warn("   ⚠️  Large number of pending jobs ({$jobCount}). Consider processing them.");
            }

            return 0;

        } catch (\Exception $e) {
            $this->error("   ❌ Jobs table check failed: " . $e->getMessage());
            return 1;
        }
    }

    private function checkFailedJobs($fix)
    {
        $this->info("4️⃣  Checking Failed Jobs...");

        try {
            if (!DB::getSchemaBuilder()->hasTable('failed_jobs')) {
                $this->error("   ❌ Failed jobs table does not exist");
                if ($fix) {
                    $this->line("   🔧 Creating failed jobs table...");
                    $this->call('queue:failed-table');
                    $this->call('migrate', ['--force' => true]);
                    $this->info("   ✅ Failed jobs table created");
                }
                return 1;
            }

            $failedCount = DB::table('failed_jobs')->count();

            if ($failedCount > 0) {
                $this->warn("   ⚠️  {$failedCount} failed jobs found");
                $this->line("   💡 Review with: php artisan queue:failed");

                if ($fix && $this->confirm("Clear all failed jobs?")) {
                    $this->call('queue:flush');
                    $this->info("   ✅ Failed jobs cleared");
                }

                return 1;
            }

            $this->line("   ✅ No failed jobs");
            return 0;

        } catch (\Exception $e) {
            $this->error("   ❌ Failed jobs check failed: " . $e->getMessage());
            return 1;
        }
    }

    private function checkQueueConfiguration()
    {
        $this->info("5️⃣  Checking Queue Configuration...");

        $queueConnection = config('queue.default');
        $this->line("   📋 Queue connection: {$queueConnection}");

        if ($queueConnection === 'sync') {
            $this->warn("   ⚠️  Using 'sync' queue - jobs run immediately (not recommended for production)");
            $this->line("   💡 Consider using 'database' or 'redis' for better performance");
            return 1;
        }

        $this->line("   ✅ Queue configuration looks good");
        return 0;
    }

    private function checkMailConfiguration()
    {
        $this->info("6️⃣  Checking Mail Configuration...");

        $defaultMailer = config('mail.default');
        $this->line("   📋 Default mailer: {$defaultMailer}");

        if ($defaultMailer === 'failover') {
            $mailers = config('mail.mailers.failover.mailers', []);
            $this->line("   📋 Failover mailers: " . implode(', ', $mailers));
        }

        // Check SendGrid configuration
        if (in_array('sendgrid', config('mail.mailers.failover.mailers', []))) {
            $sendgridKey = env('SENDGRID_API_KEY');
            if (empty($sendgridKey)) {
                $this->error("   ❌ SendGrid API key not configured");
                return 1;
            }
            $this->line("   ✅ SendGrid configuration found");
        }

        return 0;
    }

    private function checkRecentLogs()
    {
        $this->info("7️⃣  Checking Recent Email Logs...");

        $logFile = storage_path('logs/laravel.log');

        if (!file_exists($logFile)) {
            $this->line("   ℹ️  No log file found");
            return 0;
        }

        try {
            $logs = file_get_contents($logFile);
            $lines = explode("\n", $logs);
            $recentEmailLogs = [];

            // Get last 100 lines and filter for email-related entries
            $recentLines = array_slice($lines, -100);

            foreach ($recentLines as $line) {
                if (str_contains($line, 'SendGrid') ||
                    str_contains($line, 'QrUsedNotification') ||
                    str_contains($line, 'SendEmailJob') ||
                    str_contains($line, 'SMTP') ||
                    str_contains($line, 'Email')) {
                    $recentEmailLogs[] = $line;
                }
            }

            if (empty($recentEmailLogs)) {
                $this->line("   ℹ️  No recent email-related logs found");
                return 0;
            }

            $errorCount = 0;
            $successCount = 0;

            foreach ($recentEmailLogs as $log) {
                if (str_contains($log, 'ERROR') || str_contains($log, 'FAIL')) {
                    $errorCount++;
                } elseif (str_contains($log, 'SUCCESS') || str_contains($log, 'sent successfully')) {
                    $successCount++;
                }
            }

            $this->line("   📊 Recent email activity: {$successCount} success, {$errorCount} errors");

            if ($errorCount > 0) {
                $this->warn("   ⚠️  Recent email errors detected. Check logs for details.");
                $this->line("   💡 Run: tail -f storage/logs/laravel.log | grep -i email");
                return 1;
            }

            return 0;

        } catch (\Exception $e) {
            $this->error("   ❌ Could not read log file: " . $e->getMessage());
            return 1;
        }
    }
}
