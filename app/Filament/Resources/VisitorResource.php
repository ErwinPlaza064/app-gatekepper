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
                    ->required(),  // Este campo es obligatorio
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
                Tables\Columns\TextColumn::make('name')->label('Nombre'),
                Tables\Columns\TextColumn::make('id_document')->label('Documento'),
                Tables\Columns\TextColumn::make('user.name')->label('Residente'),
                Tables\Columns\TextColumn::make('vehicle_plate')->label('Placa'),
                Tables\Columns\TextColumn::make('entry_time')->label('Entrada')->dateTime(),
                Tables\Columns\TextColumn::make('exit_time')->label('Salida')->dateTime(),
            ])
            ->filters([])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\DeleteBulkAction::make(),
            ]);
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
            // Enviar la notificación al residente
            $user->notify(new NewVisitorNotification($record));
    
            Log::info('Notificación enviada a ' . $user->name . ' sobre el visitante ' . $record->name);
        } else {
            Log::warning('No se asignó un residente para el visitante ' . $record->name);
        }
    }
}
