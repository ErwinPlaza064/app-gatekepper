<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Visitor;


class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        return Inertia::render('Dashboard', [
            'auth' => [
                'user' => $user,
                'notifications' => $user->notifications, // 🔥 Notificaciones
            ],
            'visits' => Visitor::where('user_id', $user->id)
                ->orderBy('entry_time', 'desc') // 🔥 Ordenar por fecha de entrada
                ->limit(5) // 🔥 Solo las 5 visitas más recientes
                ->get(['name', 'entry_time']), // 🔥 Solo obtener estos campos
        ]);
    }

    public function markNotificationsAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead(); // 🔥 Marcar todas como leídas
        return response()->json(['success' => true]); // ✅ Responder con JSON
    }
}
