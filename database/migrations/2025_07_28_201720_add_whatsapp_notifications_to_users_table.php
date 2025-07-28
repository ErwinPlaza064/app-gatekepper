<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Solo agregar 'phone' si no existe
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('address');
            }

            // Solo agregar 'whatsapp_notifications' si no existe
            if (!Schema::hasColumn('users', 'whatsapp_notifications')) {
                $table->boolean('whatsapp_notifications')->default(true)->after('phone');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Solo eliminar si existen
            if (Schema::hasColumn('users', 'whatsapp_notifications')) {
                $table->dropColumn('whatsapp_notifications');
            }

            if (Schema::hasColumn('users', 'phone')) {
                $table->dropColumn('phone');
            }
        });
    }
};
