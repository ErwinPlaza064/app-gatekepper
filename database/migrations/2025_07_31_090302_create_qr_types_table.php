<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qr_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->string('code', 20)->unique();
            $table->string('description')->nullable();
            $table->integer('default_duration_hours')->nullable();
            $table->integer('default_max_uses')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Insertar datos iniciales
        DB::table('qr_types')->insert([
            ['name' => 'Uso Único', 'code' => 'single_use', 'description' => 'QR válido para una sola entrada', 'default_max_uses' => 1],
            ['name' => 'Limitado por Tiempo', 'code' => 'time_limited', 'description' => 'QR válido por tiempo determinado', 'default_max_uses' => 1],
            ['name' => 'Recurrente', 'code' => 'recurring', 'description' => 'QR válido para múltiples usos', 'default_max_uses' => 5],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('qr_types');
    }
};
