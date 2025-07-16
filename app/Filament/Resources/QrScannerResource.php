<?php

namespace App\Filament\Resources;

use App\Filament\Resources\QrScannerResource\Pages;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Models\Visitor;

class QrScannerResource extends Resource
{
    protected static ?string $model = Visitor::class;

    protected static ?string $navigationIcon = 'heroicon-o-qr-code';

    protected static ?string $navigationLabel = 'Escáner QR';

    protected static ?string $modelLabel = 'Escáner QR';

    protected static ?string $pluralModelLabel = 'Escáner QR';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                //
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
                Tables\Columns\TextColumn::make('entry_time')
                    ->label('Hora de Entrada')
                    ->dateTime()
                    ->sortable(),
                Tables\Columns\TextColumn::make('vehicle_plate')
                    ->label('Placa Vehículo')
                    ->placeholder('Sin vehículo'),
            ])
            ->filters([
                //
            ])
            ->actions([
                //
            ])
            ->bulkActions([
                //
            ])
            ->defaultSort('entry_time', 'desc');
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
            'index' => Pages\QrScanner::route('/'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit($record): bool
    {
        return false;
    }
}
