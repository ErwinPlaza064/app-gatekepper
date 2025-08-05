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
        try {
            $user = $request->user();

            // Verificar que el usuario existe
            if (!$user) {
                Log::error('[DASHBOARD] Usuario no autenticado');
                return redirect()->route('login');
            }

            Log::info('[DASHBOARD] Cargando dashboard para usuario', ['id' => $user->id, 'email' => $user->email]);

            // Estadísticas rápidas con manejo de errores
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

            // Obtener visitas recientes
            $visits = Visitor::where('user_id', $user->id)
                ->orderBy('entry_time', 'desc')
                ->limit(10) // Limitar para mejorar performance
                ->get(['name', 'id_document', 'vehicle_plate', 'entry_time', 'created_at']);

            // Obtener notificaciones del usuario
            $notifications = $user->notifications()->limit(20)->get();

            // Obtener quejas del usuario
            $complaints = Complaint::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(10) // Limitar para mejorar performance
                ->get(['id', 'message', 'created_at']);

            Log::info('[DASHBOARD] Dashboard cargado exitosamente', [
                'user_id' => $user->id,
                'visits_count' => $visitsCount,
                'complaints_count' => $complaintsCount
            ]);

            return Inertia::render('Dashboard', [
                'auth' => [
                    'user' => $user,
                    'notifications' => $notifications,
                ],
                'visits' => $visits,
                'stats' => [
                    'visitas' => $visitsCount,
                    'quejas' => $complaintsCount,
                    'qrs' => $qrCount,
                ],
                'visitsChartData' => [
                    'labels' => $chartLabels,
                    'values' => $chartValues,
                ],
                'complaints' => $complaints,
            ]);

        } catch (\Exception $e) {
            Log::error('[DASHBOARD] Error cargando dashboard', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $request->user() ? $request->user()->id : 'no-user'
            ]);

            // En caso de error, retornar una versión mínima del dashboard
            return Inertia::render('Dashboard', [
                'auth' => [
                    'user' => $request->user(),
                    'notifications' => [],
                ],
                'visits' => [],
                'stats' => [
                    'visitas' => 0,
                    'quejas' => 0,
                    'qrs' => 0,
                ],
                'visitsChartData' => [
                    'labels' => [],
                    'values' => [],
                ],
                'complaints' => [],
                'error' => 'Error cargando datos del dashboard'
            ]);
        }
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
