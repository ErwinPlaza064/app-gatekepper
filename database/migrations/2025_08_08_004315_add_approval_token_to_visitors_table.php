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
            // Verificar si la columna approval_token ya existe
            if (!Schema::hasColumn('visitors', 'approval_token')) {
                // Token seguro para enlaces públicos de WhatsApp
                $table->string('approval_token', 64)
                      ->nullable()
                      ->comment('Token único para enlaces de aprobación/rechazo desde WhatsApp');
                
                // Índice para optimizar búsquedas por token
                $table->index(['approval_token'], 'idx_approval_token');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visitors', function (Blueprint $table) {
            // Verificar si el índice existe antes de eliminarlo
            if (Schema::hasIndex('visitors', 'idx_approval_token')) {
                $table->dropIndex('idx_approval_token');
            }
            
            // Verificar si la columna existe antes de eliminarla
            if (Schema::hasColumn('visitors', 'approval_token')) {
                $table->dropColumn('approval_token');
            }
        });
    }
};
