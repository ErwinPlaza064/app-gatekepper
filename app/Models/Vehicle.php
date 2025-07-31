<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'plate',
        'brand',
        'model',
        'year',
        'color',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function visitLogs()
    {
        return $this->hasMany(VisitLog::class);
    }

    public function qrCodes()
    {
        return $this->hasMany(QrCode::class);
    }
}
