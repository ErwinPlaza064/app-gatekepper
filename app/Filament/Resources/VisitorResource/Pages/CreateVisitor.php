<?php
namespace App\Filament\Resources\VisitorResource\Pages;

use App\Filament\Resources\VisitorResource;
use Filament\Resources\Pages\CreateRecord;

class CreateVisitor extends CreateRecord
{
    protected static string $resource = VisitorResource::class;

    protected function handleRecordCreation(array $data): \App\Models\Visitor
    {
        // TODOS los visitantes requieren aprobación del residente
        // Tanto registros manuales como QR deben ser aprobados

        // NO establecer entry_time todavía - se establecerá cuando sea aprobado
        unset($data['entry_time']);

        // Establecer estado pendiente para TODOS los registros
        $data['approval_status'] = 'pending';
        $data['approval_requested_at'] = now();
        $data['approval_notes'] = ($data['approval_notes'] ?? '') . ' [Registro manual desde panel - Requiere aprobación del residente]';

        $visitor = parent::handleRecordCreation($data);

        // Enviar notificación de aprobación al residente
        try {
            $resident = $visitor->user;
            if ($resident && $resident->email) {
                $resident->notify(new \App\Notifications\NewVisitorNotification($visitor));

                \Illuminate\Support\Facades\Log::info('Notificación de aprobación enviada al residente', [
                    'visitor_id' => $visitor->id,
                    'resident_email' => $resident->email,
                    'method' => 'manual_admin'
                ]);
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error enviando notificación de aprobación', [
                'visitor_id' => $visitor->id,
                'error' => $e->getMessage()
            ]);
        }

        // Log para diferenciar registros manuales vs QR
        \Illuminate\Support\Facades\Log::info('Visitante creado manualmente - Pendiente de aprobación', [
            'visitor_id' => $visitor->id,
            'visitor_name' => $visitor->name,
            'resident_id' => $visitor->user_id,
            'created_by' => auth()->user()?->name ?? 'Sistema',
            'method' => 'manual_admin',
            'status' => 'pending_approval'
        ]);

        return $visitor;
    }    protected function getCreatedNotification(): ?\Filament\Notifications\Notification
    {
        return \Filament\Notifications\Notification::make()
            ->warning()
            ->title('📝 Visitante registrado - Pendiente de aprobación')
            ->body('El visitante ha sido registrado exitosamente. Se ha enviado una notificación al residente para su aprobación.')
            ->duration(7000);
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
