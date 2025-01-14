let currentTasks = [];
let sortOrder = "desc";
let currentResponse = null;
let isSubmitting = false;
let currentPage = 1;

// Función para obtener las tareas
async function fetchTasks(page = 1) {
  showSkeletonCards();
  try {
    const response = await api.get(`/tasks?page=${page}`);
    if (response.data && response.data.data) {
      displayTasks(response.data);
    } else {
      elements.taskList.innerHTML =
        '<div class="col-12 text-center">No hay tareas disponibles.</div>';
    }
  } catch (error) {
    console.error("Error fetching tasks:", error);
    if (error.response?.status === 401) {
      handleLogout();
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al cargar las tareas",
      });
    }
  } finally {
    hideSkeletonCards();
  }
}

// Función para mostrar las tareas
function displayTasks(response, maintainPage = false) {
  currentResponse = response;
  const tasks = response.data || [];
  currentTasks = tasks;

  const sortedTasks = sortTasksByDate(tasks, sortOrder);
  const statusFilter = document.getElementById("status-filter").value;
  const filteredTasks = filterTasks(sortedTasks, statusFilter);

  elements.taskList.innerHTML = "";

  if (filteredTasks.length === 0) {
    elements.taskList.innerHTML = `
      <div class="col-12 text-center">
        <p class="text-muted">No hay tareas ${
          statusFilter !== "todos" ? "con este estado" : "disponibles"
        }.</p>
      </div>`;
    return;
  }

  filteredTasks.forEach((task) => {
    const taskElement = createTaskElement(task);
    elements.taskList.appendChild(taskElement);
  });

  if (response.last_page > 1) {
    addPaginationControls(response, maintainPage);
  }
}

// Función para manejar el envío del formulario de tareas
async function handleTaskSubmit(e) {
  e.preventDefault();
  if (isSubmitting) return;

  if (!validateTaskForm()) {
    return;
  }

  const submitButton = e.target.querySelector('button[type="submit"]');
  const originalText = submitButton.innerHTML;

  try {
    isSubmitting = true;
    submitButton.disabled = true;
    submitButton.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';

    const taskId = document.getElementById("task-id").value;
    const taskData = {
      title: document.getElementById("task-title").value,
      description: document.getElementById("task-description").value,
      status: document.getElementById("task-status").value,
      due_date: document.getElementById("task-due-date").value,
    };

    if (taskId) {
      await api.put(`/tasks/${taskId}`, taskData);
    } else {
      await api.post("/tasks", taskData);
    }

    elements.taskModal.hide();
    resetTaskForm();
    await fetchTasks();

    Swal.fire({
      icon: "success",
      title: "Tarea guardada",
      text: "La tarea se ha guardado exitosamente",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Error saving task:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.response?.data?.mensaje || "Error al guardar la tarea",
    });
  } finally {
    isSubmitting = false;
    submitButton.disabled = false;
    submitButton.innerHTML = originalText;
  }
}

// Función para eliminar una tarea
async function deleteTask(taskId) {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: "No podrás revertir esto!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, eliminar.",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    try {
      await api.delete(`/tasks/${taskId}`);
      await fetchTasks();
      Swal.fire("Eliminado!", "La tarea ha sido eliminada.", "success");
    } catch (error) {
      console.error("Error deleting task:", error);
      Swal.fire({
        icon: "error",
        title: "Error eliminando la tarea",
        text: "Hubo un error al eliminar la tarea",
      });
    }
  }
}

// Función para editar una tarea
async function editTask(taskId) {
  try {
    const response = await api.get(`/tasks/${taskId}`);
    const task = response.data;

    document.getElementById("task-id").value = task.id;
    document.getElementById("task-title").value = task.title;
    document.getElementById("task-description").value = task.description || "";
    document.getElementById("task-status").value = task.status;
    document.getElementById("task-due-date").value = task.due_date
      ? task.due_date.slice(0, 16)
      : "";

    elements.taskModal.show();
  } catch (error) {
    console.error("Error cargando la tarea:", error);
    alert("Error cargando la tarea");
  }
}

