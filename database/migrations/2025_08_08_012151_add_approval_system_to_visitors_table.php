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
            // Agregar columnas del sistema de aprobación si no existen
            if (!Schema::hasColumn('visitors', 'approval_status')) {
                $table->enum('approval_status', ['pending', 'approved', 'rejected', 'auto_approved'])
                      ->nullable()
                      ->comment('Estado de aprobación del visitante');
            }
            
            if (!Schema::hasColumn('visitors', 'approval_requested_at')) {
                $table->timestamp('approval_requested_at')
                      ->nullable()
                      ->comment('Fecha y hora cuando se solicitó la aprobación');
            }
            
            if (!Schema::hasColumn('visitors', 'approval_responded_at')) {
                $table->timestamp('approval_responded_at')
                      ->nullable()
                      ->comment('Fecha y hora cuando se respondió la aprobación');
            }
            
            if (!Schema::hasColumn('visitors', 'approved_by')) {
                $table->foreignId('approved_by')
                      ->nullable()
                      ->constrained('users')
                      ->onDelete('set null')
                      ->comment('Usuario que aprobó/rechazó la visita');
            }
            
            if (!Schema::hasColumn('visitors', 'approval_notes')) {
                $table->text('approval_notes')
                      ->nullable()
                      ->comment('Notas adicionales sobre la aprobación/rechazo');
            }
            
            // Índices para optimización
            if (!Schema::hasIndex('visitors', ['approval_status'])) {
                $table->index(['approval_status'], 'idx_approval_status');
            }
            
            if (!Schema::hasIndex('visitors', ['approval_requested_at'])) {
                $table->index(['approval_requested_at'], 'idx_approval_requested_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visitors', function (Blueprint $table) {
            // Eliminar índices si existen
            if (Schema::hasIndex('visitors', 'idx_approval_requested_at')) {
                $table->dropIndex('idx_approval_requested_at');
            }
            
            if (Schema::hasIndex('visitors', 'idx_approval_status')) {
                $table->dropIndex('idx_approval_status');
            }
            
            // Eliminar columnas si existen
            $columnsToRemove = [
                'approval_notes',
                'approved_by',
                'approval_responded_at',
                'approval_requested_at',
                'approval_status'
            ];
            
            foreach ($columnsToRemove as $column) {
                if (Schema::hasColumn('visitors', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
