<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Establecer el tamaño por defecto de las cadenas en las migraciones
        Schema::defaultStringLength(191);

        // Configurar la zona horaria por defecto
        date_default_timezone_set('UTC');

        // Configurar el locale para fechas
        setlocale(LC_TIME, 'es_ES.UTF-8');
    }
}
