<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class MobileAuthController extends Controller
{
    /**
     * Login para aplicación móvil
     * Devuelve un token Sanctum para autenticación API
     */
    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Intentar autenticar
            if (!Auth::attempt($request->only('email', 'password'))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Credenciales inválidas',
                ], 401);
            }

            $user = Auth::user();

            // Crear token Sanctum para la app móvil
            $token = $user->createToken('mobile-app')->plainTextToken;

            Log::info('[MOBILE LOGIN] Usuario autenticado desde móvil', [
                'user_id' => $user->id,
                'email' => $user->email,
                'rol' => $user->rol,
            ]);

            return response()->json([
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'rol' => $user->rol,
                    'whatsapp_notifications' => $user->whatsapp_notifications ?? false,
                    'email_notifications' => $user->email_notifications ?? false,
                ],
            ], 200);

        } catch (\Exception $e) {
            Log::error('[MOBILE LOGIN] Error en login móvil', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al procesar la solicitud',
            ], 500);
        }
    }

    /**
     * Registro para aplicación móvil
     * Crea un nuevo usuario y devuelve un token Sanctum
     */
    public function register(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
                'password_confirmation' => 'required|string|same:password',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Crear nuevo usuario
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'address' => $request->address,
                'rol' => 'residente', // Rol por defecto para usuarios móviles
                'email_verified_at' => now(), // Auto-verificar email para móvil
            ]);

            // Crear token Sanctum
            $token = $user->createToken('mobile-app')->plainTextToken;

            Log::info('[MOBILE REGISTER] Nuevo usuario registrado desde móvil', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Usuario registrado exitosamente',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'rol' => $user->rol,
                    'whatsapp_notifications' => $user->whatsapp_notifications ?? false,
                    'email_notifications' => $user->email_notifications ?? false,
                ],
            ], 201);

        } catch (\Exception $e) {
            Log::error('[MOBILE REGISTER] Error en registro móvil', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al registrar usuario',
            ], 500);
        }
    }

    /**
     * Logout para aplicación móvil
     * Revoca el token actual
     */
    public function logout(Request $request)
    {
        try {
            // Revocar el token actual
            $request->user()->currentAccessToken()->delete();

            Log::info('[MOBILE LOGOUT] Usuario cerró sesión desde móvil', [
                'user_id' => $request->user()->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Sesión cerrada exitosamente',
            ], 200);

        } catch (\Exception $e) {
            Log::error('[MOBILE LOGOUT] Error en logout móvil', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al cerrar sesión',
            ], 500);
        }
    }

    /**
     * Obtener usuario actual autenticado
     */
    public function user(Request $request)
    {
        try {
            $user = $request->user();

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'rol' => $user->rol,
                    'whatsapp_notifications' => $user->whatsapp_notifications ?? false,
                    'email_notifications' => $user->email_notifications ?? false,
                ],
            ], 200);

        } catch (\Exception $e) {
            Log::error('[MOBILE USER] Error obteniendo usuario', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener información del usuario',
            ], 500);
        }
    }
}

