<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\QrCode;
use App\Notifications\QrExpiringNotification;
use Carbon\Carbon;

class NotifyExpiringQrCodes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:notify-expiring-qr-codes {--hours=2}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Notify users about QR codes that will expire soon';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $hours = $this->option('hours');
        $threshold = Carbon::now()->addHours($hours);

        $expiringQrCodes = QrCode::where('is_active', true)
            ->where('valid_until', '<=', $threshold)
            ->where('valid_until', '>', Carbon::now())
            ->whereHas('user')
            ->with('user')
            ->get();

        $this->info("Encontrados {$expiringQrCodes->count()} códigos QR próximos a expirar");

        foreach ($expiringQrCodes as $qrCode) {
            try {
                $qrCode->user->notify(new QrExpiringNotification($qrCode));
                $this->line("Notificación enviada para QR: {$qrCode->qr_id}");
            } catch (\Exception $e) {
                $this->error("Error enviando notificación para QR {$qrCode->qr_id}: {$e->getMessage()}");
            }
        }

        $this->info('Proceso completado');
    }
}
