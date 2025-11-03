<?php

namespace App\Filament\Widgets;

use App\Models\Visitor;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Carbon\Carbon;

class VisitorApprovalStatsWidget extends BaseWidget
{
    protected function getStats(): array
    {
        // Estadísticas de hoy
        $today = Carbon::today();

        $pendingToday = Visitor::where('approval_status', 'pending')
            ->whereDate('created_at', $today)
            ->count();

        $approvedToday = Visitor::where('approval_status', 'approved')
            ->whereDate('approval_responded_at', $today)
            ->count();

        $rejectedToday = Visitor::where('approval_status', 'rejected')
            ->whereDate('approval_responded_at', $today)
            ->count();

        $insideNow = Visitor::where('approval_status', 'approved')
            ->whereNotNull('entry_time')
            ->whereNull('exit_time')
            ->count();

        return [
            Stat::make('⏳ Pendientes Hoy', $pendingToday)
                ->description('Visitantes esperando aprobación')
                ->descriptionIcon('heroicon-m-clock')
                ->color($pendingToday > 5 ? 'warning' : 'primary')
                ->chart([1, 3, $pendingToday, 2, 4])
                ->url(route('filament.admin.resources.visitors.index', ['tableFilters[pending_approval][isActive]' => true])),

            Stat::make('✅ Aprobados Hoy', $approvedToday)
                ->description('Visitantes aprobados hoy')
                ->descriptionIcon('heroicon-m-check-circle')
                ->color('success')
                ->chart([2, 4, 6, $approvedToday])
                ->url(route('filament.admin.resources.visitors.index', ['tableFilters[approved_visits][isActive]' => true])),

            Stat::make('🏠 Visitantes Adentro', $insideNow)
                ->description('Actualmente en el edificio')
                ->descriptionIcon('heroicon-m-home')
                ->color($insideNow > 10 ? 'warning' : 'info')
                ->chart([5, 8, $insideNow, 6, 9])
                ->url(route('filament.admin.resources.visitors.index', ['tableFilters[active_visits][isActive]' => true])),

            Stat::make('❌ Rechazados Hoy', $rejectedToday)
                ->description('Visitantes rechazados hoy')
                ->descriptionIcon('heroicon-m-x-circle')
                ->color($rejectedToday > 0 ? 'danger' : 'gray')
                ->chart([0, 1, $rejectedToday, 0, 1])
                ->url(route('filament.admin.resources.visitors.index', ['tableFilters[rejected_visits][isActive]' => true])),
        ];
    }

    protected function getColumns(): int
    {
        return 4;
    }

    public function getDisplayName(): string
    {
        return 'Estadísticas de Aprobación de Visitantes';
    }
}
