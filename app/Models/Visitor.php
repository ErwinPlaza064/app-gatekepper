<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Notifications\Notifiable;
use App\Notifications\NewVisitorNotification;
use App\Notifications\VisitorApprovalRequest;
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

    public function scopeIncludeRejected($query)
    {
        return $query->withoutGlobalScope('hideRejected');
    }

    public function scopeOnlyRejected($query)
    {
        return $query->withoutGlobalScope('hideRejected')->where('approval_status', 'rejected');
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

        // Enviar notificación de solicitud de aprobación al residente
        if ($this->user) {
            // Enviar notificación via Job para evitar timeout
            \App\Jobs\SendVisitorNotificationJob::dispatch(
                $this->id,
                $this->user->id,
                'approval_request'
            );

            Log::info('Approval request notification scheduled via job', [
                'visitor_id' => $this->id,
                'user_id' => $this->user->id
            ]);

            // WhatsApp con enlaces de aprobación
            if ($this->user->phone && $this->user->whatsapp_notifications) {
                $approveUrl = route('approval.approve.public', ['token' => $this->approval_token]);
                $rejectUrl = route('approval.reject.public', ['token' => $this->approval_token]);

                EnviarWhatsAppJob::dispatch(
                    $this->user->phone,
                    'solicitud_aprobacion',
                    [
                        'visitante' => $this,
                        'approve_url' => $approveUrl,
                        'reject_url' => $rejectUrl,
                    ]
                );

                Log::info('Solicitud de aprobación enviada por WhatsApp', [
                    'visitor_id' => $this->id,
                    'resident_phone' => $this->user->phone,
                    'approve_url' => $approveUrl,
                ]);
            }

            Log::info('Solicitud de aprobación enviada', [
                'visitor_id' => $this->id,
                'visitor_name' => $this->name,
                'resident' => $this->user->name,
                'token' => $this->approval_token,
            ]);
        }

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
     * Verificar si el token de aprobación está vencido
     * Usa la configuración global del sistema
     */
    public function isApprovalExpired()
    {
        if (!$this->approval_requested_at) {
            return false;
        }

        $timeoutMinutes = \App\Models\Setting::getApprovalTimeout();
        return $this->approval_requested_at->addMinutes($timeoutMinutes)->isPast();
    }

    /**
     * Verificar si debe enviarse un recordatorio de aprobación
     */
    public function shouldSendReminder()
    {
        if (!$this->approval_requested_at || !$this->user || !$this->isPending()) {
            return false;
        }

        // Verificar si el usuario tiene WhatsApp habilitado
        if (!$this->user->whatsapp_notifications) {
            return false;
        }

        $timeoutMinutes = \App\Models\Setting::getApprovalTimeout();
        $reminderMinutes = \App\Models\Setting::getApprovalReminderMinutes();

        // No enviar recordatorio si es 0 o mayor que el timeout
        if ($reminderMinutes <= 0 || $reminderMinutes >= $timeoutMinutes) {
            return false;
        }

        $reminderTime = $this->approval_requested_at->addMinutes($timeoutMinutes - $reminderMinutes);
        $expirationTime = $this->approval_requested_at->addMinutes($timeoutMinutes);

        $now = now();

        // Enviar recordatorio si ya pasó el tiempo de recordatorio pero no ha expirado
        return $now->greaterThanOrEqualTo($reminderTime) && $now->lessThan($expirationTime);
    }

    /**
     * Obtener minutos restantes para la expiración
     */
    public function getMinutesUntilExpiration(): int
    {
        if (!$this->approval_requested_at) {
            return 0;
        }

        $timeoutMinutes = \App\Models\Setting::getApprovalTimeout();
        $expirationTime = $this->approval_requested_at->addMinutes($timeoutMinutes);

        return max(0, now()->diffInMinutes($expirationTime, false));
    }


  protected static function booted()
{
    // Scope global para ocultar visitantes rechazados por defecto
    static::addGlobalScope('hideRejected', function (Builder $builder) {
        $builder->where('approval_status', '!=', 'rejected');
    });

    static::created(function ($visitor) {
        // Usar jobs para evitar timeout SMTP - No bloquear la creación del visitante
        Log::info('Visitor created, scheduling notification jobs', [
            'visitor_id' => $visitor->id,
            'name' => $visitor->name,
            'status' => $visitor->approval_status ?? 'pending'
        ]);

        // Verificar que exista un usuario relacionado
        if ($visitor->user) {
            // Si el visitante tiene QR code, es una visita PRE-AUTORIZADA → notificación directa
            if ($visitor->qr_code_id) {
                // Marcar como aprobado automáticamente (QR significa pre-autorización)
                $visitor->update([
                    'approval_status' => 'approved',
                    'approval_responded_at' => now(),
                    'approval_notes' => 'Aprobado automáticamente por código QR pre-autorizado',
                ]);

                // Enviar notificación via Job para visitas con QR
                \App\Jobs\SendVisitorNotificationJob::dispatch(
                    $visitor->id,
                    $visitor->user->id,
                    'new_visitor'
                );

                // Enviar WhatsApp para visitas programadas
                if ($visitor->user->phone && $visitor->user->whatsapp_notifications) {
                    EnviarWhatsAppJob::dispatch(
                        $visitor->user->phone,
                        'nuevo_visitante',
                        ['visitante' => $visitor]
                    );

                    Log::info('WhatsApp programado para visita con QR', [
                        'usuario' => $visitor->user->name,
                        'telefono' => $visitor->user->phone,
                        'visitante' => $visitor->name
                    ]);
                }

                Log::info('Notificaciones programadas para visita con QR aprobada automáticamente: ' . $visitor->user->name . ' sobre el visitante ' . $visitor->name);
            }
            // Si YA está aprobado (raro caso), enviar notificación directa
            elseif ($visitor->approval_status === 'approved') {
                // Enviar notificación via Job para visitantes ya aprobados
                \App\Jobs\SendVisitorNotificationJob::dispatch(
                    $visitor->id,
                    $visitor->user->id,
                    'new_visitor'
                );

                Log::info('Notificaciones programadas para visitante pre-aprobado: ' . $visitor->user->name . ' sobre el visitante ' . $visitor->name);
            }
            else {
                // Visitante ESPONTÁNEO (desde Filament o portería) → SOLICITAR APROBACIÓN
                $visitor->requestApproval($visitor->approval_notes);

                Log::info('Solicitud de aprobación iniciada para visitante: ' . $visitor->name . ' (creado desde ' . (request()->is('admin/*') ? 'Filament' : 'Portería') . ')');
            }
        } else {
            Log::warning("No se pudo notificar al residente. No se encontró un usuario para el visitante con ID {$visitor->id}.");
        }
    });
}
}
