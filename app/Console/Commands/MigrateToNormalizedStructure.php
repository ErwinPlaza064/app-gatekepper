<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Visitor;
use App\Models\QrCode;
use App\Models\DocumentType;
use App\Models\Vehicle;
use App\Models\VisitorProfile;
use App\Models\QrType;
use App\Models\VisitLog;
use Illuminate\Support\Facades\DB;

class MigrateToNormalizedStructure extends Command
{
    protected $signature = 'migrate:normalize {--dry-run : Solo mostrar lo que se haría sin ejecutar}';
    protected $description = 'Migrar datos existentes a la estructura normalizada';

    public function handle()
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info('🔍 MODO DRY-RUN: Solo mostrando cambios, no ejecutando...');
        }

        DB::beginTransaction();

        try {
            $this->info('🚀 Iniciando migración de datos...');

            // Paso 1: Migrar vehículos únicos
            $this->migrateVehicles($dryRun);

            // Paso 2: Migrar perfiles de visitantes
            $this->migrateVisitorProfiles($dryRun);

            // Paso 3: Actualizar QR codes con referencias normalizadas
            $this->updateQrCodes($dryRun);

            // Paso 4: Crear logs de visitas desde visitantes existentes
            $this->createVisitLogs($dryRun);

            if ($dryRun) {
                DB::rollBack();
                $this->info('✅ Dry-run completado. No se realizaron cambios.');
            } else {
                DB::commit();
                $this->info('✅ Migración completada exitosamente.');
            }

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('❌ Error durante la migración: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }

    private function migrateVehicles($dryRun)
    {
        $this->info('📋 Migrando vehículos...');

        $uniquePlates = Visitor::whereNotNull('vehicle_plate')
            ->where('vehicle_plate', '!=', '')
            ->distinct()
            ->pluck('vehicle_plate');

        $this->info("Encontradas {$uniquePlates->count()} placas únicas");

        if (!$dryRun) {
            foreach ($uniquePlates as $plate) {
                Vehicle::firstOrCreate(['plate' => $plate]);
            }
        }
    }

    private function migrateVisitorProfiles($dryRun)
    {
        $this->info('👥 Migrando perfiles de visitantes...');

        $visitors = DB::table('visitors')
            ->select('name', 'id_document')
            ->whereNotNull('name')
            ->whereNotNull('id_document')
            ->groupBy('name', 'id_document')
            ->get();

        $this->info("Encontrados {$visitors->count()} perfiles únicos de visitantes");

        if (!$dryRun) {
            foreach ($visitors as $visitor) {
                // Determinar tipo de documento
                $documentType = $this->getDocumentType($visitor->id_document);

                VisitorProfile::firstOrCreate([
                    'name' => $visitor->name,
                    'document_type_id' => $documentType->id,
                    'document_number' => $visitor->id_document
                ]);
            }
        }
    }

    private function updateQrCodes($dryRun)
    {
        $this->info('🔄 Actualizando códigos QR...');

        $qrCodes = QrCode::whereNull('visitor_profile_id')->get();
        $this->info("Actualizando {$qrCodes->count()} códigos QR");

        if (!$dryRun) {
            foreach ($qrCodes as $qrCode) {
                // Buscar perfil de visitante
                $documentType = $this->getDocumentType($qrCode->document_id);
                $visitorProfile = VisitorProfile::where('name', $qrCode->visitor_name)
                    ->where('document_type_id', $documentType->id)
                    ->first();

                // Buscar vehículo
                $vehicle = null;
                if ($qrCode->vehicle_plate) {
                    $vehicle = Vehicle::where('plate', $qrCode->vehicle_plate)->first();
                }

                // Buscar tipo de QR
                $qrType = QrType::where('code', $qrCode->qr_type)->first();

                $qrCode->update([
                    'visitor_profile_id' => $visitorProfile?->id,
                    'vehicle_id' => $vehicle?->id,
                    'qr_type_id' => $qrType?->id
                ]);
            }
        }
    }

    private function createVisitLogs($dryRun)
    {
        $this->info('📝 Creando logs de visitas...');

        $visitors = Visitor::with(['qrCode'])->get();
        $this->info("Migrando {$visitors->count()} registros de visitas");

        if (!$dryRun) {
            foreach ($visitors as $visitor) {
                // Buscar perfil de visitante
                $documentType = $this->getDocumentType($visitor->id_document);
                $visitorProfile = VisitorProfile::where('name', $visitor->name)
                    ->where('document_type_id', $documentType->id)
                    ->first();

                // Buscar vehículo
                $vehicle = null;
                if ($visitor->vehicle_plate) {
                    $vehicle = Vehicle::where('plate', $visitor->vehicle_plate)->first();
                }

                VisitLog::create([
                    'visitor_profile_id' => $visitorProfile?->id,
                    'user_id' => $visitor->user_id,
                    'vehicle_id' => $vehicle?->id,
                    'qr_code_id' => $visitor->qr_code_id,
                    'entry_time' => $visitor->entry_time,
                    'exit_time' => $visitor->exit_time,
                    'entry_method' => $visitor->qr_code_id ? 'qr_code' : 'manual'
                ]);
            }
        }
    }

    private function getDocumentType($document)
    {
        $document = strtoupper($document);

        if (str_contains($document, 'INE')) {
            return DocumentType::where('code', 'INE')->first();
        } elseif (str_contains($document, 'PASAPORTE') || str_contains($document, 'PASSPORT')) {
            return DocumentType::where('code', 'PASSPORT')->first();
        } elseif (str_contains($document, 'LICENCIA') || str_contains($document, 'LICENSE')) {
            return DocumentType::where('code', 'LICENSE')->first();
        }

        // Por defecto, INE
        return DocumentType::where('code', 'INE')->first();
    }
}
