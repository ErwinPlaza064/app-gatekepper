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
                ->get(['name', 'entry_time']),
        ]);
    }

    public function misVisitas(Request $request){
        $user = $request->user();

        //Obtiene el termino de busqueda desde el request
        $search = $request->input('search');

       // Filtramos las visitas por nombre si se proporciona una búsqueda
        $visits = Visitor::where('user_id', $user->id)
        ->when($search, function ($query, $search) {
            return $query->where('name', 'like', '%' . $search . '%');
        })
        ->orderBy('entry_time', 'desc')
        ->get(['name', 'entry_time']);

        return Inertia::render('Links/MisVisitas', [
            'auth' => ['user' => $user],
            'visits' => $visits,
            'searchQuery' => $search, // Para recordar lo que el usuario buscó
        ]);
    }

    public function markNotificationsAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['success' => true]);
    }
}
