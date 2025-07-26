<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Verificar si ya existe el admin
        $exists = DB::table('users')->where('email', 'admin@admin.com')->exists();

        if (!$exists) {
            DB::table('users')->insert([
                'name' => 'Admin',
                'email' => 'admin@admin.com',
                'password' => Hash::make('admin'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->command->info('Usuario admin creado exitosamente!');
        } else {
            $this->command->info('Usuario admin ya existe!');
        }

        $this->command->info('Email: admin@admin.com');
        $this->command->info('Password: admin');
    }
}
