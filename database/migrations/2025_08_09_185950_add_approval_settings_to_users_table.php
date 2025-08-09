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
            // Timeout personalizado en minutos (null = usar configuración global)
            $table->integer('custom_approval_timeout')->nullable()->after('whatsapp_notifications');

            // Si el usuario quiere recibir recordatorios antes del timeout
            $table->boolean('approval_reminders_enabled')->default(true)->after('custom_approval_timeout');

            // Configuración de auto-aprobación personalizada (null = usar global)
            $table->boolean('custom_auto_approval')->nullable()->after('approval_reminders_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'custom_approval_timeout',
                'approval_reminders_enabled',
                'custom_auto_approval'
            ]);
        });
    }
};
