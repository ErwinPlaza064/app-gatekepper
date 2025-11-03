<?php
namespace App\Filament\Resources\VisitorResource\Pages;

use App\Filament\Resources\VisitorResource;
use Filament\Resources\Pages\CreateRecord;

class CreateVisitor extends CreateRecord
{
    protected static string $resource = VisitorResource::class;

    protected function handleRecordCreation(array $data): \App\Models\Visitor
    {
        // Para registros manuales desde Filament, el visitante ya está aprobado
        // porque un administrador/portero lo está registrando directamente

        // Asegurar que tenga entry_time (si no se proporcionó, usar hora actual)
        if (empty($data['entry_time'])) {
            $data['entry_time'] = now();
        }

        // Establecer aprobación automática para registros manuales
        $data['approval_status'] = 'approved';
        $data['approval_responded_at'] = now();
        $data['approval_notes'] = ($data['approval_notes'] ?? '') . ' [Registro manual desde panel administrativo]';

        $visitor = parent::handleRecordCreation($data);

        // Log para diferenciar registros manuales vs QR
        \Illuminate\Support\Facades\Log::info('Visitante creado manualmente desde Filament', [
            'visitor_id' => $visitor->id,
            'visitor_name' => $visitor->name,
            'entry_time' => $visitor->entry_time,
            'created_by' => auth()->user()?->name ?? 'Sistema',
            'method' => 'manual_admin'
        ]);

        return $visitor;
    }

    protected function getCreatedNotification(): ?\Filament\Notifications\Notification
    {
        return \Filament\Notifications\Notification::make()
            ->success()
            ->title('✅ Visitante registrado correctamente')
            ->body('El visitante ha sido registrado con hora de entrada automática. No requiere aprobación adicional.')
            ->duration(5000);
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
