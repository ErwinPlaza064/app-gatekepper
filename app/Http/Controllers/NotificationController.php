<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index()
    {
        // Puedes usar el método notifications() o unreadNotifications() para solo traer las no leídas
        return response()->json(auth()->user()->notifications);
    }
}
