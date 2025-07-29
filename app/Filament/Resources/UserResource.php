<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Filters\Filter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserResource extends Resource
{
    public static function getModelLabel(): string
    {
        return 'Residente';
    }

    public static function getPluralModelLabel(): string
    {
        return 'Residentes';
    }

    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';
    protected static ?string $navigationLabel = 'Residentes';

    // Búsqueda global mejorada
    public static function getGlobalSearchEloquentQuery(): Builder
    {
        return parent::getGlobalSearchEloquentQuery()
            ->with([]);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['name', 'email', 'phone', 'address'];
    }

    public static function getGlobalSearchResultDetails(Model $record): array
    {
        return [
            'Email' => $record->email,
            'Teléfono' => $record->phone ?: 'Sin teléfono',
            'Dirección' => $record->address,
        ];
    }

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
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->label('Nombre')
                    ->required(),

                Forms\Components\TextInput::make('email')
                    ->label('Correo Electrónico')
                    ->email()
                    ->required(),

                Forms\Components\TextInput::make('address')
                    ->label('Dirección')
                    ->required(),

                Forms\Components\TextInput::make('phone')
                    ->label('Teléfono WhatsApp')
                    ->tel()
                    ->placeholder('4641123632'),

                Forms\Components\Toggle::make('whatsapp_notifications')
                    ->label('Recibir notificaciones por WhatsApp')
                    ->default(true)
                    ->helperText('Si está habilitado, recibirá notificaciones de visitantes por WhatsApp'),

                Forms\Components\TextInput::make('password')
                    ->label('Contraseña')
                    ->password()
                    ->required(fn ($livewire) => $livewire instanceof \Filament\Resources\Pages\CreateRecord)
                    ->dehydrateStateUsing(fn ($state) => filled($state) ? Hash::make($state) : null)
                    ->dehydrated(fn ($state) => filled($state))
                    ->helperText('Déjalo vacío para mantener la contraseña actual.'),

                Forms\Components\Hidden::make('remember_token')
                    ->default(fn () => Str::random(60)),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Nombre')
                    ->sortable(),

                Tables\Columns\TextColumn::make('email')
                    ->label('Correo Electrónico')
                    ->sortable(),

                Tables\Columns\TextColumn::make('phone')
                    ->label('Teléfono WhatsApp')
                    ->placeholder('Sin teléfono'),

                Tables\Columns\TextColumn::make('address')
                    ->label('Dirección'),
            ])
            ->filters([
                Filter::make('search')
                    ->form([
                        Forms\Components\TextInput::make('search')
                            ->placeholder('Buscar residentes...')
                            ->live()
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query->when(
                            $data['search'],
                            fn (Builder $query, $search): Builder => $query->where(function (Builder $query) use ($search) {
                                $query->where('name', 'like', "%{$search}%")
                                      ->orWhere('email', 'like', "%{$search}%")
                                      ->orWhere('phone', 'like', "%{$search}%")
                                      ->orWhere('address', 'like', "%{$search}%");
                            })
                        );
                    }),

                Tables\Filters\SelectFilter::make('whatsapp_notifications')
                    ->label('Notificaciones WhatsApp')
                    ->options([
                        1 => 'Habilitadas',
                        0 => 'Deshabilitadas',
                    ])
                    ->placeholder('Todas'),

                Filter::make('has_phone')
                    ->label('Con teléfono')
                    ->query(fn (Builder $query): Builder => $query->whereNotNull('phone')->where('phone', '!=', ''))
                    ->toggle(),

                Filter::make('no_phone')
                    ->label('Sin teléfono')
                    ->query(fn (Builder $query): Builder => $query->where(function (Builder $query) {
                        $query->whereNull('phone')->orWhere('phone', '=', '');
                    }))
                    ->toggle(),

                Filter::make('verified_users')
                    ->label('Usuarios verificados')
                    ->query(fn (Builder $query): Builder => $query->whereNotNull('email_verified_at'))
                    ->toggle(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->defaultSort('name', 'asc');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
