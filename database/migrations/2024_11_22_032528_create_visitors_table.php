<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('visitors', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nombre del visitante
            $table->string('id_document'); // Documento de identidad
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade'); // Residente relacionado
            $table->timestamp('entry_time')->nullable(); // Hora de entrada
            $table->timestamp('exit_time')->nullable(); // Hora de salida
            $table->string('vehicle_plate')->nullable(); // Placa del vehículo
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visitors');
    }
};
