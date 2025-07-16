<?php

namespace App\Filament\Widgets;

use App\Models\QrCode;
use Filament\Widgets\ChartWidget;

class QrTypeDistributionChart extends ChartWidget
{
    protected static ?string $heading = 'Distribución de Tipos de QR';

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
                        'rgb(239, 68, 68)',   // Red para single_use
                        'rgb(245, 158, 11)',  // Yellow para time_limited
                        'rgb(34, 197, 94)',   // Green para recurring
                    ],
                    'borderColor' => [
                        'rgb(220, 38, 38)',
                        'rgb(217, 119, 6)',
                        'rgb(21, 128, 61)',
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
