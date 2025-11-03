<?php
namespace App\Filament\Resources\VisitorResource\Pages;

use App\Filament\Resources\VisitorResource;
use Filament\Resources\Pages\CreateRecord;

class CreateVisitor extends CreateRecord
{
    protected static string $resource = VisitorResource::class;

    protected function handleRecordCreation(array $data): \App\Models\Visitor
    {
        // Agregar campos de aprobación automática
        $data['approval_status'] = 'approved';
        $data['approval_responded_at'] = now();
        $data['approved_by'] = auth()->id(); // El usuario que está creando (admin/portero)
        $data['approval_notes'] = $data['approval_notes'] ?? 'Aprobado directamente desde el panel administrativo';

        $visitor = parent::handleRecordCreation($data);
        return $visitor;
    }
}
