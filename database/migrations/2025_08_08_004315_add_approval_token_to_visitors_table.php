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
        Schema::table('visitors', function (Blueprint $table) {
            // Token seguro para enlaces públicos de WhatsApp
            $table->string('approval_token', 64)
                  ->nullable()
                  ->after('approval_status')
                  ->comment('Token único para enlaces de aprobación/rechazo desde WhatsApp');
            
            // Índice para optimizar búsquedas por token
            $table->index(['approval_token'], 'idx_approval_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visitors', function (Blueprint $table) {
            // Eliminar índice
            $table->dropIndex('idx_approval_token');
            
            // Eliminar columna
            $table->dropColumn('approval_token');
        });
    }
};
