const API_BASE_URL = "https://dramataskapi.helioho.st/public/api";
let token = sessionStorage.getItem("token");
let currentUser = null;

// Configuración de Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  },
});

// Elementos del DOM
const elements = {
  loginForm: document.getElementById("login-form"),
  registerForm: document.getElementById("register-form"),
  loginDiv: document.getElementById("login-div"),
  registerDiv: document.getElementById("register-div"),
  mainContent: document.getElementById("mainContent"),
  searchForm: document.getElementById("search-form"),
  taskList: document.getElementById("task-list"),
  taskForm: document.getElementById("task-form"),
  logoutBtn: document.getElementById("logout-btn"),
  registerLink: document.getElementById("register-link"),
  loginLink: document.getElementById("login-link"),
  currentDateTime: document.getElementById("currentDateTime"),
  userInfo: document.querySelector(".username"),
  taskModal: new bootstrap.Modal(document.getElementById("taskModal"), {
    keyboard: false,
  }),
};

// Agregar listeners de eventos
elements.loginForm?.addEventListener("submit", handleLogin);
elements.registerForm?.addEventListener("submit", handleRegister);
elements.searchForm?.addEventListener("submit", handleSearch);
elements.taskForm?.addEventListener("submit", handleTaskSubmit);
elements.logoutBtn?.addEventListener("click", handleLogout);
elements.registerLink?.addEventListener("click", () => showRegisterForm());
elements.loginLink?.addEventListener("click", () => showLoginForm());

// Función para actualizar la fecha y hora
function updateDateTime() {
  const now = new Date();
  if (elements.currentDateTime) {
    elements.currentDateTime.textContent = `Time (UTC): ${now
      .toISOString()
      .replace("T", " ")
      .slice(0, 19)}`;
  }
}

// Función para manejar la búsqueda de tareas
async function handleSearch(e) {
  e.preventDefault();
  const searchInput = document.getElementById("search-input");
  const searchTerm = searchInput.value.trim();

  if (searchTerm === "") {
    Swal.fire({
      icon: "warning",
      title: "Advertencia",
      text: "Ingrese un término de búsqueda.",
    });
    return;
  }

  showSkeletonCards(); // Muestra skeletons antes de la solicitud

  try {
    const response = await api.get(
      `/tasks?search=${encodeURIComponent(searchTerm)}`
    );

    if (response.data && response.data.data) {
      displayTasks(response.data);
      document.getElementById("clear-search").style.display = "block"; // Muestra el botón de limpiar
    } else {
      elements.taskList.innerHTML =
        '<div class="col-12 text-center">No se encontró tareas.</div>';
    }
  } catch (error) {
    console.error("Error searching tasks:", error);
    if (error.response?.status === 401) {
      handleLogout();
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          "Error searching tasks: " +
          (error.response?.data?.mensaje || "Error"),
      });
    }
  } finally {
    hideSkeletonCards(); // Oculta skeletons después de la solicitud
  }
}

// Función para limpiar la búsqueda y recargar todas las tareas
async function clearSearch() {
  document.getElementById("search-input").value = "";
  document.getElementById("clear-search").style.display = "none"; // Oculta el botón de limpiar
  await fetchTasks(); // Vuelve a cargar todas las tareas
}

// Listener para el botón de limpiar búsqueda
document.getElementById("clear-search").addEventListener("click", clearSearch);

// Listener para el campo de búsqueda para mostrar el botón de limpiar si hay texto
document.getElementById("search-input").addEventListener("input", function () {
  const clearSearchButton = document.getElementById("clear-search");
  if (this.value.trim() !== "") {
    clearSearchButton.style.display = "block";
  } else {
    clearSearchButton.style.display = "none";
  }
});

// Función para mostrar tarjetas de carga de skeleton
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

// Función para ocultar tarjetas de carga de skeleton
function hideSkeletonCards() {
  // Aquí no eliminamos el contenido, ya que `displayTasks` se encargará de ello
}

// Actualizar información del usuario
function updateUserInfo(user) {
  currentUser = user;
  if (elements.userInfo) {
    elements.userInfo.textContent = `User: ${user.nombre}`;
  }
}

// Función para verificar la autenticación del usuario
async function checkAuth() {
  try {
    const response = await api.get("/auth/perfil");
    if (response.data.estado === "éxito") {
      updateUserInfo(response.data.usuario);
      showMainContent();
      await fetchTasks();
    }
  } catch (error) {
    console.error("Fallo Auth:", error);
    handleLogout();
  }
}

