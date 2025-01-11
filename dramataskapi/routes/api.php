<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::group(['middleware' => 'api'], function () {
    Route::prefix('auth')->group(function () {
        Route::post('registro', [AuthController::class, 'registro']);
        Route::post('login', [AuthController::class, 'login']);

        Route::group(['middleware' => 'auth:api'], function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('refresh', [AuthController::class, 'refresh']);
            Route::get('perfil', [AuthController::class, 'perfil']);
        });
    });
});

Route::get('test', function () {
    return response()->json([
        'mensaje' => 'API funcionando correctamente',
        'estado' => 'activo',
        'timestamp' => now()->toIso8601String(),
        'version' => '1.0.0'
    ]);
});
