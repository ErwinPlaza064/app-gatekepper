<x-filament-panels::page>
    <div class="space-y-6">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                    <x-heroicon-o-cog-6-tooth class="h-8 w-8 text-primary-600" />
                </div>
                <div>
                    <h2 class="text-xl font-semibold text-gray-900">Sistema de Aprobación de Visitantes</h2>
                    <p class="text-sm text-gray-600">
                        Configura los parámetros globales para el sistema de aprobación de visitantes espontáneos.
                        Los residentes pueden personalizar estos valores en su perfil individual.
                    </p>
                </div>
            </div>
        </div>

        <!-- Formulario principal -->
        <form wire:submit="save">
            {{ $this->form }}
            
            <div class="flex justify-end mt-6">
                {{ $this->getFormActions()[0] }}
            </div>
        </form>

        <!-- Información adicional -->
        <div class="bg-blue-50 rounded-lg p-6">
            <div class="flex">
                <div class="flex-shrink-0">
                    <x-heroicon-o-information-circle class="h-5 w-5 text-blue-400" />
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-medium text-blue-800">
                        ¿Cómo funciona el sistema?
                    </h3>
                    <div class="mt-2 text-sm text-blue-700">
                        <ul class="list-disc pl-5 space-y-1">
                            <li>Cuando llega un visitante espontáneo, el portero lo registra sin código QR</li>
                            <li>El sistema envía automáticamente una notificación al residente por WhatsApp y el panel web</li>
                            <li>El residente tiene un tiempo límite para aprobar o rechazar la visita</li>
                            <li>Si no responde en el tiempo configurado, se aplica la acción automática (aprobar o rechazar)</li>
                            <li>Los residentes pueden personalizar estos tiempos en su perfil individual</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Estado del sistema -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-green-50 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <x-heroicon-o-check-circle class="h-6 w-6 text-green-600" />
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-green-800">Sistema Activo</p>
                        <p class="text-xs text-green-600">Procesando aprobaciones</p>
                    </div>
                </div>
            </div>

            <div class="bg-yellow-50 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <x-heroicon-o-clock class="h-6 w-6 text-yellow-600" />
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-yellow-800">Timeout Actual</p>
                        <p class="text-xs text-yellow-600">{{ \App\Models\Setting::getApprovalTimeout() }} minutos</p>
                    </div>
                </div>
            </div>

            <div class="bg-blue-50 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <x-heroicon-o-bell class="h-6 w-6 text-blue-600" />
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-blue-800">Recordatorios</p>
                        <p class="text-xs text-blue-600">
                            @if(\App\Models\Setting::getApprovalReminderMinutes() > 0)
                                {{ \App\Models\Setting::getApprovalReminderMinutes() }} min antes
                            @else
                                Deshabilitados
                            @endif
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-filament-panels::page>
