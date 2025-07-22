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

        // Estadísticas rápidas
        $visitsCount = Visitor::where('user_id', $user->id)->count();
        $complaintsCount = Complaint::where('user_id', $user->id)->count();
        $usersCount = \App\Models\User::count();
        $qrCount = \App\Models\QrCode::where('user_id', $user->id)->count();

        // Datos para la gráfica de visitas por día (últimos 7 días)
        $visitsByDay = Visitor::where('user_id', $user->id)
            ->selectRaw('DATE(entry_time) as day, COUNT(*) as count')
            ->groupBy('day')
            ->orderBy('day', 'desc')
            ->limit(7)
            ->get();

        $chartLabels = $visitsByDay->pluck('day')->map(function($date) {
            return date('D', strtotime($date));
        });
        $chartValues = $visitsByDay->pluck('count');

        return Inertia::render('Dashboard', [
            'auth' => [
                'user' => $user,
                'notifications' => $user->notifications,
            ],
            'visits' => Visitor::where('user_id', $user->id)
                ->orderBy('entry_time', 'desc')
                ->get(['name', 'id_document', 'vehicle_plate', 'entry_time', 'created_at']),
            'stats' => [
                'visitas' => $visitsCount,
                'quejas' => $complaintsCount,
                'qrs' => $qrCount,
            ],
            'visitsChartData' => [
                'labels' => $chartLabels,
                'values' => $chartValues,
            ],
            // Historial de quejas del usuario autenticado
            'complaints' => Complaint::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get(['id', 'message', 'created_at']),
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
