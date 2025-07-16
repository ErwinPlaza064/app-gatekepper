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
    protected static ?int $sort = 1;

    protected int | string | array $columnSpan = 'full';

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

        // Total de quejas
        $totalComplaints = Complaint::count();

        return [
            Stat::make('QR Activos', $activeQrCodes)
                ->description('Códigos QR válidos y disponibles')
                ->descriptionIcon('heroicon-m-qr-code')
                ->color('success')
                ->chart([7, 12, 18, 24, 30, 35, $activeQrCodes]),

            Stat::make('Visitas de Hoy', $todayVisits)
                ->description('Ingresos registrados hoy')
                ->descriptionIcon('heroicon-m-user-group')
                ->color('info')
                ->chart([5, 8, 12, 15, 20, 25, $todayVisits]),

            Stat::make('Total Usuarios', $totalUsers)
                ->description('Usuarios registrados en el sistema')
                ->descriptionIcon('heroicon-m-users')
                ->color('primary')
                ->chart([10, 25, 40, 55, 70, 85, $totalUsers]),

            Stat::make('Total Quejas', $totalComplaints)
                ->description('Quejas registradas en el sistema')
                ->descriptionIcon('heroicon-m-exclamation-triangle')
                ->color($totalComplaints > 0 ? 'warning' : 'success')
                ->chart([0, 2, 4, 6, 8, 10, $totalComplaints]),
        ];
    }
}
