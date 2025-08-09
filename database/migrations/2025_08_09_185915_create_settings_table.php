<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, integer, boolean, json
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Insertar configuraciones por defecto
        DB::table('settings')->insert([
            [
                'key' => 'approval_timeout_minutes',
                'value' => '7',
                'type' => 'integer',
                'description' => 'Tiempo límite en minutos para que un residente apruebe/rechace un visitante',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'auto_approval_enabled',
                'value' => '1',
                'type' => 'boolean',
                'description' => 'Habilitar auto-aprobación cuando expire el tiempo límite',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'approval_reminder_minutes',
                'value' => '5',
                'type' => 'integer',
                'description' => 'Minutos antes del timeout para enviar recordatorio (0 = deshabilitado)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
