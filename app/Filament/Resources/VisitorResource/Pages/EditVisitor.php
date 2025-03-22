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

    protected function afterSave(): void
    {
        $visitor = $this->record;

        $user = $visitor->user;

        if ($user instanceof \App\Models\User) {
        } else {
            Log::warning('No se asignó un residente para el visitante ' . $visitor->name);
        }
    }
}
