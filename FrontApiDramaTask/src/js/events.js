// Agregar listeners de eventos globales
document.addEventListener("DOMContentLoaded", () => {
  updateDateTime();
  setInterval(updateDateTime, 1000);

  if (token) {
    checkAuth();
  } else {
    showLoginForm();
  }
});

elements.loginForm?.addEventListener("submit", handleLogin);
elements.registerForm?.addEventListener("submit", handleRegister);
elements.searchForm?.addEventListener("submit", handleSearch);
elements.taskForm?.addEventListener("submit", handleTaskSubmit);
elements.logoutBtn?.addEventListener("click", handleLogout);
elements.registerLink?.addEventListener("click", () => showRegisterForm());
elements.loginLink?.addEventListener("click", () => showLoginForm());

// Botón de filtrar por estado
const statusFilter = document.getElementById("status-filter");
if (statusFilter) {
  statusFilter.addEventListener("change", handleStatusFilter);
}

// Formulario para cambiar estado de la tarea
const statusForm = document.getElementById("status-form");
if (statusForm) {
  statusForm.addEventListener("submit", updateTaskStatus);
}

// Botón de limpiar búsqueda
document.getElementById("clear-search").addEventListener("click", clearSearch);

// Campo de búsqueda para mostrar el botón de limpiar
document.getElementById("search-input").addEventListener("input", function () {
  const clearSearchButton = document.getElementById("clear-search");
  if (this.value.trim() !== "") {
    clearSearchButton.style.display = "block";
  } else {
    clearSearchButton.style.display = "none";
  }
});

// Botón para ordenar tareas
document.getElementById("sort-button").addEventListener("click", () => {
  sortOrder = sortOrder === "asc" ? "desc" : "asc";
  if (currentResponse) {
    displayTasks(currentResponse, true);
  }
  updateSortButtonIcon();
});
