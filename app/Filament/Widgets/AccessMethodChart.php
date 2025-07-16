<?php

namespace App\Filament\Widgets;

use App\Models\Visitor;
use Filament\Widgets\ChartWidget;
use Carbon\Carbon;

class AccessMethodChart extends ChartWidget
{
    protected static ?string $heading = 'Métodos de Acceso - Últimos 7 Días';
    protected static ?int $sort = 4;
    
    protected int | string | array $columnSpan = [
        'md' => 2,
        'xl' => 2,
    ];

    protected function getData(): array
    {
        $qrAccess = [];
        $manualAccess = [];
        $labels = [];

        // Obtener datos de los últimos 7 días
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);

            // Accesos con QR (asumiendo que tienen qr_code_id)
            $qrCount = Visitor::whereDate('entry_time', $date)
                ->whereNotNull('qr_code_id')
                ->count();

            // Accesos manuales (sin qr_code_id)
            $manualCount = Visitor::whereDate('entry_time', $date)
                ->whereNull('qr_code_id')
                ->count();

            $qrAccess[] = $qrCount;
            $manualAccess[] = $manualCount;
            $labels[] = $date->format('M d');
        }

        return [
            'datasets' => [
                [
                    'label' => 'Acceso con QR',
                    'data' => $qrAccess,
                    'backgroundColor' => '#10B981',
                    'borderColor' => '#059669',
                    'borderWidth' => 2,
                ],
                [
                    'label' => 'Acceso Manual',
                    'data' => $manualAccess,
                    'backgroundColor' => '#F59E0B',
                    'borderColor' => '#D97706',
                    'borderWidth' => 2,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getOptions(): array
    {
        return [
            'responsive' => true,
            'maintainAspectRatio' => false,
            'scales' => [
                'y' => [
                    'beginAtZero' => true,
                    'ticks' => [
                        'stepSize' => 1,
                    ],
                ],
            ],
            'plugins' => [
                'legend' => [
                    'position' => 'top',
                ],
            ],
        ];
    }
}
