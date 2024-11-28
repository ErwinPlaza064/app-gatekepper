<?php
namespace App\Filament\Resources\VisitorResource\Pages;

use App\Filament\Resources\VisitorResource;
use App\Notifications\NewVisitorNotification;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;

class CreateVisitor extends CreateRecord
{
    protected static string $resource = VisitorResource::class;

    protected function handleRecordCreation(array $data): \App\Models\Visitor
    {
        // Llamamos al método padre para crear el registro
        $visitor = parent::handleRecordCreation($data);

        // Obtener el residente (user) asignado
        $user = $visitor->user;

        if ($user) {
            // Enviar la notificación al residente
            Notification::send($user, new NewVisitorNotification($visitor));

            // Registrar en el log que se envió la notificación
            Log::info('Notificación enviada a ' . $user->name . ' sobre el visitante ' . $visitor->name);
        } else {
            // En caso de que no se haya asignado un residente
            Log::warning('No se asignó un residente para el visitante ' . $visitor->name);
        }

        return $visitor;
    }
}
