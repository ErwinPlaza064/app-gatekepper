<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('qr_codes', function (Blueprint $table) {
            // Agregar nuevas columnas normalizadas (nullable para no romper datos existentes)
            $table->foreignId('visitor_profile_id')->nullable()->constrained('visitor_profiles')->after('user_id');
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->after('visitor_profile_id');
            $table->foreignId('qr_type_id')->nullable()->constrained('qr_types')->after('vehicle_id');
        });
    }

    public function down(): void
    {
        Schema::table('qr_codes', function (Blueprint $table) {
            // Eliminar las llaves foráneas y luego las columnas
            $table->dropForeign(['visitor_profile_id']);
            $table->dropForeign(['vehicle_id']);
            $table->dropForeign(['qr_type_id']);

            $table->dropColumn(['visitor_profile_id', 'vehicle_id', 'qr_type_id']);
        });
    }
};
