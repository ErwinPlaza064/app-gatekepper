<?php

namespace App\Http\Controllers;

use App\Http\Requests\Email\SendEmailRequest;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;

class SendEmailController extends Controller
{
    public function send(SendEmailRequest $request)
    {
        $data = array(
            'email' => $request->email,
            'fullname' => $request->fullname,
            'messages' => $request->message
        );

        Mail::send('email', $data, function ($message) use ($data) {
            $message->from(env('MAIL_USERNAME', 'sundownertech.mx@gmail.com'));
            $message->to(env('MAIL_TO_USERNAME', 'erwinmartinez064@gmail.com'), $data['fullname']);
        });

        return to_route('success');
    }
}
