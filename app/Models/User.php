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
        'rol',
        'remember_token',
        'custom_approval_timeout',
        'approval_reminders_enabled',
        'custom_auto_approval',
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
        'approval_reminders_enabled' => 'boolean',
        'custom_auto_approval' => 'boolean',
    ];

    // === MÉTODOS PARA CONFIGURACIÓN DE APROBACIÓN ===

    /**
     * Obtener timeout de aprobación para este usuario
     * Si tiene configuración personalizada, la usa; si no, usa la global
     */
    public function getApprovalTimeoutMinutes(): int
    {
        return $this->custom_approval_timeout ?? Setting::getApprovalTimeout();
    }

    /**
     * Verificar si auto-aprobación está habilitada para este usuario
     */
    public function isAutoApprovalEnabled(): bool
    {
        return $this->custom_auto_approval ?? Setting::isAutoApprovalEnabled();
    }

    /**
     * Verificar si el usuario quiere recibir recordatorios de aprobación
     */
    public function wantsApprovalReminders(): bool
    {
        return $this->approval_reminders_enabled && $this->whatsapp_notifications;
    }

    /**
     * Obtener minutos antes del timeout para enviar recordatorio
     */
    public function getApprovalReminderMinutes(): int
    {
        return Setting::getApprovalReminderMinutes();
    }
}
