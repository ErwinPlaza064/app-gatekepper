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
            if (!Schema::hasColumn('users', 'expo_push_token')) {
                $table->string('expo_push_token', 255)
                      ->nullable()
                      ->after('email_notifications')
                      ->comment('Token de Expo Push Notifications para la app móvil');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'expo_push_token')) {
                $table->dropColumn('expo_push_token');
            }
        });
    }
};
