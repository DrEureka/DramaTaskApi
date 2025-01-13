// Modal de estado
const statusModal = new bootstrap.Modal(document.getElementById("statusModal"));

function openStatusModal(taskId, currentStatus) {
  const statusSelect = document.getElementById("status-select");
  const statusTaskId = document.getElementById("status-task-id");

  if (statusSelect && statusTaskId) {
    statusTaskId.value = taskId;
    statusSelect.value = currentStatus;

    const statusModal = new bootstrap.Modal(
      document.getElementById("statusModal")
    );
    statusModal.show();
  }
}

async function updateTaskStatus(e) {
  e.preventDefault();
  const taskId = document.getElementById("status-task-id").value;
  const submitButton = e.target.querySelector('button[type="submit"]');
  const originalText = submitButton.innerHTML;

  try {
    submitButton.disabled = true;
    submitButton.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';

    const currentTaskResponse = await api.get(`/tasks/${taskId}`);
    const currentTask = currentTaskResponse.data;
    const updateData = {
      title: currentTask.title,
      description: currentTask.description || "",
      status: document.getElementById("status-select").value,
      due_date: currentTask.due_date ? currentTask.due_date.slice(0, 16) : null,
    };

    const response = await api.put(`/tasks/${taskId}`, updateData);
    if (response.data) {
      const statusModal = bootstrap.Modal.getInstance(
        document.getElementById("statusModal")
      );
      statusModal.hide();
      await fetchTasks();
      Swal.fire({
        icon: "success",
        title: "Estado Actualizado",
        text: "El estado de la tarea ha sido actualizado exitosamente",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  } catch (error) {
    console.error("Error updating status:", error);
    Swal.fire({
      icon: "error",
      title: "Error al actualizar el estado",
      text:
        error.response?.data?.mensaje ||
        "Hubo un error al actualizar el estado de la tarea",
    });
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalText;
  }
}
