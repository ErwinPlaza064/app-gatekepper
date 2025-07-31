<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visitor_profile_id')->constrained('visitor_profiles');
            $table->foreignId('user_id')->constrained('users'); // Residente
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles');
            $table->foreignId('qr_code_id')->nullable()->constrained('qr_codes');
            $table->timestamp('entry_time')->default(now());
            $table->timestamp('exit_time')->nullable();
            $table->enum('entry_method', ['qr_code', 'manual', 'guest_list'])->default('manual');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['entry_time']);
            $table->index(['visitor_profile_id', 'entry_time']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visit_logs');
    }
};
