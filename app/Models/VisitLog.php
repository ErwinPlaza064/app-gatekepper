<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisitLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'visitor_profile_id',
        'user_id',
        'vehicle_id',
        'qr_code_id',
        'entry_time',
        'exit_time',
        'entry_method',
        'notes'
    ];

    protected $casts = [
        'entry_time' => 'datetime',
        'exit_time' => 'datetime'
    ];

    public function visitorProfile()
    {
        return $this->belongsTo(VisitorProfile::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function qrCode()
    {
        return $this->belongsTo(QrCode::class);
    }

    public function getIsActiveAttribute()
    {
        return is_null($this->exit_time);
    }
}
