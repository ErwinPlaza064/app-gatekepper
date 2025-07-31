<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class QrCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'qr_id',
        'user_id',
        'visitor_profile_id', // NUEVO
        'vehicle_id', // NUEVO
        'qr_type_id', // NUEVO
        // Mantener campos antiguos por compatibilidad
        'visitor_name',
        'document_id',
        'vehicle_plate',
        'qr_type',
        'valid_until',
        'max_uses',
        'current_uses',
        'is_active',
        'metadata'
    ];

    protected $casts = [
        'valid_until' => 'datetime',
        'metadata' => 'array',
        'is_active' => 'boolean'
    ];

    // Relaciones nuevas
    public function visitorProfile()
    {
        return $this->belongsTo(VisitorProfile::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function qrType()
    {
        return $this->belongsTo(QrType::class);
    }

    // Relaciones existentes
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function visits()
    {
        return $this->hasMany(Visitor::class, 'qr_code_id');
    }

    public function visitLogs()
    {
        return $this->hasMany(VisitLog::class);
    }

    // Métodos existentes (mantener compatibilidad)
    public function isValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->valid_until && Carbon::now()->isAfter($this->valid_until)) {
            return false;
        }

        if ($this->current_uses >= $this->max_uses) {
            return false;
        }

        return true;
    }

    // Accessor para compatibilidad con código existente
    public function getVisitorNameAttribute($value)
    {
        return $value ?? $this->visitorProfile?->name;
    }

    public function getDocumentIdAttribute($value)
    {
        return $value ?? $this->visitorProfile?->documentType?->code;
    }

    public function getVehiclePlateAttribute($value)
    {
        return $value ?? $this->vehicle?->plate;
    }
}
