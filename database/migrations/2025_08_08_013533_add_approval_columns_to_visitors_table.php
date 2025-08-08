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
            // Agregar columnas de aprobación solo si no existen
            if (!Schema::hasColumn('visitors', 'approval_status')) {
                $table->enum('approval_status', ['pending', 'approved', 'rejected', 'auto_approved'])
                      ->default('approved')
                      ->comment('Estado de aprobación del visitante');
            }

            if (!Schema::hasColumn('visitors', 'approval_token')) {
                $table->string('approval_token', 64)
                      ->nullable()
                      ->comment('Token único para enlaces de aprobación/rechazo desde WhatsApp');
                      
                $table->index(['approval_token'], 'idx_visitors_approval_token');
            }

            if (!Schema::hasColumn('visitors', 'approval_requested_at')) {
                $table->timestamp('approval_requested_at')
                      ->nullable()
                      ->comment('Fecha y hora cuando se solicitó la aprobación');
            }

            if (!Schema::hasColumn('visitors', 'approval_responded_at')) {
                $table->timestamp('approval_responded_at')
                      ->nullable()
                      ->comment('Fecha y hora cuando se respondió la solicitud');
            }

            if (!Schema::hasColumn('visitors', 'approved_by')) {
                $table->unsignedBigInteger('approved_by')
                      ->nullable()
                      ->comment('ID del usuario que aprobó/rechazó');
                      
                $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            }

            if (!Schema::hasColumn('visitors', 'approval_notes')) {
                $table->text('approval_notes')
                      ->nullable()
                      ->comment('Notas o comentarios sobre la aprobación/rechazo');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visitors', function (Blueprint $table) {
            // Eliminar foreign key primero
            if (Schema::hasColumn('visitors', 'approved_by')) {
                $table->dropForeign(['approved_by']);
                $table->dropColumn('approved_by');
            }

            // Eliminar índice antes de la columna
            if (Schema::hasIndex('visitors', 'idx_visitors_approval_token')) {
                $table->dropIndex('idx_visitors_approval_token');
            }

            // Eliminar columnas si existen
            $columnsToRemove = [
                'approval_status',
                'approval_token', 
                'approval_requested_at',
                'approval_responded_at',
                'approval_notes'
            ];

            foreach ($columnsToRemove as $column) {
                if (Schema::hasColumn('visitors', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
