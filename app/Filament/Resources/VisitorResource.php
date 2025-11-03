<?php

namespace App\Filament\Resources;

use App\Filament\Resources\VisitorResource\Pages;
use App\Models\Visitor;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Notifications\Notification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Notification as LaravelNotification;
use App\Notifications\NewVisitorNotification;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class VisitorResource extends Resource
{
    protected static ?string $model = Visitor::class;

    protected static ?string $navigationIcon = 'heroicon-o-user-group';
    protected static ?string $navigationLabel = 'Visitantes';

    public static function getModelLabel(): string
    {
        return 'Visitante';
    }

    public static function getPluralModelLabel(): string
    {
        return 'Visitantes';
    }

    // Búsqueda global mejorada
    public static function getGlobalSearchEloquentQuery(): Builder
    {
        return parent::getGlobalSearchEloquentQuery()
            ->with(['user']);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['name', 'id_document', 'vehicle_plate', 'user.name'];
    }

    public static function getGlobalSearchResultDetails($record): array
    {
        return [
            'Documento' => $record->id_document,
            'Residente' => $record->user?->name ?? 'Sin asignar',
            'Entrada' => $record->entry_time?->format('d/m/Y H:i'),
            'Placa' => $record->vehicle_plate ?: 'Sin vehículo',
        ];
    }

    public static function canViewAny(): bool
    {
        $user = auth()->user();
        return in_array($user?->rol, ['administrador', 'portero']);
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->label('Nombre del Visitante')
                    ->required(),

                Forms\Components\TextInput::make('id_document')
                    ->label('Documento de Identidad')
                    ->required(),

                Forms\Components\Select::make('user_id')
                    ->label('Residente')
                    ->relationship('user', 'name')
                    ->searchable()
                    ->preload()
                    ->required(),

                Forms\Components\TextInput::make('vehicle_plate')
                    ->label('Placa del Vehículo')
                    ->placeholder('ABC-123'),

                Forms\Components\DateTimePicker::make('entry_time')
                    ->label('Hora de Entrada')
                    ->default(now())
                    ->required(),

                Forms\Components\DateTimePicker::make('exit_time')
                    ->label('Hora de Salida')
                    ->after('entry_time'),

                // Campo oculto para establecer status aprobado por defecto
                Forms\Components\Hidden::make('approval_status')
                    ->default('approved'),

                Forms\Components\Hidden::make('approval_responded_at')
                    ->default(now()),

                Forms\Components\Textarea::make('approval_notes')
                    ->label('Notas')
                    ->placeholder('Notas adicionales sobre la visita')
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Visitante')
                    ->sortable()
                    ->wrap(),

                Tables\Columns\TextColumn::make('id_document')
                    ->label('Documento')
                    ->sortable()
                    ->copyable(),

                Tables\Columns\TextColumn::make('user.name')
                    ->label('Residente')
                    ->sortable()
                    ->wrap(),

                Tables\Columns\TextColumn::make('vehicle_plate')
                    ->label('Placa')
                    ->placeholder('Sin vehículo')
                    ->badge()
                    ->color('gray'),

                Tables\Columns\TextColumn::make('entry_time')
                    ->label('Entrada')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),

                Tables\Columns\TextColumn::make('exit_time')
                    ->label('Salida')
                    ->dateTime('d/m/Y H:i')
                    ->placeholder('Aún dentro')
                    ->color(fn ($record) => $record->exit_time ? 'success' : 'warning'),

                Tables\Columns\IconColumn::make('status')
                    ->label('Estado Visita')
                    ->getStateUsing(fn ($record) => is_null($record->exit_time))
                    ->boolean()
                    ->trueIcon('heroicon-o-clock')
                    ->falseIcon('heroicon-o-check-circle')
                    ->trueColor('warning')
                    ->falseColor('success')
                    ->tooltip(fn ($record) => is_null($record->exit_time) ? 'Visitante adentro' : 'Visita finalizada'),
            ])
            ->filters([
                Filter::make('search')
                    ->form([
                        Forms\Components\TextInput::make('search')
                            ->placeholder('Buscar visitantes, documentos, placas...')
                            ->live()
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query->when(
                            $data['search'],
                            fn (Builder $query, $search): Builder => $query->where(function (Builder $query) use ($search) {
                                $query->where('name', 'like', "%{$search}%")
                                      ->orWhere('id_document', 'like', "%{$search}%")
                                      ->orWhere('vehicle_plate', 'like', "%{$search}%")
                                      ->orWhereHas('user', function (Builder $query) use ($search) {
                                          $query->where('name', 'like', "%{$search}%");
                                      });
                            })
                        );
                    }),

                Filter::make('active_visits')
                    ->label('Visitantes adentro')
                    ->query(fn (Builder $query): Builder => $query->whereNull('exit_time'))
                    ->toggle(),

                Filter::make('completed_visits')
                    ->label('Visitas finalizadas')
                    ->query(fn (Builder $query): Builder => $query->whereNotNull('exit_time'))
                    ->toggle(),

                Filter::make('with_vehicle')
                    ->label('Con vehículo')
                    ->query(fn (Builder $query): Builder => $query->whereNotNull('vehicle_plate')->where('vehicle_plate', '!=', ''))
                    ->toggle(),

                Filter::make('today')
                    ->label('Visitantes de hoy')
                    ->query(fn (Builder $query): Builder => $query->whereDate('entry_time', today()))
                    ->toggle(),

                Filter::make('this_week')
                    ->label('Esta semana')
                    ->query(fn (Builder $query): Builder => $query->whereBetween('entry_time', [
                        now()->startOfWeek(),
                        now()->endOfWeek()
                    ]))
                    ->toggle(),

                SelectFilter::make('user_id')
                    ->label('Filtrar por residente')
                    ->relationship('user', 'name')
                    ->searchable()
                    ->preload(),

                Filter::make('date_range')
                    ->form([
                        Forms\Components\DatePicker::make('from')
                            ->label('Desde'),
                        Forms\Components\DatePicker::make('until')
                            ->label('Hasta'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['from'],
                                fn (Builder $query, $date): Builder => $query->whereDate('entry_time', '>=', $date),
                            )
                            ->when(
                                $data['until'],
                                fn (Builder $query, $date): Builder => $query->whereDate('entry_time', '<=', $date),
                            );
                    }),
            ])
            ->actions([
                Tables\Actions\ViewAction::make()
                    ->label('Ver'),

                Tables\Actions\EditAction::make()
                    ->label('Editar'),

                Tables\Actions\Action::make('mark_exit')
                    ->label('Marcar Salida')
                    ->icon('heroicon-o-arrow-right-on-rectangle')
                    ->color('success')
                    ->visible(fn ($record) => is_null($record->exit_time))
                    ->requiresConfirmation()
                    ->modalHeading('Marcar salida del visitante')
                    ->modalDescription(fn ($record) => "¿Confirmas que {$record->name} está saliendo?")
                    ->action(function ($record) {
                        $record->update(['exit_time' => now()]);

                        Notification::make()
                            ->title('Salida registrada')
                            ->body("Se registró la salida de {$record->name}")
                            ->success()
                            ->send();
                    }),
            ])
            ->defaultSort('entry_time', 'desc')
            ->striped()
            ->paginated([10, 25, 50, 100])
            ->deselectAllRecordsWhenFiltered(false); // Previene errores JavaScript
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListVisitors::route('/'),
            'create' => Pages\CreateVisitor::route('/create'),
            'edit' => Pages\EditVisitor::route('/{record}/edit'),
        ];
    }

    /**
     * Manejar eventos después de guardar el visitante.
     * Las notificaciones se envían para informar sobre nuevos visitantes
     * y actualizaciones, pero no sobre aprobaciones/rechazos
     *
     * @param \App\Models\Visitor $record
     */
    public static function afterSave($record)
    {
        Log::info('Visitante guardado desde Filament', [
            'visitor_id' => $record->id,
            'visitor_name' => $record->name,
            'has_qr' => $record->qr_code_id ? true : false,
            'type' => $record->qr_code_id ? 'programado' : 'espontáneo',
            'resident' => $record->user?->name ?? 'Sin asignar'
        ]);
    }
}
