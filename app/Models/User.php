<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;

class User extends Authenticatable implements FilamentUser
{
    use HasApiTokens, HasFactory, Notifiable;

    const ROLE_ADMIN = 'ADMIN';
    const ROLE_EDITOR = 'EDITOR';
    const ROLE_USER = 'USER';
    const ROLE_DEFAULT = self::ROLE_USER;

    const ROLES = [
        self::ROLE_ADMIN => 'Admin',
        self::ROLE_EDITOR => 'Editor',
        self::ROLE_USER => 'User',
    ];

    public function getRedirectRoute()
    {
        return match ($this->role) {
            self::ROLE_ADMIN => route('home'),
            self::ROLE_EDITOR => route('home'),
            default => route('home'),
        };
    }

    /**
     * Determina si el usuario puede acceder al panel de Filament
     */
    public function canAccessPanel(Panel $panel): bool
    {
        // Permitir acceso si tiene rol de administrador, portero o admin residencial
        return in_array($this->rol, ['administrador', 'adminresidencial', 'portero']);
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
     protected $fillable = [
        'name',
        'email',
        'password',
        'address',
        'phone',
        'whatsapp_notifications',
        'email_notifications',
        'expo_push_token',
        'rol',
        'remember_token',
    ];

    public function visitors()
    {
        return $this->hasMany(Visitor::class);
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'remember_token' => 'string',
        'whatsapp_notifications' => 'boolean',
        'email_notifications' => 'boolean',
    ];
}
