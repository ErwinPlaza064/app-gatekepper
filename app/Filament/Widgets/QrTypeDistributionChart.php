<?php

namespace App\Filament\Widgets;

use App\Models\QrCode;
use Filament\Widgets\ChartWidget;

class QrTypeDistributionChart extends ChartWidget
{
    protected static ?string $heading = 'Distribución de Tipos de QR';
    protected static ?int $sort = 3;

    protected int | string | array $columnSpan = [
        'md' => 1,
        'xl' => 1,
    ];

    protected function getData(): array
    {
        $singleUse = QrCode::where('qr_type', 'single_use')->count();
        $timeLimited = QrCode::where('qr_type', 'time_limited')->count();
        $recurring = QrCode::where('qr_type', 'recurring')->count();

        return [
            'datasets' => [
                [
                    'data' => [$singleUse, $timeLimited, $recurring],
                    'backgroundColor' => [
                        '#EF4444', // Red for single use
                        '#F59E0B', // Yellow for time limited
                        '#10B981', // Green for recurring
                    ],
                    'borderColor' => [
                        '#DC2626',
                        '#D97706',
                        '#059669',
                    ],
                    'borderWidth' => 2,
                ],
            ],
            'labels' => ['Uso Único', 'Tiempo Limitado', 'Recurrente'],
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }

    protected function getOptions(): array
    {
        return [
            'responsive' => true,
            'maintainAspectRatio' => false,
            'plugins' => [
                'legend' => [
                    'position' => 'bottom',
                ],
            ],
        ];
    }
}