// Función para validar los campos del formulario de tareas
function validateTaskForm() {
  const title = document.getElementById("task-title").value.trim();
  const description = document.getElementById("task-description").value.trim();
  const status = document.getElementById("task-status").value;
  const dueDate = document.getElementById("task-due-date").value;

  let isValid = true;
  const errors = {};

  // Tomar la fecha/hora local actual del navegador
  const nowLocal = new Date();

  // Título: entre 3 y 100 caracteres
  if (title.length < 3 || title.length > 100) {
    isValid = false;
    errors.title =
      "El título es requerido y debe tener entre 3 y 100 caracteres.";
  }

  // Descripción: máximo 255 caracteres
  if (description.length > 255) {
    isValid = false;
    errors.description =
      "La descripción puede tener un máximo de 255 caracteres.";
  }

  // Estado: pendiente, en progreso o completada
  const validStatuses = ["pendiente", "en progreso", "completada"];
  if (!validStatuses.includes(status)) {
    isValid = false;
    errors.status =
      "El estado es requerido y debe ser uno de: pendiente, en progreso, completada.";
  }

  // Validar que la fecha de vencimiento sea futura (comparada con "nowLocal")
  if (dueDate && new Date(dueDate) <= nowLocal) {
    isValid = false;
    errors.dueDate = "La fecha de vencimiento debe ser una fecha futura.";
  }

  displayValidationErrors(errors);
  return isValid;
}
// Función para mostrar mensajes de error de validación
function displayValidationErrors(errors) {
  const errorElements = document.querySelectorAll(".form-error");
  errorElements.forEach((element) => (element.textContent = ""));

  if (errors.title) {
    document.getElementById("task-title-error").textContent = errors.title;
  }
  if (errors.description) {
    document.getElementById("task-description-error").textContent =
      errors.description;
  }
  if (errors.status) {
    document.getElementById("task-status-error").textContent = errors.status;
  }
  if (errors.dueDate) {
    document.getElementById("task-due-date-error").textContent = errors.dueDate;
  }
}

// Funciones de orden, skeleton, etc.
function sortTasksByDate(tasks, order) {
  return tasks.sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return order === "asc" ? dateA - dateB : dateB - dateA;
  });
}

function showSkeletonCards() {
  elements.taskList.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const skeletonCard = document.createElement("div");
    skeletonCard.className = "col-md-4 mb-3";
    skeletonCard.innerHTML = `
      <div class="skeleton-card">
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-badge"></div>
        <div class="d-flex justify-content-end gap-2">
          <div class="skeleton-button"></div>
          <div class="skeleton-button"></div>
        </div>
      </div>
    `;
    elements.taskList.appendChild(skeletonCard);
  }
}

function hideSkeletonCards() {
  // Si es necesario, limpia o re-renderiza. displayTasks() se encarga del contenido.
}

// Función para crear el elemento de tarea
function createTaskElement(task) {
  const div = document.createElement("div");
  div.className = "col-md-4 mb-3";

  const statusClass = getStatusClass(task.status);
  const formattedDueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString()
    : "Sin fecha";
  const formattedCreatedDate = new Date(task.created_at).toLocaleDateString();

  const deleteButton =
    task.status === "completada"
      ? `<button onclick="deleteTask(${task.id})" class="btn btn-sm btn-danger">
           <i class="fas fa-trash"></i> Eliminar
         </button>`
      : "";

  div.innerHTML = `
    <div class="card h-100">
      <div class="card-header">
        <span class="badge ${statusClass} status-badge" 
              style="cursor: pointer;" 
              onclick="openStatusModal(${task.id}, '${task.status}')">
          ${task.status}
        </span>
      </div>
      <div class="card-body">
        <h5 class="card-title">${escapeHtml(task.title)}</h5>
        <p class="card-text">${escapeHtml(task.description || "")}</p>
        <div class="task-dates">
          <small class="text-muted">Creada: ${formattedCreatedDate}</small><br>
          <small class="text-muted">Vence: ${formattedDueDate}</small>
        </div>
      </div>
      <div class="card-footer bg-transparent">
        <div class="d-flex justify-content-end gap-2">
          <button onclick="editTask(${task.id})" class="btn btn-sm btn-primary">
            <i class="fas fa-edit"></i> Editar
          </button>
          ${deleteButton}
        </div>
      </div>
    </div>
  `;
  return div;
}

// Función para encapsular las clases según el estado
function getStatusClass(status) {
  const statusClasses = {
    pendiente: "bg-warning text-dark",
    "en progreso": "bg-info text-white",
    completada: "bg-success text-white",
  };
  return statusClasses[status] || "bg-secondary";
}

// Función para agregar paginación
function addPaginationControls(response) {
  const paginationNav = document.createElement("nav");
  paginationNav.className = "col-12";
  paginationNav.innerHTML = `
    <ul class="pagination justify-content-center">
      ${response.links
        .map(
          (link) => `
            <li class="page-item ${link.active ? "active" : ""} ${
            !link.url ? "disabled" : ""
          }">
              <a class="page-link" href="#" 
                 onclick="fetchTasks(${
                   link.url ? link.url.split("page=")[1] : "1"
                 }); return false;">
                ${link.label
                  .replace("&laquo;", "«")
                  .replace("&raquo;", "»")
                  .replace("Next »", "Siguiente »")
                  .replace("« Previous", "Anterior «")}
              </a>
            </li>`
        )
        .join("")}
    </ul>
  `;
  elements.taskList.appendChild(paginationNav);
}

// Función para escape de caracteres HTML
function escapeHtml(unsafe) {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
<<<<<<< HEAD
}
=======
}w
>>>>>>> origin/Dev
