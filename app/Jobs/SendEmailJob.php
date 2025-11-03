<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Services\EmailService;

class SendEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $to;
    protected $subject;
    protected $content;
    protected $fromAddress;
    protected $fromName;

    /**
     * Create a new job instance.
     */
    public function __construct($to, $subject, $content, $fromAddress = null, $fromName = null)
    {
        $this->to = $to;
        $this->subject = $subject;
        $this->content = $content;
        $this->fromAddress = $fromAddress ?? config('mail.from.address');
        $this->fromName = $fromName ?? config('mail.from.name');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $emailService = new EmailService();

            $result = $emailService->sendEmail(
                $this->to,
                $this->subject,
                $this->content,
                $this->fromAddress,
                $this->fromName
            );

            if ($result['success']) {
                Log::info('Email enviado exitosamente via queue', [
                    'to' => $this->to,
                    'subject' => $this->subject,
                    'method' => $result['method'] ?? 'unknown',
                    'email_service_response' => $result
                ]);
            } else {
                Log::error('Error enviando email via queue', [
                    'to' => $this->to,
                    'subject' => $this->subject,
                    'error' => $result['error'] ?? 'Unknown error'
                ]);

                // Reintentar el job si falla
                $this->fail(new \Exception('Email service failed: ' . ($result['error'] ?? 'Unknown error')));
            }

        } catch (\Exception $e) {
            Log::error('Exception en SendEmailJob', [
                'to' => $this->to,
                'subject' => $this->subject,
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);

            throw $e;
        }
    }

    /**
     * The job failed to process.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('SendEmailJob failed definitivamente', [
            'to' => $this->to,
            'subject' => $this->subject,
            'exception' => $exception->getMessage()
        ]);
    }
}
