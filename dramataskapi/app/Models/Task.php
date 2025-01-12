<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'status',
        'due_date',
        'user_id'
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    public static function rules($id = null)
    {
        return [
            'title' => 'required|string|min:3|max:100',
            'description' => 'nullable|string|max:255',
            'status' => 'required|in:pendiente,en progreso,completada',
            'due_date' => 'nullable|date|after:today'
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
