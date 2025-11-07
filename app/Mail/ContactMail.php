<?php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactMail extends Mailable
{
    use Queueable, SerializesModels;

    public $data;
    public $isConfirmation;

    public function __construct($data, $isConfirmation = false)
    {
        $this->data = $data;
        $this->isConfirmation = $isConfirmation;
    }

    public function build()
    {
        $subject = $this->data['subject'] ?? 'Nuevo mensaje de contacto';

        if ($this->isConfirmation) {
            $subject = 'Confirmación: ' . $subject;
        }

        return $this->from(config('mail.from.address'), config('mail.from.name'))
                    ->subject($subject)
                    ->view('email')
                    ->with([
                        'data' => $this->data,
                        'isConfirmation' => $this->isConfirmation
                    ]);
    }
}
