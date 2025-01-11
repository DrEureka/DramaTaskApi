<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    /**
     * Indica si se deben usar los timestamps por defecto
     */
    public $timestamps = true;

    /**
     * Los nombres personalizados para las columnas de timestamps
     */
    const CREATED_AT = 'fecha_creacion';
    const UPDATED_AT = 'fecha_actualizacion';

    /**
     * Los atributos que son asignables masivamente
     */
    protected $fillable = [
        'nombre',
        'email',
        'password',
        'ultimo_login',
    ];

    /**
     * Los atributos que deben ocultarse en las arrays
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Los atributos que deben ser convertidos a tipos nativos
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'ultimo_login' => 'datetime',
        'fecha_creacion' => 'datetime',
        'fecha_actualizacion' => 'datetime',
    ];

    /**
     * Los atributos que deben ser incluidos por defecto
     */
    protected $dates = [
        'ultimo_login',
        'fecha_creacion',
        'fecha_actualizacion',
    ];

    /**
     * Get un identificador único para el usuario
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Retorna un array con los claims personalizados para el token JWT
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    /**
     * Actualizar la fecha del último login
     */
    public function actualizarUltimoLogin()
    {
        $this->ultimo_login = now();
        $this->save();
    }

    /**
     * Metodo para obtener el nombre completo del usuario
     */
    public function getNombreCompletoAttribute()
    {
        return $this->nombre;
    }

    /**
     * Boot function from Laravel
     */
    protected static function boot()
    {
        parent::boot();

        // Antes de crear un nuevo usuario
        static::creating(function ($user) {
            $user->fecha_creacion = $user->fecha_creacion ?? now();
        });

        // Antes de actualizar un usuario
        static::updating(function ($user) {
            $user->fecha_actualizacion = now();
        });
    }
}
