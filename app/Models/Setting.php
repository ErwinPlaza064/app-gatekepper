<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'description',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Cache key prefix
    const CACHE_PREFIX = 'setting_';
    const CACHE_TTL = 3600; // 1 hora

    /**
     * Obtener valor de configuración con cache
     */
    public static function get(string $key, $default = null)
    {
        $cacheKey = self::CACHE_PREFIX . $key;

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($key, $default) {
            $setting = self::where('key', $key)->first();

            if (!$setting) {
                return $default;
            }

            return self::castValue($setting->value, $setting->type);
        });
    }

    /**
     * Establecer valor de configuración
     */
    public static function set(string $key, $value, string $type = 'string', string $description = null): bool
    {
        try {
            // Convertir valor según el tipo
            $stringValue = self::valueToString($value, $type);

            $setting = self::updateOrCreate(
                ['key' => $key],
                [
                    'value' => $stringValue,
                    'type' => $type,
                    'description' => $description,
                ]
            );

            // Limpiar cache
            Cache::forget(self::CACHE_PREFIX . $key);

            return true;
        } catch (\Exception $e) {
            Log::error("Error setting configuration {$key}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Convertir valor de string según su tipo
     */
    private static function castValue($value, string $type)
    {
        switch ($type) {
            case 'integer':
                return (int) $value;
            case 'boolean':
                return (bool) $value;
            case 'json':
                return json_decode($value, true);
            case 'float':
                return (float) $value;
            default:
                return $value;
        }
    }

    /**
     * Convertir valor a string para almacenamiento
     */
    private static function valueToString($value, string $type): string
    {
        switch ($type) {
            case 'boolean':
                return $value ? '1' : '0';
            case 'json':
                return json_encode($value);
            default:
                return (string) $value;
        }
    }

    /**
     * Obtener todas las configuraciones como array
     */
    public static function getAllSettings(): array
    {
        return self::query()
            ->get()
            ->mapWithKeys(function ($setting) {
                return [$setting->key => self::castValue($setting->value, $setting->type)];
            })
            ->toArray();
    }

    /**
     * Limpiar todo el cache de configuraciones
     */
    public static function clearCache(): void
    {
        $keys = self::pluck('key');
        foreach ($keys as $key) {
            Cache::forget(self::CACHE_PREFIX . $key);
        }
    }

    // Métodos específicos para el sistema de aprobación

    /**
     * Obtener timeout de aprobación en minutos
     */
    public static function getApprovalTimeout(): int
    {
        return self::get('approval_timeout_minutes', 7);
    }

    /**
     * Verificar si auto-aprobación está habilitada
     */
    public static function isAutoApprovalEnabled(): bool
    {
        return self::get('auto_approval_enabled', true);
    }

    /**
     * Obtener minutos para recordatorio
     */
    public static function getApprovalReminderMinutes(): int
    {
        return self::get('approval_reminder_minutes', 5);
    }
}
