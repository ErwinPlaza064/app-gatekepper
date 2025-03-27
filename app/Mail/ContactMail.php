<?php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactMail extends Mailable
{
    use Queueable, SerializesModels;

    public $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function build()
    {
        return $this->from($this->data['email'], $this->data['fullname'])
                    ->to('plazaerwin41@gmail.com')
                    ->subject('Nuevo mensaje de contacto')
                    ->view('email')
                    ->with('data', $this->data);
    }
}
