<?php

namespace App\Filament\Resources\VisitorResource\Pages;

use App\Filament\Resources\VisitorResource;
use Filament\Resources\Pages\EditRecord;
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

        // Log para verificar la información del residente
        if ($user instanceof \App\Models\User) {
        } else {
            Log::warning('No se asignó un residente para el visitante ' . $visitor->name);
        }
    }
}
