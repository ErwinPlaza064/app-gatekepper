<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('code', 10)->unique();
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Insertar datos iniciales
        DB::table('document_types')->insert([
            ['name' => 'Identificación Nacional de Elector', 'code' => 'INE', 'description' => 'Credencial de elector mexicana'],
            ['name' => 'Pasaporte', 'code' => 'PASSPORT', 'description' => 'Documento de viaje internacional'],
            ['name' => 'Licencia de Conducir', 'code' => 'LICENSE', 'description' => 'Licencia para conducir vehículos'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('document_types');
    }
};
