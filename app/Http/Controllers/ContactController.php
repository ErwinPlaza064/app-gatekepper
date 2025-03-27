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
            'email' => 'required|email',
            'fullname' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
        ]);

        Mail::to('plazaerwin41@gmail.com')->send(new ContactMail($request->all()));

        return redirect()->route('success')->with('success', 'Mensaje enviado correctamente');
    }
}
