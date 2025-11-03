<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\NotificationService;

class CheckEnvironmentCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'env:check {--verbose : Show detailed environment info}';

    /**
     * The console command description.
     */
    protected $description = 'Check current environment and email configuration';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $verbose = $this->option('verbose');

        $this->info("🔍 Environment Check - Gatekeeper");
        $this->info("================================");
        $this->newLine();

        $envInfo = NotificationService::getEnvironmentInfo();

        // Información básica
        $this->info("🌍 Environment Detection:");
        $this->line("  Environment: " . ($envInfo['is_railway'] ? '🚂 Railway' : '💻 Local'));
        $this->line("  App Environment: " . ($envInfo['app_env'] ?? 'unknown'));
        $this->line("  Mail Mailer: " . ($envInfo['mail_mailer'] ?? 'unknown'));

        if ($verbose) {
            $this->newLine();
            $this->info("🔧 Detailed Info:");
            $this->line("  Railway Environment: " . ($envInfo['railway_env'] ?? 'not set'));
            $this->line("  Railway Project ID: " . ($envInfo['railway_project'] ?? 'not set'));
            $this->line("  Railway Service: " . ($envInfo['railway_service'] ?? 'not set'));
        }

        // Configuración de email
        $this->newLine();
        $this->info("📧 Email Configuration:");

        $sendgridKey = env('SENDGRID_API_KEY');
        if ($sendgridKey) {
            $this->line("  ✅ SendGrid API Key: " . substr($sendgridKey, 0, 15) . "...");
        } else {
            $this->error("  ❌ SendGrid API Key: Not configured");
        }

        $fromAddress = config('mail.from.address');
        $fromName = config('mail.from.name');

        $this->line("  📨 From Address: " . ($fromAddress ?? 'not set'));
        $this->line("  👤 From Name: " . ($fromName ?? 'not set'));

        // Recomendaciones
        $this->newLine();
        $this->info("💡 Recommendations:");

        if ($envInfo['is_railway']) {
            $this->line("  🚂 Railway detected - using QrUsedNotificationRailway (no SMTP)");
            $this->line("  ✅ This should prevent SMTP timeout errors");

            if (!$sendgridKey) {
                $this->error("  ⚠️  Configure SENDGRID_API_KEY for email functionality");
            }
        } else {
            $this->line("  💻 Local environment - using QrUsedNotification with fallback");
            $this->line("  ℹ️  SMTP fallback is available for local development");
        }

        // Test notification type
        $this->newLine();
        $this->info("🧪 Notification Test:");

        try {
            $testUser = new \App\Models\User();
            $testUser->id = 999;
            $testUser->email = 'test@example.com';

            $testQr = new \App\Models\QrCode();
            $testQr->qr_id = 'test-qr';
            $testQr->visitor_name = 'Test Visitor';

            $result = NotificationService::sendQrUsedNotification($testUser, $testQr, []);

            $this->line("  📋 Would use: " . $result['notification_class']);
            $this->line("  🌍 Environment: " . $result['environment']);

        } catch (\Exception $e) {
            $this->error("  ❌ Test failed: " . $e->getMessage());
        }

        return 0;
    }
}
