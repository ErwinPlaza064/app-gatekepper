<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@admin.com',
            'password' => Hash::make('admin'),
            'email_verified_at' => now(),
        ]);

        $this->command->info('Usuario admin creado exitosamente!');
        $this->command->info('Email: admin@admin.com');
        $this->command->info('Password: admin');
    }
}
