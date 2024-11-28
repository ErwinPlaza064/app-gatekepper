<?php

namespace App\Filament\Resources\VisitorResource\Pages;

use App\Filament\Resources\VisitorResource;
use App\Notifications\NewVisitorNotification;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;
use Filament\Actions;

class EditVisitor extends EditRecord
{
    protected static string $resource = VisitorResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }

    // Este hook se ejecuta después de que el registro ha sido guardado
    protected function afterSave(): void
    {
        // Obtener el visitante actualizado
        $visitor = $this->record;

        // Obtener el residente (user) asignado
        $user = $visitor->user;

        Log::info('Tipo de $user: ', [$user]);

        // Verificar el tipo de $visitor
        Log::info('Tipo de $visitor: ', [$visitor]);

        if ($user instanceof \App\Models\User) {
            // Enviar la notificación
            Notification::send($user, new NewVisitorNotification($visitor));
            Log::info('Notificación enviada a ' . $user->name . ' sobre el visitante ' . $visitor->name);
        } else {
            Log::warning('No se asignó un residente para el visitante ' . $visitor->name);
        }
    }
}
