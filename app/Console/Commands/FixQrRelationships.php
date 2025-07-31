<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\QrCode;
use App\Models\VisitorProfile;
use App\Models\Vehicle;
use App\Models\DocumentType;
use Illuminate\Support\Facades\DB;

class FixQrRelationships extends Command
{
    protected $signature = 'fix:qr-relationships {--dry-run : Solo mostrar cambios sin ejecutar}';
    protected $description = 'Completar las relaciones faltantes en QR codes';

    public function handle()
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info('🔍 MODO DRY-RUN: Solo mostrando cambios...');
        }

        $this->info('🔧 Completando relaciones faltantes en QR codes...');
        $this->newLine();

        DB::beginTransaction();

        try {
            // 1. Crear perfiles faltantes para QR codes
            $this->createMissingProfiles($dryRun);

            // 2. Crear vehículos faltantes
            $this->createMissingVehicles($dryRun);

            // 3. Actualizar QR codes con nuevas relaciones
            $this->updateQrRelationships($dryRun);

            if ($dryRun) {
                DB::rollBack();
                $this->info('✅ Dry-run completado. No se realizaron cambios.');
            } else {
                DB::commit();
                $this->info('✅ Relaciones actualizadas exitosamente.');
            }

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('❌ Error: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }

    private function createMissingProfiles($dryRun)
    {
        $this->info('👥 Creando perfiles de visitantes faltantes...');

        // Obtener QR codes sin perfil pero con datos de visitante
        $qrsWithoutProfile = QrCode::whereNull('visitor_profile_id')
            ->whereNotNull('visitor_name')
            ->whereNotNull('document_id')
            ->where('visitor_name', '!=', '')
            ->where('document_id', '!=', '')
            ->get();

        $this->info("Encontrados {$qrsWithoutProfile->count()} QR codes sin perfil");

        $created = 0;
        $existing = 0;
        $skipped = 0;

        foreach ($qrsWithoutProfile as $qr) {
            try {
                // Determinar tipo de documento
                $documentType = $this->getDocumentType($qr->document_id);

                // Buscar perfil existente primero
                $existingProfile = VisitorProfile::where('name', $qr->visitor_name)
                    ->where('document_type_id', $documentType->id)
                    ->first();

                if ($existingProfile) {
                    $existing++;
                    continue;
                }

                // Buscar por documento para evitar duplicados
                $existingByDocument = VisitorProfile::where('document_type_id', $documentType->id)
                    ->where('document_number', $qr->document_id)
                    ->first();

                if ($existingByDocument) {
                    // Si existe con el mismo documento pero diferente nombre,
                    // usar el perfil existente (mejor que crear duplicado)
                    $this->line("  ↻ Reutilizando perfil existente: {$existingByDocument->name} para {$qr->visitor_name}");
                    $existing++;
                    continue;
                }

                // Generar número único de documento
                $documentNumber = $this->generateUniqueDocumentNumber($qr->document_id, $qr->visitor_name, $qr->id);

                if ($dryRun) {
                    $this->line("  [DRY-RUN] Crearía perfil: {$qr->visitor_name} ({$documentType->code}: {$documentNumber})");
                    $created++;
                } else {
                    $profile = VisitorProfile::create([
                        'name' => $qr->visitor_name,
                        'document_type_id' => $documentType->id,
                        'document_number' => $documentNumber
                    ]);

                    $this->line("  ✓ Perfil creado: {$qr->visitor_name} (ID: {$profile->id})");
                    $created++;
                }

            } catch (\Exception $e) {
                $this->warn("  ⚠️  Error con {$qr->visitor_name}: {$e->getMessage()}");
                $skipped++;
            }
        }

        $this->info("📊 Perfiles - Creados: {$created}, Existentes: {$existing}, Saltados: {$skipped}");
        $this->newLine();
    }

    private function createMissingVehicles($dryRun)
    {
        $this->info('🚗 Creando vehículos faltantes...');

        // Obtener placas únicas de QR codes que no tienen vehículo asignado
        $uniquePlates = QrCode::whereNull('vehicle_id')
            ->whereNotNull('vehicle_plate')
            ->where('vehicle_plate', '!=', '')
            ->distinct('vehicle_plate')
            ->pluck('vehicle_plate');

        $this->info("Encontradas {$uniquePlates->count()} placas sin vehículo asignado");

        $created = 0;
        $existing = 0;

        foreach ($uniquePlates as $plate) {
            if ($dryRun) {
                $this->line("  [DRY-RUN] Crearía vehículo: {$plate}");
                $created++;
            } else {
                $existingVehicle = Vehicle::where('plate', $plate)->first();

                if (!$existingVehicle) {
                    $vehicle = Vehicle::create(['plate' => $plate]);
                    $this->line("  ✓ Vehículo creado: {$plate} (ID: {$vehicle->id})");
                    $created++;
                } else {
                    $existing++;
                }
            }
        }

        $this->info("📊 Vehículos - Creados: {$created}, Existentes: {$existing}");
        $this->newLine();
    }

    private function updateQrRelationships($dryRun)
    {
        $this->info('🔗 Actualizando relaciones en QR codes...');

        $qrsToUpdate = QrCode::where(function($query) {
                $query->whereNull('visitor_profile_id')
                      ->orWhereNull('vehicle_id');
            })
            ->get();

        $this->info("Actualizando {$qrsToUpdate->count()} QR codes");

        $profilesUpdated = 0;
        $vehiclesUpdated = 0;

        foreach ($qrsToUpdate as $qr) {
            $updates = [];

            // Buscar perfil de visitante
            if (!$qr->visitor_profile_id && $qr->visitor_name && $qr->document_id) {
                $documentType = $this->getDocumentType($qr->document_id);

                $profile = VisitorProfile::where('name', $qr->visitor_name)
                    ->where('document_type_id', $documentType->id)
                    ->first();

                if ($profile) {
                    $updates['visitor_profile_id'] = $profile->id;
                    $profilesUpdated++;
                }
            }

            // Buscar vehículo
            if (!$qr->vehicle_id && $qr->vehicle_plate) {
                $vehicle = Vehicle::where('plate', $qr->vehicle_plate)->first();

                if ($vehicle) {
                    $updates['vehicle_id'] = $vehicle->id;
                    $vehiclesUpdated++;
                }
            }

            if (!empty($updates)) {
                if ($dryRun) {
                    $updatesList = implode(', ', array_keys($updates));
                    $this->line("  [DRY-RUN] Actualizaría QR {$qr->qr_id}: {$updatesList}");
                } else {
                    $qr->update($updates);
                    $updatesList = implode(', ', array_keys($updates));
                    $this->line("  ✓ QR {$qr->qr_id} actualizado: {$updatesList}");
                }
            }
        }

        $this->info("📊 Relaciones - Perfiles: {$profilesUpdated}, Vehículos: {$vehiclesUpdated}");
    }

    private function generateUniqueDocumentNumber($originalDocument, $name, $qrId = null)
    {
        $document = strtoupper(trim($originalDocument));

        // Si el documento parece genérico o muy común, crear uno único
        if (in_array($document, ['INE', 'PASAPORTE', 'PASSPORT', 'LICENCIA', 'LICENSE'])
            || strlen($document) < 5
            || is_numeric($document)) {

            // Usar ID del QR + hash del nombre para garantizar unicidad
            $nameHash = substr(md5($name), 0, 4);
            $qrHash = $qrId ? sprintf('%03d', $qrId % 1000) : '000';
            return "{$document}-{$nameHash}-{$qrHash}";
        }

        // Si el documento parece real pero ya existe, hacerlo único
        if (VisitorProfile::whereHas('documentType', function($q) use ($document) {
                $q->where('code', $this->getDocumentTypeCode($document));
            })
            ->where('document_number', $document)
            ->exists()) {

            $nameHash = substr(md5($name), 0, 4);
            $qrHash = $qrId ? sprintf('%03d', $qrId % 1000) : '000';
            return "{$document}-{$nameHash}-{$qrHash}";
        }

        return $originalDocument;
    }

    private function getDocumentTypeCode($document)
    {
        $document = strtoupper(trim($document));

        if (str_contains($document, 'PASAPORTE') || str_contains($document, 'PASSPORT')) {
            return 'PASSPORT';
        } elseif (str_contains($document, 'LICENCIA') || str_contains($document, 'LICENSE')) {
            return 'LICENSE';
        }

        return 'INE';
    }

    private function getDocumentType($document)
    {
        $document = strtoupper(trim($document));

        if (str_contains($document, 'PASAPORTE') || str_contains($document, 'PASSPORT')) {
            return DocumentType::where('code', 'PASSPORT')->first();
        } elseif (str_contains($document, 'LICENCIA') || str_contains($document, 'LICENSE')) {
            return DocumentType::where('code', 'LICENSE')->first();
        }

        return DocumentType::where('code', 'INE')->first();
    }
}
