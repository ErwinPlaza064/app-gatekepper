<?php

namespace App\Filament\Resources\QrScannerResource\Pages;

use App\Filament\Resources\QrScannerResource;
use Filament\Resources\Pages\Page;

class QrScanner extends Page
{
    protected static string $resource = QrScannerResource::class;

    protected static string $view = 'filament.resources.qr-scanner-resource.pages.qr-scanner';

    protected static ?string $title = 'Escáner de Códigos QR';

    public function getHeading(): string
    {
        return 'Escáner de Códigos QR';
    }

    public function getSubheading(): ?string
    {
        return 'Escanea códigos QR usando la cámara o subiendo una imagen';
    }
}
