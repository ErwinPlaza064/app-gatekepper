<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The application's command schedule.
     *
     * @var array
     */
    protected $commands = [
        Commands\NotifyExpiringQrCodes::class,
    ];

    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        $schedule->command('app:notify-expiring-qr-codes --hours=2') // ✅ CORREGIDO
                 ->hourly()
                 ->withoutOverlapping();

        $schedule->command('app:notify-expiring-qr-codes --hours=24') // ✅ CORREGIDO
                 ->dailyAt('09:00')
                 ->withoutOverlapping();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
