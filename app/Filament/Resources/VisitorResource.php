<?php

namespace App\Filament\Resources;

use App\Filament\Resources\VisitorResource\Pages;
use App\Models\Visitor;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Notification;
use App\Notifications\NewVisitorNotification;
use Illuminate\Support\Facades\Log;

class VisitorResource extends Resource
{
    protected static ?string $model = Visitor::class;

    protected static ?string $navigationIcon = 'heroicon-o-user-group';
    protected static ?string $navigationLabel = 'Visitantes';


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
                    ->required(),
                Forms\Components\TextInput::make('vehicle_plate')
                    ->label('Placa del Vehículo'),
                Forms\Components\DateTimePicker::make('entry_time')
                    ->label('Hora de Entrada')
                    ->required(),
                Forms\Components\DateTimePicker::make('exit_time')
                    ->label('Hora de Salida'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Nombre')
                    ->searchable(),
                Tables\Columns\TextColumn::make('id_document')
                    ->label('Documento')
                    ->searchable(),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Residente')
                    ->searchable(),
                Tables\Columns\TextColumn::make('vehicle_plate')
                    ->label('Placa'),
                Tables\Columns\TextColumn::make('entry_time')
                    ->label('Entrada')
                    ->dateTime(),
                Tables\Columns\TextColumn::make('exit_time')
                    ->label('Salida')
                    ->dateTime(),
            ])
            ->filters([])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\DeleteBulkAction::make(),
            ])
            ->defaultSort('entry_time', 'desc')
            ->searchable();
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
     * Enviar notificación al residente después de guardar el visitante.
     *
     * @param \App\Models\Visitor $record
     */
    public static function afterSave($record)
    {
        $user = $record->user;

        if ($user) {
            $user->notify(new NewVisitorNotification($record));

            Log::info('Notificación enviada a ' . $user->name . ' sobre el visitante ' . $record->name);
        } else {
            Log::warning('No se asignó un residente para el visitante ' . $record->name);
        }
    }
}
