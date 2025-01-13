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

  showSkeletonCards();

  try {
    const response = await api.get(
      `/tasks?search=${encodeURIComponent(searchTerm)}`
    );
    if (response.data && response.data.data) {
      displayTasks(response.data);
      document.getElementById("clear-search").style.display = "block";
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
    hideSkeletonCards();
  }
}

// Función para limpiar la búsqueda
async function clearSearch() {
  document.getElementById("search-input").value = "";
  document.getElementById("clear-search").style.display = "none";
  await fetchTasks();
}

// Función para manejar el cambio en el filtro de estado
function handleStatusFilter(e) {
  const statusFilter = e.target.value;
  fetchTasks(1, sortOrder, statusFilter);
}

// Función para actualizar el ícono del botón de ordenamiento
function updateSortButtonIcon() {
  const sortButtonIcon = document.querySelector("#sort-button i");
  if (sortOrder === "asc") {
    sortButtonIcon.classList.remove("fa-sort-down");
    sortButtonIcon.classList.add("fa-sort-up");
  } else {
    sortButtonIcon.classList.remove("fa-sort-up");
    sortButtonIcon.classList.add("fa-sort-down");
  }
}

// Función para filtrar tareas según el estado
function filterTasks(tasks, statusFilter) {
  if (statusFilter === "todos") {
    return tasks;
  }
  return tasks.filter((task) => task.status === statusFilter);
}
