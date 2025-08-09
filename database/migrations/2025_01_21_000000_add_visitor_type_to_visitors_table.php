<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('visitors', function (Blueprint $table) {
            $table->enum('visitor_type', ['spontaneous', 'scheduled'])
                  ->default('spontaneous')
                  ->after('vehicle_plate')
                  ->comment('Tipo de visitante: espontáneo (ya está aquí) o programado (llegará después)');
            
            $table->timestamp('scheduled_time')->nullable()->after('visitor_type')->comment('Hora programada para visitantes que llegarán después');
        });
    }

    public function down(): void
    {
        Schema::table('visitors', function (Blueprint $table) {
            $table->dropColumn(['visitor_type', 'scheduled_time']);
        });
    }
};
