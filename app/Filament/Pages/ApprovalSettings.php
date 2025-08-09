<?php

namespace App\Filament\Pages;

use App\Models\Setting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Pages\Page;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class ApprovalSettings extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';
    protected static string $view = 'filament.pages.approval-settings';
    protected static ?string $navigationLabel = 'Configuración de Aprobaciones';
    protected static ?string $title = 'Configuración del Sistema de Aprobación';
    protected static ?string $navigationGroup = 'Configuración';
    protected static ?int $navigationSort = 99;

    // Datos del formulario
    public ?array $data = [];

    public static function canAccess(): bool
    {
        $user = auth()->user();
        return $user && in_array($user->rol, ['administrador']);
    }

    public function mount(): void
    {
        $this->form->fill([
            'approval_timeout_minutes' => Setting::getApprovalTimeout(),
            'auto_approval_enabled' => Setting::isAutoApprovalEnabled(),
            'approval_reminder_minutes' => Setting::getApprovalReminderMinutes(),
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('⏰ Configuración de Tiempo')
                    ->description('Controla los tiempos del sistema de aprobación de visitantes')
                    ->schema([
                        Forms\Components\TextInput::make('approval_timeout_minutes')
                            ->label('Tiempo límite para aprobación (minutos)')
                            ->required()
                            ->numeric()
                            ->minValue(1)
                            ->maxValue(60)
                            ->default(7)
                            ->helperText('Tiempo que tienen los residentes para aprobar o rechazar un visitante')
                            ->suffixIcon('heroicon-m-clock'),

                        Forms\Components\TextInput::make('approval_reminder_minutes')
                            ->label('Minutos antes del timeout para recordatorio')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(30)
                            ->default(5)
                            ->helperText('Enviar recordatorio por WhatsApp N minutos antes del timeout (0 = deshabilitado)')
                            ->suffixIcon('heroicon-m-bell'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('🤖 Auto-aprobación')
                    ->description('Configura qué sucede cuando expira el tiempo límite')
                    ->schema([
                        Forms\Components\Toggle::make('auto_approval_enabled')
                            ->label('Habilitar auto-aprobación por timeout')
                            ->default(true)
                            ->helperText('Si está habilitado, los visitantes serán aprobados automáticamente cuando expire el tiempo')
                            ->inline(false),

                        Forms\Components\Placeholder::make('auto_approval_info')
                            ->label('')
                            ->content('⚠️ Si se deshabilita la auto-aprobación, los visitantes serán rechazados automáticamente cuando expire el tiempo.')
                            ->extraAttributes(['class' => 'text-sm text-gray-600']),
                    ]),

                Forms\Components\Section::make('📊 Información del Sistema')
                    ->description('Estadísticas y estado actual')
                    ->schema([
                        Forms\Components\Placeholder::make('current_settings')
                            ->label('Configuración Actual')
                            ->content(function () {
                                $timeout = Setting::getApprovalTimeout();
                                $autoApproval = Setting::isAutoApprovalEnabled() ? 'Habilitada' : 'Deshabilitada';
                                $reminder = Setting::getApprovalReminderMinutes();

                                return "• Timeout: {$timeout} minutos\n• Auto-aprobación: {$autoApproval}\n• Recordatorio: {$reminder} minutos antes";
                            }),

                        Forms\Components\Actions::make([
                            Forms\Components\Actions\Action::make('clear_cache')
                                ->label('Limpiar Cache de Configuración')
                                ->icon('heroicon-m-arrow-path')
                                ->color('gray')
                                ->action(function () {
                                    Setting::clearCache();
                                    Notification::make()
                                        ->title('Cache limpiado')
                                        ->success()
                                        ->send();
                                }),

                            Forms\Components\Actions\Action::make('test_notification')
                                ->label('Probar Notificación')
                                ->icon('heroicon-m-phone')
                                ->color('info')
                                ->action(function () {
                                    Notification::make()
                                        ->title('Función de prueba')
                                        ->body('Esta función se puede implementar para enviar una notificación de prueba')
                                        ->info()
                                        ->send();
                                }),
                        ]),
                    ]),
            ])
            ->statePath('data');
    }

    protected function getFormActions(): array
    {
        return [
            Action::make('save')
                ->label('Guardar Configuración')
                ->icon('heroicon-m-check')
                ->action('save'),
        ];
    }

    public function save(): void
    {
        try {
            $data = $this->form->getState();

            // Guardar cada configuración
            Setting::set('approval_timeout_minutes', $data['approval_timeout_minutes'], 'integer',
                'Tiempo límite en minutos para que un residente apruebe/rechace un visitante');

            Setting::set('auto_approval_enabled', $data['auto_approval_enabled'], 'boolean',
                'Habilitar auto-aprobación cuando expire el tiempo límite');

            Setting::set('approval_reminder_minutes', $data['approval_reminder_minutes'], 'integer',
                'Minutos antes del timeout para enviar recordatorio (0 = deshabilitado)');

            Log::info('Configuración de aprobaciones actualizada', [
                'updated_by' => auth()->user()->name,
                'settings' => $data,
            ]);

            Notification::make()
                ->title('✅ Configuración guardada')
                ->body('La configuración del sistema de aprobación ha sido actualizada correctamente.')
                ->success()
                ->send();

        } catch (\Exception $e) {
            Log::error('Error guardando configuración de aprobaciones', [
                'error' => $e->getMessage(),
                'user' => auth()->user()->name,
            ]);

            Notification::make()
                ->title('❌ Error al guardar')
                ->body('Ocurrió un error al guardar la configuración: ' . $e->getMessage())
                ->danger()
                ->send();
        }
    }
}
