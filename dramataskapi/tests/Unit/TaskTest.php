<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test para crear una tarea válida.
     * Este test verifica que se puede crear una tarea con datos válidos y la tarea se almacena correctamente en la base de datos.
     */
    public function test_create_valid_task()
    {
        // Crea un usuario y lo autentica
        $user = User::factory()->create();
        $this->actingAs($user, 'api');

        // Datos de la tarea válida
        $taskData = [
            'title' => 'Test Task',
            'status' => 'pendiente',
        ];

        // Envía una solicitud POST para crear la tarea
        $response = $this->postJson('/api/tasks', $taskData);

        // Verifica que la respuesta tenga un estado 201 (creado)
        $response->assertStatus(201);

        // Verifica que la tarea se haya almacenado en la base de datos
        $this->assertDatabaseHas('tasks', array_merge($taskData, ['user_id' => $user->id]));
    }

    /**
     * Test para crear una tarea con datos inválidos.
     * Este test verifica que la API devuelve un error 400 cuando se intenta crear una tarea con datos inválidos.
     */
    public function test_create_invalid_task()
    {
        // Crea un usuario y lo autentica
        $user = User::factory()->create();
        $this->actingAs($user, 'api');

        // Datos de la tarea inválida
        $taskData = [
            'title' => 'Te', // Título demasiado corto
            'status' => 'invalid_status', // Estado no válido
        ];

        // Envía una solicitud POST para crear la tarea
        $response = $this->postJson('/api/tasks', $taskData);

        // Verifica que la respuesta tenga un estado 400 (solicitud incorrecta)
        $response->assertStatus(400);
    }


}
