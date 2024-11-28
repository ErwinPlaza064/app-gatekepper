<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification; 

class User extends Authenticatable
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
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'address', 
        'role',    
    ];

    public function getNotifications(Request $request)
    {
        $user = $request->user();  // Obtener el usuario autenticado

        // Recuperar las notificaciones no leídas
        $notifications = $user->notifications;  // O puedes usar ->unread() para solo no leídas

        return response()->json($notifications);  // Devuelves las notificaciones en formato JSON
    }
    public function visitors()
    {   
        return $this->hasMany(Visitor::class);
    }

    public function notifications()
{
    return $this->morphMany(DatabaseNotification::class, 'notifiable');
}

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];
   
}