// Función para manejar el inicio de sesión
async function handleLogin(e) {
  e.preventDefault();

  const loginButton = document.getElementById("login-button");
  loginButton.classList.add("loading"); // Agregar clase de carga

  try {
    const response = await api.post("/auth/login", {
      email: document.getElementById("login-email").value,
      password: document.getElementById("login-password").value,
    });

    if (response.data.estado === "éxito") {
      token = response.data.acceso.token;
      sessionStorage.setItem("token", token);
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      updateUserInfo(response.data.usuario);
      showMainContent();
      await fetchTasks();
    }
  } catch (error) {
    console.error("Error Login:", error);
    // Mostrar mensaje de error con SweetAlert
    Swal.fire({
      icon: "error",
      title: "Verifique sus credenciales e intentelo de nuevo",
      text: error.response?.data?.mensaje || "Error de autenticación",
    });
  } finally {
    loginButton.classList.remove("loading"); // Eliminar clase de carga
  }
}

// Función para manejar el registro de nuevos usuarios
async function handleRegister(e) {
  e.preventDefault();

  const password = document.getElementById("register-password").value;

  if (password.length < 6) {
    Swal.fire({
      icon: "error",
      title: "Error de Registro",
      text: "La contraseña debe tener al menos 6 caracteres.",
    });
    return;
  }

  try {
    const response = await api.post("/auth/registro", {
      nombre: document.getElementById("register-name").value,
      email: document.getElementById("register-email").value,
      password: password,
      password_confirmation: document.getElementById(
        "register-password-confirmation"
      ).value,
    });

    if (response.data.estado === "éxito") {
      // Mostrar mensaje de éxito con SweetAlert
      Swal.fire({
        icon: "success",
        title: "Registro Completado",
        text: "¡Registro exitoso! Por favor, inicia sesión.",
      }).then(() => {
        showLoginForm();
      });
    }
  } catch (error) {
    console.error("Register error:", error);
    // Mostrar mensaje de error con SweetAlert
    Swal.fire({
      icon: "error",
      title: "Error de Registro",
      text: error.response?.data?.mensaje || "Error en el registro",
    });
  }
}

// Función para manejar el cierre de sesión
async function handleLogout() {
  try {
    if (token) {
      await api.post("/auth/logout");
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    sessionStorage.removeItem("token");
    token = null;
    currentUser = null;
    api.defaults.headers["Authorization"] = "";
    showLoginForm();
  }
}

// Función para obtener las tareas
async function fetchTasks(page = 1) {
  showSkeletonCards(); // Muestra skeletons antes de la solicitud
  try {
    const response = await api.get(`/tasks?page=${page}`);
    console.log("API Response:", response.data); // Log para verificar la respuesta de la API
    if (response.data && response.data.data) {
      // Verifica que response.data.data exista
      displayTasks(response.data);
    } else {
      elements.taskList.innerHTML =
        '<div class="col-12 text-center">No existen tareas disponibles.</div>';
    }
  } catch (error) {
    console.error("Error fetching tasks:", error);
    if (error.response?.status === 401) {
      handleLogout();
    } else {
      alert("Error loading tasks");
    }
  } finally {
    hideSkeletonCards(); // Oculta skeletons después de la solicitud
  }
}

// Función para manejar el envío del formulario de tareas
async function handleTaskSubmit(e) {
  e.preventDefault();

  // Validar el formulario
  if (!validateTaskForm()) {
    return;
  }

  const taskId = document.getElementById("task-id").value;

  const taskData = {
    title: document.getElementById("task-title").value,
    description: document.getElementById("task-description").value,
    status: document.getElementById("task-status").value,
    due_date: document.getElementById("task-due-date").value,
  };

  try {
    if (taskId) {
      await api.put(`/tasks/${taskId}`, taskData);
    } else {
      await api.post("/tasks", taskData);
    }

    elements.taskModal.hide();
    resetTaskForm();
    await fetchTasks();

    // Mostrar mensaje de éxito con SweetAlert
    Swal.fire({
      icon: "success",
      title: "Tarea guardada",
      text: "La tarea se ha guardado exitosamente",
    });
  } catch (error) {
    console.error("Error saving task:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.response?.data?.mensaje || "Error saving task",
    });
  }
}

