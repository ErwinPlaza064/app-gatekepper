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
                'notifications' => $user->notifications,
            ],
            'visits' => Visitor::where('user_id', $user->id)
                ->orderBy('entry_time', 'desc')
                ->limit(5)
                ->get(['name', 'entry_time']),
        ]);
    }

    public function markNotificationsAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['success' => true]);
    }
}
