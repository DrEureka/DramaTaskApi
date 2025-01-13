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

// Función para mostrar contenido principal
function showMainContent() {
  elements.loginDiv?.classList.add("hidden");
  elements.registerDiv?.classList.add("hidden");
  elements.mainContent?.classList.remove("hidden");
  elements.logoutBtn?.classList.remove("hidden");
  elements.userInfo?.classList.remove("hidden");
  elements.currentDateTime?.classList.remove("hidden");
}

// Función para mostrar formulario de login
function showLoginForm() {
  elements.loginDiv?.classList.remove("hidden");
  elements.registerDiv?.classList.add("hidden");
  elements.mainContent?.classList.add("hidden");
  elements.logoutBtn?.classList.add("hidden");
  elements.userInfo?.classList.add("hidden");
  elements.currentDateTime?.classList.add("hidden");
}

// Función para mostrar formulario de registro
function showRegisterForm() {
  elements.loginDiv?.classList.add("hidden");
  elements.registerDiv?.classList.remove("hidden");
  elements.mainContent?.classList.add("hidden");
}

// Función para actualizar fecha/hora
function updateDateTime() {
  const now = new Date();
  if (elements.currentDateTime) {
    elements.currentDateTime.textContent = `Time (UTC): ${now
      .toISOString()
      .replace("T", " ")
      .slice(0, 19)}`;
  }
}

// Restablecer formulario de tareas
function resetTaskForm() {
  elements.taskForm?.reset();
  document.getElementById("task-id").value = "";
}
