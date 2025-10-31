<?php

namespace App\Mail;

use App\Services\SendGridService;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\TransportInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mime\MessageConverter;

class SendGridApiTransport implements TransportInterface
{
    protected $sendGridService;

    public function __construct()
    {
        $this->sendGridService = new SendGridService();
    }

    public function send(\Symfony\Component\Mime\RawMessage $message, ?\Symfony\Component\Mime\Address\Envelope $envelope = null): ?SentMessage
    {
        $email = MessageConverter::toEmail($message);

        // Extraer datos del mensaje
        $to = $email->getTo()[0] ?? null;
        $subject = $email->getSubject();
        $from = $email->getFrom()[0] ?? null;

        if (!$to) {
            Log::error('SendGridApiTransport: No recipient found');
            return null;
        }

        // Obtener contenido HTML o texto plano
        $htmlBody = $email->getHtmlBody();
        $textBody = $email->getTextBody();
        $content = $htmlBody ?: $textBody ?: '';

        // Enviar usando SendGrid API
        try {
            $result = $this->sendGridService->sendEmail(
                $to->getAddress(),
                $subject,
                $content,
                $from ? $from->getAddress() : config('mail.from.address'),
                $from ? $from->getName() : config('mail.from.name')
            );

            if ($result['success']) {
                Log::info('SendGridApiTransport: Email sent successfully', [
                    'to' => $to->getAddress(),
                    'subject' => $subject
                ]);
            } else {
                Log::error('SendGridApiTransport: Failed to send email', [
                    'to' => $to->getAddress(),
                    'subject' => $subject,
                    'error' => $result['error'] ?? 'Unknown error'
                ]);
            }

            return new SentMessage($message, $envelope ?? \Symfony\Component\Mime\Address\Envelope::create($message));

        } catch (\Exception $e) {
            Log::error('SendGridApiTransport: Exception', [
                'to' => $to->getAddress(),
                'subject' => $subject,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    public function __toString(): string
    {
        return 'sendgrid-api';
    }
}
