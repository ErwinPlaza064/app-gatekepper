<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\QrCode;
use App\Models\VisitorProfile;
use App\Models\DocumentType;
use Illuminate\Support\Facades\DB;

class ForceUniqueProfiles extends Command
{
    protected $signature = 'force:unique-profiles {--dry-run : Solo mostrar cambios}';
    protected $description = 'Crear perfiles únicos para cada QR code sin perfil';

    public function handle()
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info('🔍 MODO DRY-RUN: Solo mostrando cambios...');
        }

        $this->info('🔧 Creando perfiles únicos para QR codes restantes...');

        DB::beginTransaction();

        try {
            $qrsWithoutProfile = QrCode::whereNull('visitor_profile_id')
                ->whereNotNull('visitor_name')
                ->whereNotNull('document_id')
                ->get();

            $this->info("Encontrados {$qrsWithoutProfile->count()} QR codes sin perfil único");

            $created = 0;

            foreach ($qrsWithoutProfile as $qr) {
                $documentType = $this->getDocumentType($qr->document_id);

                // Crear número de documento único usando ID del QR
                $uniqueDocNumber = $this->createUniqueDocumentNumber($qr);

                if ($dryRun) {
                    $this->line("  [DRY-RUN] Crearía perfil único: {$qr->visitor_name} ({$uniqueDocNumber})");
                    $created++;
                } else {
                    $profile = VisitorProfile::create([
                        'name' => $qr->visitor_name,
                        'document_type_id' => $documentType->id,
                        'document_number' => $uniqueDocNumber
                    ]);

                    // Actualizar el QR code
                    $qr->update(['visitor_profile_id' => $profile->id]);

                    $this->line("  ✓ Perfil único creado: {$qr->visitor_name} (ID: {$profile->id})");
                    $created++;
                }
            }

            if ($dryRun) {
                DB::rollBack();
                $this->info("✅ Dry-run: Se crearían {$created} perfiles únicos");
            } else {
                DB::commit();
                $this->info("✅ Creados {$created} perfiles únicos exitosamente");
            }

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('❌ Error: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }

    private function createUniqueDocumentNumber($qr)
    {
        $docType = strtoupper($qr->document_id);
        $nameHash = substr(md5($qr->visitor_name), 0, 4);
        $qrHash = sprintf('%03d', $qr->id % 1000);

        return "QR-{$qr->id}-{$docType}-{$nameHash}-{$qrHash}";
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
