<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Visitor;
use App\Models\Complaint;
use Illuminate\Support\Facades\Log;




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
                ->get(['name', 'entry_time']),
        ]);
    }

    public function misVisitas(Request $request){
        $user = $request->user();

        $search = $request->input('search');

        $visits = Visitor::where('user_id', $user->id)
        ->when($search, function ($query, $search) {
            return $query->where('name', 'like', '%' . $search . '%');
        })
        ->orderBy('entry_time', 'desc')
        ->get(['name', 'entry_time']);

        return Inertia::render('Links/MisVisitas', [
            'auth' => ['user' => $user],
            'visits' => $visits,
            'searchQuery' => $search,
        ]);
    }

    public function store(Request $request)
    {
            $request->validate([
                'message' => 'required|string|max:255',
            ]);

            Complaint::create([
                'message' => $request->message,
                'user_id' => auth()->id(),
            ]);

            return redirect()->back()->with('success', 'Queja enviada correctamente');
    }



    public function markNotificationsAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['success' => true]);
    }
}
