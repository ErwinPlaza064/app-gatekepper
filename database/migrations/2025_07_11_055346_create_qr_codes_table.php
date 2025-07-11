<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qr_codes', function (Blueprint $table) {
            $table->id();
            $table->string('qr_id')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('visitor_name');
            $table->string('document_id');
            $table->string('vehicle_plate')->nullable();
            $table->enum('qr_type', ['single_use', 'time_limited', 'recurring']);
            $table->timestamp('valid_until')->nullable();
            $table->integer('max_uses')->default(1);
            $table->integer('current_uses')->default(0);
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qr_codes');
    }
};
