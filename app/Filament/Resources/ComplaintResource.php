<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ComplaintResource\Pages;
use App\Models\Complaint;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;


class ComplaintResource extends Resource

{


    public static function getModelLabel(): string
    {
        return 'Queja';
    }

    public static function getPluralModelLabel(): string
    {
        return 'Quejas';
    }
    protected static ?string $model = Complaint::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function canViewAny(): bool
    {
        $user = auth()->user();
        return in_array($user?->rol, ['administrador', 'adminresidencial']);
    }
    public static function canCreate(): bool
    {
        $user = auth()->user();
        return $user?->rol !== 'adminresidencial';
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Textarea::make('message')->disabled(),
            TextInput::make('user.name')->label('Usuario')->disabled(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
        ->columns([
            Tables\Columns\TextColumn::make('user.name')->label('Usuario'),
            Tables\Columns\TextColumn::make('message')->limit(50),
            Tables\Columns\TextColumn::make('created_at')->label('Fecha')->dateTime(),
        ])
        ->filters([]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListComplaints::route('/'),
            'create' => Pages\CreateComplaint::route('/create'),
            'edit' => Pages\EditComplaint::route('/{record}/edit'),
        ];
    }
}
