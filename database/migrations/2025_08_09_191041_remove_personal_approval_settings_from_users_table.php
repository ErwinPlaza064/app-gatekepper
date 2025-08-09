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
        Schema::table('users', function (Blueprint $table) {
            // Eliminar campos de configuración personal de aprobación
            // Solo el super admin puede configurar el sistema globalmente
            $table->dropColumn([
                'custom_approval_timeout',
                'approval_reminders_enabled',
                'custom_auto_approval'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Restaurar campos en caso de rollback
            $table->integer('custom_approval_timeout')->nullable()->after('whatsapp_notifications');
            $table->boolean('approval_reminders_enabled')->default(true)->after('custom_approval_timeout');
            $table->boolean('custom_auto_approval')->nullable()->after('approval_reminders_enabled');
        });
    }
};
