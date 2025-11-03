<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\EmailService;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Exception;

class TestEmailCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'email:test
                            {email : Email address to send test to}
                            {--method=all : Test method (all, sendgrid, smtp, failover)}
                            {--verbose : Show detailed output}';

    /**
     * The console command description.
     */
    protected $description = 'Test email sending functionality with different methods';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $method = $this->option('method');
        $verbose = $this->option('verbose');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email address provided');
            return 1;
        }

        $this->info("🧪 Testing email functionality...");
        $this->info("📧 Target email: {$email}");
        $this->info("🔧 Method: {$method}");
        $this->newLine();

        switch ($method) {
            case 'sendgrid':
                return $this->testSendGrid($email, $verbose);
            case 'smtp':
                return $this->testSMTP($email, $verbose);
            case 'failover':
                return $this->testFailover($email, $verbose);
            case 'all':
            default:
                return $this->testAll($email, $verbose);
        }
    }

    private function testAll($email, $verbose)
    {
        $this->info("🔄 Testing all email methods...");
        $this->newLine();

        $results = [];

        // Test Custom EmailService
        $results['custom_service'] = $this->testCustomEmailService($email, $verbose);

        // Test SendGrid
        $results['sendgrid'] = $this->testSendGrid($email, $verbose);

        // Test SMTP
        $results['smtp'] = $this->testSMTP($email, $verbose);

        // Test Failover
        $results['failover'] = $this->testFailover($email, $verbose);

        $this->newLine();
        $this->info("📊 Summary:");
        foreach ($results as $method => $success) {
            $status = $success ? '✅ PASS' : '❌ FAIL';
            $this->line("  {$method}: {$status}");
        }

        return array_sum($results) > 0 ? 0 : 1;
    }

    private function testCustomEmailService($email, $verbose)
    {
        $this->info("1️⃣  Testing Custom EmailService...");

        try {
            $emailService = new EmailService();

            $result = $emailService->sendEmail(
                $email,
                '🧪 Test Email - Custom Service',
                $this->getTestEmailContent('Custom EmailService'),
                config('mail.from.address'),
                config('mail.from.name')
            );

            if ($result['success']) {
                $this->info("   ✅ Custom EmailService: SUCCESS");
                if ($verbose) {
                    $this->line("   📄 Method used: " . ($result['method'] ?? 'unknown'));
                    $this->line("   📋 Response: " . json_encode($result, JSON_PRETTY_PRINT));
                }
                return true;
            } else {
                $this->error("   ❌ Custom EmailService: FAILED");
                if ($verbose) {
                    $this->line("   📋 Response: " . json_encode($result, JSON_PRETTY_PRINT));
                }
                return false;
            }

        } catch (Exception $e) {
            $this->error("   ❌ Custom EmailService: EXCEPTION - " . $e->getMessage());
            if ($verbose) {
                $this->line("   📋 Error details: " . $e->getTraceAsString());
            }
            return false;
        }
    }

    private function testSendGrid($email, $verbose)
    {
        $this->info("2️⃣  Testing SendGrid SMTP...");

        try {
            $originalMailer = config('mail.default');
            config(['mail.default' => 'sendgrid']);

            Mail::html($this->getTestEmailContent('SendGrid SMTP'), function ($message) use ($email) {
                $message->to($email)
                    ->subject('🧪 Test Email - SendGrid SMTP')
                    ->from(config('mail.from.address'), config('mail.from.name'));
            });

            config(['mail.default' => $originalMailer]);

            $this->info("   ✅ SendGrid SMTP: SUCCESS");
            return true;

        } catch (Exception $e) {
            $this->error("   ❌ SendGrid SMTP: FAILED - " . $e->getMessage());
            if ($verbose) {
                $this->line("   📋 Error details: " . $e->getTraceAsString());
            }
            return false;
        }
    }

    private function testSMTP($email, $verbose)
    {
        $this->info("3️⃣  Testing SMTP Fallback...");

        try {
            $originalMailer = config('mail.default');
            config(['mail.default' => 'smtp']);

            Mail::html($this->getTestEmailContent('SMTP Fallback'), function ($message) use ($email) {
                $message->to($email)
                    ->subject('🧪 Test Email - SMTP Fallback')
                    ->from(config('mail.from.address'), config('mail.from.name'));
            });

            config(['mail.default' => $originalMailer]);

            $this->info("   ✅ SMTP Fallback: SUCCESS");
            return true;

        } catch (Exception $e) {
            $this->error("   ❌ SMTP Fallback: FAILED - " . $e->getMessage());
            if ($verbose) {
                $this->line("   📋 Error details: " . $e->getTraceAsString());
            }
            return false;
        }
    }

    private function testFailover($email, $verbose)
    {
        $this->info("4️⃣  Testing Failover System...");

        try {
            $originalMailer = config('mail.default');
            config(['mail.default' => 'failover']);

            Mail::html($this->getTestEmailContent('Failover System'), function ($message) use ($email) {
                $message->to($email)
                    ->subject('🧪 Test Email - Failover System')
                    ->from(config('mail.from.address'), config('mail.from.name'));
            });

            config(['mail.default' => $originalMailer]);

            $this->info("   ✅ Failover System: SUCCESS");
            return true;

        } catch (Exception $e) {
            $this->error("   ❌ Failover System: FAILED - " . $e->getMessage());
            if ($verbose) {
                $this->line("   📋 Error details: " . $e->getTraceAsString());
            }
            return false;
        }
    }

    private function getTestEmailContent($method)
    {
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                .footer { background: #374151; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; }
                .success { background: #D1FAE5; border: 1px solid #10B981; color: #065F46; padding: 15px; border-radius: 6px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🧪 Gatekeeper</h1>
                    <p>Email Test</p>
                </div>
                <div class="content">
                    <h2>¡Email Test Exitoso!</h2>
                    <div class="success">
                        <p><strong>✅ Método utilizado:</strong> ' . $method . '</p>
                        <p><strong>🕐 Hora de envío:</strong> ' . now()->format('d/m/Y H:i:s') . '</p>
                        <p><strong>📧 Destinatario:</strong> Test</p>
                    </div>
                    <p>Si recibes este email, significa que el sistema de correo está funcionando correctamente.</p>
                    <h3>Configuración probada:</h3>
                    <ul>
                        <li>✅ Conexión establecida</li>
                        <li>✅ Autenticación exitosa</li>
                        <li>✅ Entrega completada</li>
                    </ul>
                </div>
                <div class="footer">
                    <p>Este es un email de prueba enviado por Gatekeeper</p>
                    <p>Sistema de Control de Acceso</p>
                </div>
            </div>
        </body>
        </html>';
    }
}
