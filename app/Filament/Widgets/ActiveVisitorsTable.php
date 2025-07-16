<?php

namespace App\Filament\Widgets;

use App\Models\Visitor;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class ActiveVisitorsTable extends BaseWidget
{
    protected static ?string $heading = 'Visitantes Actualmente Dentro';

    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Visitor::query()
                    ->whereNotNull('entry_time')
                    ->whereNull('exit_time')
                    ->with(['user', 'qrCode'])
                    ->orderBy('entry_time', 'desc')
            )
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Nombre del Visitante')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('id_document')
                    ->label('Documento')
                    ->searchable(),

                Tables\Columns\TextColumn::make('user.name')
                    ->label('Residente Anfitrión')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('entry_time')
                    ->label('Hora de Entrada')
                    ->dateTime('H:i:s d/m/Y')
                    ->sortable(),

                Tables\Columns\TextColumn::make('vehicle_plate')
                    ->label('Placa Vehículo')
                    ->placeholder('Sin vehículo')
                    ->searchable(),

                Tables\Columns\BadgeColumn::make('access_method')
                    ->label('Método')
                    ->getStateUsing(fn (Visitor $record): string =>
                        $record->qr_code_id ? 'QR' : 'Manual'
                    )
                    ->color(fn (string $state): string => match ($state) {
                        'QR' => 'success',
                        'Manual' => 'warning',
                    }),

                Tables\Columns\TextColumn::make('duration')
                    ->label('Tiempo Dentro')
                    ->getStateUsing(function (Visitor $record): string {
                        $entryTime = $record->entry_time;
                        $now = now();
                        $diff = $entryTime->diff($now);

                        if ($diff->days > 0) {
                            return $diff->format('%d días, %h horas');
                        } elseif ($diff->h > 0) {
                            return $diff->format('%h horas, %i minutos');
                        } else {
                            return $diff->format('%i minutos');
                        }
                    }),
            ])
            ->defaultSort('entry_time', 'desc')
            ->emptyStateHeading('No hay visitantes dentro')
            ->emptyStateDescription('Todos los visitantes han salido o no hay registros de entrada.')
            ->emptyStateIcon('heroicon-o-user-group');
    }
}
