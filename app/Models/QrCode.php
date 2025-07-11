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

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function visits()
    {
        return $this->hasMany(Visitor::class, 'qr_code_id');
    }

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

    public function canBeUsed(): array
    {
        if (!$this->is_active) {
            return ['valid' => false, 'message' => 'El código QR ha sido desactivado'];
        }

        if ($this->valid_until && Carbon::now()->isAfter($this->valid_until)) {
            return ['valid' => false, 'message' => 'El código QR ha expirado'];
        }

        if ($this->current_uses >= $this->max_uses) {
            return ['valid' => false, 'message' => 'El código QR ha alcanzado el límite de usos'];
        }

        return ['valid' => true, 'message' => 'Código QR válido'];
    }

    public function incrementUsage(): void
    {
        $this->increment('current_uses');

        if ($this->qr_type === 'single_use') {
            $this->update(['is_active' => false]);
        }
    }
}
