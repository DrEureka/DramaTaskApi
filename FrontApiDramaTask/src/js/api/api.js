// Configuración de Axios
const API_BASE_URL = "https://dramataskapi.helioho.st/public/api";
let token = sessionStorage.getItem("token");
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  },
});

// Función para manejar errores generales de la API
function handleError(error, title = "Error", message = "Ha ocurrido un error") {
  console.error(title, error);
  Swal.fire({
    icon: "error",
    title: title,
    text: message,
  });
}