// Función para manejar el cierre de sesión
async function handleLogout() {
  try {
    if (token) {
      await api.post("/auth/logout");
    }
  } catch (error) {
    console.error("Logout error:", error);
    Swal.fire({
      icon: "error",
      title: "Error de cierre de sesión",
      text: "Hubo un error al cerrar la sesión",
    });
  } finally {
    sessionStorage.removeItem("token");
    token = null;
    currentUser = null;
    api.defaults.headers["Authorization"] = "";
    showLoginForm();
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
    confirmButtonText: "Sí, eliminarlo!",
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

// Función para manejar errores generales
function handleError(error, title = "Error", message = "Ha ocurrido un error") {
  console.error(title, error);
  Swal.fire({
    icon: "error",
    title: title,
    text: message,
  });
}

// Función para mostrar las tareas
function displayTasks(response) {
  if (!elements.taskList) return;

  const tasks = response.data || [];
  console.log("Tasks:", tasks); // Log para verificar las tareas

  elements.taskList.innerHTML = "";

  if (tasks.length === 0) {
    elements.taskList.innerHTML =
      '<div class="col-12 text-center">No hay tareas disponibles.</div>';
    return;
  }

  tasks.forEach((task) => {
    const taskElement = createTaskElement(task);
    elements.taskList.appendChild(taskElement);
  });

  // Agregar paginación si existe
  if (response.last_page > 1) {
    addPaginationControls(response);
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

  // Validar título
  if (title.length < 3 || title.length > 100) {
    isValid = false;
    errors.title =
      "El título es requerido y debe tener entre 3 y 100 caracteres.";
  }

  // Validar descripción
  if (description.length > 255) {
    isValid = false;
    errors.description =
      "La descripción puede tener un máximo de 255 caracteres.";
  }

  // Validar estado
  const validStatuses = ["pendiente", "en progreso", "completada"];
  if (!validStatuses.includes(status)) {
    isValid = false;
    errors.status =
      "El estado es requerido y debe ser uno de: pendiente, en progreso, completada.";
  }

  // Validar fecha de vencimiento
  if (dueDate && new Date(dueDate) <= new Date()) {
    isValid = false;
    errors.dueDate = "La fecha de vencimiento debe ser una fecha futura.";
  }

  // Mostrar mensajes de error
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

// Función para crear el elemento de tarea
function createTaskElement(task) {
  const div = document.createElement("div");
  div.className = "col-md-4 mb-3";

  const statusClass = getStatusClass(task.status);
  const formattedDueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString()
    : "Sin fecha";
  const formattedCreatedDate = new Date(task.created_at).toLocaleDateString();
  // Mostrar botón de eliminar solo si la tarea está completada
  const deleteButton =
    task.status === "completada"
      ? `<button onclick="deleteTask(${task.id})" class="btn btn-sm btn-danger">
                 <i class="fas fa-trash"></i> Eliminar
             </button>`
      : "";

  div.innerHTML = `
          <div class="card h-100">
              <div class="card-header">
                  <span class="badge ${statusClass}">${task.status}</span>
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
                      <button onclick="editTask(${
                        task.id
                      })" class="btn btn-sm btn-primary">
                          <i class="fas fa-edit"></i> Editar
                      </button>
                      ${deleteButton}
                  </div>
              </div>
          </div>
      `;

  return div;
}

// Función para obtener la clase de estado
function getStatusClass(status) {
  const statusClasses = {
    pendiente: "bg-warning text-dark",
    "en progreso": "bg-info text-white",
    completada: "bg-success text-white",
  };
  return statusClasses[status] || "bg-secondary";
}

// Función para agregar controles de paginación
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
                <a class="page-link" href="#" onclick="fetchTasks(${
                  link.url ? link.url.split("page=")[1] : "1"
                }); return false;">
                    ${link.label
                      .replace("&laquo;", "«")
                      .replace("&raquo;", "»")}
                </a>
            </li>
        `
          )
          .join("")}
    </ul>
  `;
  elements.taskList.appendChild(paginationNav);
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

// Función para mostrar el formulario de login
function showLoginForm() {
  elements.loginDiv?.classList.remove("hidden");
  elements.registerDiv?.classList.add("hidden");
  elements.mainContent?.classList.add("hidden");
  elements.logoutBtn?.classList.add("hidden");
  elements.userInfo?.classList.add("hidden");
  elements.currentDateTime?.classList.add("hidden");
}

// Función para mostrar el contenido principal
function showMainContent() {
  elements.loginDiv?.classList.add("hidden");
  elements.registerDiv?.classList.add("hidden");
  elements.mainContent?.classList.remove("hidden");
  elements.logoutBtn?.classList.remove("hidden");
  elements.userInfo?.classList.remove("hidden");
  elements.currentDateTime?.classList.remove("hidden");
}

// Función para mostrar el formulario de registro
function showRegisterForm() {
  elements.loginDiv?.classList.add("hidden");
  elements.registerDiv?.classList.remove("hidden");
  elements.mainContent?.classList.add("hidden");
}

// Función para resetear el formulario de tareas
function resetTaskForm() {
  elements.taskForm?.reset();
  document.getElementById("task-id").value = "";
}

// Función para escapar caracteres HTML
function escapeHtml(unsafe) {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Inicializar la aplicación
document.addEventListener("DOMContentLoaded", () => {
  // Iniciar actualización de fecha/hora
  updateDateTime();
  setInterval(updateDateTime, 1000);

  // Verificar autenticación
  if (token) {
    checkAuth();
  } else {
    showLoginForm();
  }
});
