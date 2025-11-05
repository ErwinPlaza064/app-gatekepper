<x-filament-panels::page>
    <div class="space-y-6">
        <!-- Header -->
        <div class="p-6 bg-black rounded-lg shadow">
            <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                    <x-heroicon-o-cog-6-tooth class="w-8 h-8 text-primary-600" />
                </div>
                <div>
                    <h2 class="text-xl font-semibold text-gray-900">Sistema de Aprobación de Visitantes</h2>
                    <p class="text-sm text-gray-600">
                        Configura los parámetros globales para todo el residencial.
                        <strong>Solo los super administradores</strong> pueden modificar estos valores que aplican a todos los residentes por igual.
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
        <div class="p-6 rounded-lg bg-blue-50">
            <div class="flex">
                <div class="flex-shrink-0">
                    <x-heroicon-o-information-circle class="w-5 h-5 text-blue-400" />
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-medium text-blue-800">
                        ¿Cómo funciona el sistema?
                    </h3>
                    <div class="mt-2 text-sm text-blue-700">
                        <ul class="pl-5 space-y-1 list-disc">
                            <li>Cuando llega un visitante espontáneo, el portero lo registra sin código QR</li>
                            <li>El sistema envía automáticamente una notificación al residente por WhatsApp y el panel web</li>
                            <li>El residente tiene un tiempo límite <strong>global</strong> para aprobar o rechazar la visita</li>
                            <li>Si no responde en el tiempo configurado, se aplica la acción automática <strong>global</strong> (aprobar o rechazar)</li>
                            <li><strong>Todos los residentes usan la misma configuración</strong> establecida por el super admin</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Estado del sistema -->
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div class="p-4 rounded-lg bg-green-50">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <x-heroicon-o-check-circle class="w-6 h-6 text-green-600" />
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-green-800">Sistema Activo</p>
                        <p class="text-xs text-green-600">Procesando aprobaciones</p>
                    </div>
                </div>
            </div>

            <div class="p-4 rounded-lg bg-yellow-50">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <x-heroicon-o-clock class="w-6 h-6 text-yellow-600" />
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-yellow-800">Timeout Actual</p>
                        <p class="text-xs text-yellow-600">{{ \App\Models\Setting::getApprovalTimeout() }} minutos</p>
                    </div>
                </div>
            </div>

            <div class="p-4 rounded-lg bg-blue-50">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <x-heroicon-o-bell class="w-6 h-6 text-blue-600" />
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
