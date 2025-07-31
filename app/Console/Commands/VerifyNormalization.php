<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Vehicle;
use App\Models\VisitorProfile;
use App\Models\QrCode;
use App\Models\VisitLog;
use App\Models\Visitor;
use App\Models\DocumentType;
use App\Models\QrType;
use Illuminate\Support\Facades\DB;

class VerifyNormalization extends Command
{
    protected $signature = 'verify:normalization';
    protected $description = 'Verificar que la normalización se ejecutó correctamente';

    public function handle()
    {
        $this->info('🔍 Verificando normalización de base de datos...');
        $this->newLine();

        // 1. Conteos básicos
        $this->info('📊 CONTEOS DE REGISTROS:');
        $this->table(['Tabla', 'Registros'], [
            ['visitors (original)', Visitor::count()],
            ['visit_logs (nuevo)', VisitLog::count()],
            ['vehicles', Vehicle::count()],
            ['visitor_profiles', VisitorProfile::count()],
            ['qr_codes (total)', QrCode::count()],
            ['document_types', DocumentType::count()],
            ['qr_types', QrType::count()],
        ]);

        $this->newLine();

        // 2. Verificar QR codes actualizados
        $qrWithProfiles = QrCode::whereNotNull('visitor_profile_id')->count();
        $qrWithVehicles = QrCode::whereNotNull('vehicle_id')->count();
        $qrWithTypes = QrCode::whereNotNull('qr_type_id')->count();
        $totalQr = QrCode::count();

        $this->info('🔗 RELACIONES EN QR CODES:');
        $this->table(['Campo', 'Actualizados', 'Total', '%'], [
            ['visitor_profile_id', $qrWithProfiles, $totalQr, $totalQr > 0 ? round(($qrWithProfiles / $totalQr) * 100, 1) . '%' : '0%'],
            ['vehicle_id', $qrWithVehicles, $totalQr, $totalQr > 0 ? round(($qrWithVehicles / $totalQr) * 100, 1) . '%' : '0%'],
            ['qr_type_id', $qrWithTypes, $totalQr, $totalQr > 0 ? round(($qrWithTypes / $totalQr) * 100, 1) . '%' : '0%'],
        ]);

        $this->newLine();

        // 3. Mostrar datos de ejemplo
        $this->info('📋 DATOS DE EJEMPLO:');

        // Vehículos
        $vehicles = Vehicle::take(5)->get();
        if ($vehicles->count() > 0) {
            $this->info('🚗 Vehículos:');
            foreach ($vehicles as $vehicle) {
                $this->line("  - ID: {$vehicle->id} | Placa: {$vehicle->plate}");
            }
        } else {
            $this->warn('⚠️  No se encontraron vehículos');
        }

        $this->newLine();

        // Perfiles de visitantes
        $profiles = VisitorProfile::with('documentType')->take(5)->get();
        if ($profiles->count() > 0) {
            $this->info('👥 Perfiles de Visitantes:');
            foreach ($profiles as $profile) {
                $this->line("  - ID: {$profile->id} | Nombre: {$profile->name} | Doc: {$profile->documentType->code} - {$profile->document_number}");
            }
        } else {
            $this->warn('⚠️  No se encontraron perfiles de visitantes');
        }

        $this->newLine();

        // Logs de visitas
        $logs = VisitLog::with(['visitorProfile', 'user', 'vehicle'])->take(3)->get();
        if ($logs->count() > 0) {
            $this->info('📝 Logs de Visitas:');
            foreach ($logs as $log) {
                $visitor = $log->visitorProfile ? $log->visitorProfile->name : 'N/A';
                $resident = $log->user ? $log->user->name : 'N/A';
                $vehicle = $log->vehicle ? $log->vehicle->plate : 'Sin vehículo';
                $this->line("  - ID: {$log->id} | Visitante: {$visitor} | Residente: {$resident} | Vehículo: {$vehicle}");
            }
        } else {
            $this->warn('⚠️  No se encontraron logs de visitas');
        }

        $this->newLine();

        // 4. Verificar integridad de relaciones
        $this->info('🔍 VERIFICACIÓN DE INTEGRIDAD:');

        $issues = [];

        // Verificar QR codes sin perfil de visitante
        $orphanQrs = QrCode::whereNull('visitor_profile_id')
            ->whereNotNull('visitor_name')
            ->count();
        if ($orphanQrs > 0) {
            $issues[] = "❌ {$orphanQrs} QR codes sin perfil de visitante";
        }

        // Verificar logs sin perfil de visitante
        $orphanLogs = VisitLog::whereNull('visitor_profile_id')->count();
        if ($orphanLogs > 0) {
            $issues[] = "❌ {$orphanLogs} logs de visita sin perfil de visitante";
        }

        if (empty($issues)) {
            $this->info('✅ Todas las verificaciones pasaron correctamente');
        } else {
            foreach ($issues as $issue) {
                $this->warn($issue);
            }
        }

        $this->newLine();

        // 5. Datos originales vs normalizados
        $this->info('📊 COMPARACIÓN DATOS ORIGINALES:');

        $originalVisitorsCount = Visitor::count();
        $originalPlatesCount = Visitor::whereNotNull('vehicle_plate')
            ->where('vehicle_plate', '!=', '')
            ->distinct('vehicle_plate')
            ->count();

        $uniqueVisitorNames = DB::table('visitors')
            ->select('name', 'id_document')
            ->whereNotNull('name')
            ->whereNotNull('id_document')
            ->where('name', '!=', '')
            ->where('id_document', '!=', '')
            ->groupBy('name', 'id_document')
            ->get()
            ->count();

        $this->table(['Métrica', 'Original', 'Normalizado'], [
            ['Total visitantes/logs', $originalVisitorsCount, VisitLog::count()],
            ['Placas únicas', $originalPlatesCount, Vehicle::count()],
            ['Visitantes únicos', $uniqueVisitorNames, VisitorProfile::count()],
        ]);

        $this->newLine();
        $this->info('✅ Verificación completada');

        return 0;
    }
}
