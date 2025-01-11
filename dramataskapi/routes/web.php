<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return response()->json([
        'mensaje' => 'DramaTask API',
        'documentación' => 'https://www.postman.com/api-documentation-tool/',
        'versión' => '1.0.0'
    ]);
});
