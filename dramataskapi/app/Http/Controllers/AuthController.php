<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends BaseController
{
    public function __construct()
    {
        // Protege todas las rutas excepto login y registro
        $this->middleware('auth:api', ['except' => ['login', 'registro']]);
    }

    public function registro(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|between:2,100',
            'email' => 'required|string|email|max:100|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'estado' => 'error',
                'mensaje' => 'Error de validación',
                'errores' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'nombre' => $request->nombre,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'estado' => 'éxito',
            'mensaje' => 'Usuario registrado exitosamente',
            'usuario' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'estado' => 'error',
                'mensaje' => 'Error de validación',
                'errores' => $validator->errors()
            ], 422);
        }

        if (!$token = Auth::attempt($validator->validated())) {
            return response()->json([
                'estado' => 'error',
                'mensaje' => 'Credenciales no válidas'
            ], 401);
        }
//Guardo el ultimo login.
        Auth::user()->actualizarUltimoLogin();
        return $this->crearRespuestaToken($token);
    }

    public function logout()
    {
        Auth::logout();
        return response()->json([
            'estado' => 'éxito',
            'mensaje' => 'Sesión cerrada exitosamente'
        ]);
    }

    public function refresh()
    {
        return $this->crearRespuestaToken(Auth::refresh());
    }

    public function perfil()
    {
        return response()->json([
            'estado' => 'éxito',
            'usuario' => Auth::user()
        ]);
    }

    protected function crearRespuestaToken($token)
    {
        return response()->json([
            'estado' => 'éxito',
            'acceso' => [
                'token' => $token,
                'tipo' => 'bearer',
                'expira_en' => Auth::factory()->getTTL() * 60
            ],
            'usuario' => Auth::user()
        ]);
    }
}
