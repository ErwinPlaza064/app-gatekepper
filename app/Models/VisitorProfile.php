<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisitorProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'document_type_id',
        'document_number',
        'phone',
        'email',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function documentType()
    {
        return $this->belongsTo(DocumentType::class);
    }

    public function visitLogs()
    {
        return $this->hasMany(VisitLog::class);
    }

    public function qrCodes()
    {
        return $this->hasMany(QrCode::class);
    }

    public function getFullDocumentAttribute()
    {
        return $this->documentType->code . ': ' . $this->document_number;
    }
}
