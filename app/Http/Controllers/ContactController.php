<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Mail\ContactMail;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'fullname' => 'required|string|min:3|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|min:5|max:255',
            'message' => 'required|string|min:10|max:1000',
            'location' => 'nullable|array',
            'location.lat' => 'required_with:location|numeric',
            'location.lng' => 'required_with:location|numeric',
            'location.address' => 'required_with:location|string',
        ]);

        $mailData = [
            'fullname' => $request->fullname,
            'email' => $request->email,
            'subject' => $request->subject,
            'message' => $request->message,
            'location' => $request->location,
        ];

        // Enviar email al administrador
        $adminEmail = env('ADMIN_EMAIL', 'plazaerwin41@gmail.com');
        Mail::to($adminEmail)->send(new ContactMail($mailData));

        // Enviar email de confirmación al usuario
        Mail::to($request->email)->send(new ContactMail($mailData, true));

        return back()->with('success', 'Mensaje enviado correctamente');
    }
}
