<?php

namespace App\Filament\Widgets;

use App\Models\QrCode;
use App\Models\Visitor;
use App\Models\User;
use App\Models\Complaint;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Carbon\Carbon;

class DashboardStatsWidget extends BaseWidget
{
    protected function getStats(): array
    {
        // Total de QR activos
        $activeQrCodes = QrCode::where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('valid_until')
                    ->orWhere('valid_until', '>', Carbon::now());
            })
            ->where('current_uses', '<', 'max_uses')
            ->count();

        // Visitas de hoy
        $todayVisits = Visitor::whereDate('entry_time', Carbon::today())->count();

        // Total de usuarios
        $totalUsers = User::count();

        // Quejas pendientes
        $pendingComplaints = Complaint::where('status', 'pending')->count();

        return [
            Stat::make('QR Activos', $activeQrCodes)
                ->description('Códigos QR válidos y disponibles')
                ->descriptionIcon('heroicon-m-qr-code')
                ->color('success'),

            Stat::make('Visitas de Hoy', $todayVisits)
                ->description('Ingresos registrados hoy')
                ->descriptionIcon('heroicon-m-user-group')
                ->color('info'),

            Stat::make('Total Usuarios', $totalUsers)
                ->description('Usuarios registrados en el sistema')
                ->descriptionIcon('heroicon-m-users')
                ->color('primary'),

            Stat::make('Quejas Pendientes', $pendingComplaints)
                ->description('Quejas sin resolver')
                ->descriptionIcon('heroicon-m-exclamation-triangle')
                ->color($pendingComplaints > 0 ? 'warning' : 'success'),
        ];
    }
}
