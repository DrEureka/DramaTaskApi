<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Validator;

class TaskController extends BaseController
{
    // Constructor que aplica el middleware de autenticación a todas las rutas excepto 'index' y 'show'
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['index', 'show']]);
    }

    /**
     * Muestra una lista paginada de tareas del usuario autenticado.
     * Parámetros opcionales:
     * - status: filtra las tareas por su estado (pendiente, en progreso, completada)
     * - search: busca tareas por título o descripción
     */
    public function index(Request $request)
    {
        // Obtiene las tareas del usuario autenticado
        $query = Task::where('user_id', auth()->id());

        // Filtra las tareas por estado si se proporciona
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Busca tareas por título o descripción si se proporciona
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'LIKE', '%' . $request->search . '%')
                    ->orWhere('description', 'LIKE', '%' . $request->search . '%');
            });
        }

        // Devuelve las tareas paginadas y asc.
        $sort = $request->get('sort', 'created_at');
        $order = $request->get('order', 'asc');

        $tasks = $query->orderBy($sort, $order)->paginate(15);

        return response()->json($tasks, 200);
    }

    /**
     * Muestra los detalles de una tarea específica del usuario autenticado.
     */
    public function show($id)
    {
        try {
            // Busca la tarea por su ID y el ID del usuario autenticado
            $task = Task::where('user_id', auth()->id())->findOrFail($id);
            return response()->json($task, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Tarea no encontrada.'], 404);
        }
    }

    /**
     * Crea una nueva tarea para el usuario autenticado.
     * Validaciones:
     * - title: requerido, mínimo 3 caracteres, máximo 100
     * - description: opcional, máximo 255 caracteres
     * - status: requerido, debe ser uno de: pendiente, en progreso, completada
     * - due_date: opcional, debe ser una fecha futura
     */
    public function store(Request $request)
    {
        // Valida los datos de la solicitud
        $validator = Validator::make($request->all(), Task::rules());

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        try {
            // Crea la tarea con los datos proporcionados y el ID del usuario autenticado
            $task = Task::create([
                'title' => $request->title,
                'description' => $request->description,
                'status' => $request->status,
                'due_date' => $request->due_date,
                'user_id' => auth()->id()
            ]);
            return response()->json($task, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error en servidor'], 500);
        }
    }

    /**
     * Actualiza una tarea existente del usuario autenticado.
     * Validaciones:
     * - title: requerido, mínimo 3 caracteres, máximo 100
     * - description: opcional, máximo 255 caracteres
     * - status: requerido, debe ser uno de: pendiente, en progreso, completada
     * - due_date: opcional, debe ser una fecha futura
     */
    public function update(Request $request, $id)
    {
        // Valida los datos de la solicitud
        $validator = Validator::make($request->all(), Task::rules($id));

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        try {
            // Busca la tarea por su ID y el ID del usuario autenticado
            $task = Task::where('user_id', auth()->id())->findOrFail($id);
            // Actualiza la tarea con los datos proporcionados
            $task->update($request->all());
            return response()->json($task, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Tarea no encontrada'], 404);
        }
    }

    /**
     * Elimina una tarea existente del usuario autenticado.
     */
    public function destroy($id)
    {
        try {
            // Busca la tarea por su ID y el ID del usuario autenticado
            $task = Task::where('user_id', auth()->id())->findOrFail($id);
            // Elimina la tarea
            $task->delete();
            return response()->json(['message' => 'Tarea eliminada'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Tarea no encontrada'], 404);
        }
    }
}
