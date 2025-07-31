<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QrType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'default_duration_hours',
        'default_max_uses',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function qrCodes()
    {
        return $this->hasMany(QrCode::class);
    }
}
