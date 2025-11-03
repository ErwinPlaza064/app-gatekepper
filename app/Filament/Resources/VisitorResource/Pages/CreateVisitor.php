<?php
namespace App\Filament\Resources\VisitorResource\Pages;

use App\Filament\Resources\VisitorResource;
use Filament\Resources\Pages\CreateRecord;

class CreateVisitor extends CreateRecord
{
    protected static string $resource = VisitorResource::class;

    protected function handleRecordCreation(array $data): \App\Models\Visitor
    {
        // Asegurar que visitantes pendientes NO tengan entry_time
        // Solo se establece cuando son aprobados
        unset($data['entry_time']); // Eliminar entry_time del formulario

        // Crear visitante SIN aprobación automática
        // El modelo Visitor se encargará de enviar la solicitud de aprobación
        $visitor = parent::handleRecordCreation($data);
        return $visitor;
    }
}
