<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use App\Notifications\NewVisitorNotification;
use Illuminate\Support\Facades\Log;
use App\Jobs\EnviarWhatsAppJob;




class Visitor extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'id_document',
        'user_id',
        'qr_code_id',
        'entry_time',
        'exit_time',
        'vehicle_plate',
        'approval_status',
        'approval_token',
        'approval_requested_at',
        'approval_responded_at',
        'approved_by',
        'approval_notes',
    ];

    protected $casts = [
        'entry_time' => 'datetime',
        'exit_time' => 'datetime',
        'approval_requested_at' => 'datetime',
        'approval_responded_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function qrCode()
    {
        return $this->belongsTo(QrCode::class);
    }

    /**
     * Usuario que aprobó/rechazó el visitante
     */
    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // === SCOPES PARA CONSULTAS ===
    
    public function scopePendingApproval($query)
    {
        return $query->where('approval_status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->whereIn('approval_status', ['approved', 'auto_approved']);
    }

    public function scopeRejected($query)
    {
        return $query->where('approval_status', 'rejected');
    }

    // === MÉTODOS DE ESTADO ===
    
    public function isPending()
    {
        return $this->approval_status === 'pending';
    }

    public function isApproved()
    {
        return in_array($this->approval_status, ['approved', 'auto_approved']);
    }

    public function isRejected()
    {
        return $this->approval_status === 'rejected';
    }

    public function wasAutoApproved()
    {
        return $this->approval_status === 'auto_approved';
    }

    // === MÉTODOS PARA EL FLUJO DE APROBACIÓN ===

    /**
     * Solicitar aprobación generando token único
     */
    public function requestApproval($notes = null)
    {
        $this->update([
            'approval_status' => 'pending',
            'approval_token' => $this->generateApprovalToken(),
            'approval_requested_at' => now(),
            'approval_notes' => $notes,
        ]);

        return $this;
    }

    /**
     * Aprobar visitante
     */
    public function approve($approvedBy = null, $notes = null)
    {
        $this->update([
            'approval_status' => 'approved',
            'approval_responded_at' => now(),
            'approved_by' => $approvedBy,
            'approval_notes' => $notes,
            'entry_time' => now(), // Permitir entrada inmediata
        ]);

        return $this;
    }

    /**
     * Rechazar visitante
     */
    public function reject($rejectedBy = null, $notes = null)
    {
        $this->update([
            'approval_status' => 'rejected',
            'approval_responded_at' => now(),
            'approved_by' => $rejectedBy,
            'approval_notes' => $notes,
        ]);

        return $this;
    }

    /**
     * Auto-aprobar por timeout
     */
    public function autoApprove($notes = 'Aprobado automáticamente por timeout de 7 minutos')
    {
        $this->update([
            'approval_status' => 'auto_approved',
            'approval_responded_at' => now(),
            'approval_notes' => $notes,
            'entry_time' => now(), // Permitir entrada inmediata
        ]);

        return $this;
    }

    /**
     * Generar token único para aprobación
     */
    private function generateApprovalToken()
    {
        return bin2hex(random_bytes(32)); // Token de 64 caracteres
    }

    /**
     * Encontrar visitante por token de aprobación
     */
    public static function findByApprovalToken($token)
    {
        return static::where('approval_token', $token)
                    ->where('approval_status', 'pending')
                    ->first();
    }

    /**
     * Verificar si el token de aprobación está vencido (más de 7 minutos)
     */
    public function isApprovalExpired()
    {
        if (!$this->approval_requested_at) {
            return false;
        }

        return $this->approval_requested_at->addMinutes(7)->isPast();
    }


  protected static function booted()
{
    static::created(function ($visitor) {
        // Verificar que exista un usuario relacionado
        if ($visitor->user) {
            // Enviar notificación por email y database (como siempre)
            $visitor->user->notify(new NewVisitorNotification($visitor));

            // Enviar WhatsApp asíncrono si el usuario tiene teléfono y notificaciones habilitadas
            if ($visitor->user->phone && $visitor->user->whatsapp_notifications) {
                EnviarWhatsAppJob::dispatch(
                    $visitor->user->phone,
                    'nuevo_visitante',
                    ['visitante' => $visitor]
                );

                Log::info('WhatsApp programado para envío', [
                    'usuario' => $visitor->user->name,
                    'telefono' => $visitor->user->phone,
                    'visitante' => $visitor->name
                ]);
            }

            Log::info('Notificaciones enviadas a ' . $visitor->user->name . ' sobre el visitante ' . $visitor->name);
        } else {
            Log::warning("No se pudo notificar al residente. No se encontró un usuario para el visitante con ID {$visitor->id}.");
        }
    });
}
}
