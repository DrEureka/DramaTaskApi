let currentUser = null;

// Función para manejar el inicio de sesión
async function handleLogin(e) {
  e.preventDefault();
  const loginButton = document.getElementById("login-button");
  loginButton.classList.add("loading");

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
    Swal.fire({
      icon: "error",
      title: "Verifique sus credenciales e inténtelo de nuevo",
      text: error.response?.data?.mensaje || "Error de autenticación",
    });
  } finally {
    loginButton.classList.remove("loading");
  }
}

// Manejar traducciones de errores de registro (si deseas reutilizarlas en otros módulos)
const errorTranslations = {
  "The password field confirmation does not match.":
    "La confirmación de la contraseña no coincide.",
  "The email has already been taken.":
    "El correo electrónico ya ha sido registrado.",
};

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

  const registerButton = e.target.querySelector('button[type="submit"]');
  const originalText = registerButton.innerHTML;

  try {
    registerButton.disabled = true;
    registerButton.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registrando...';

    const response = await api.post("/auth/registro", {
      nombre: document.getElementById("register-name").value,
      email: document.getElementById("register-email").value,
      password: password,
      password_confirmation: document.getElementById(
        "register-password-confirmation"
      ).value,
    });

    if (response.data.estado === "éxito") {
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
    if (error.response && error.response.data && error.response.data.errores) {
      const errores = error.response.data.errores;
      const mensajes = Object.values(errores)
        .flat()
        .map((msg) => errorTranslations[msg] || msg)
        .join("\n");
      Swal.fire({
        icon: "error",
        title: "Error de Registro",
        text: mensajes,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error de Registro",
        text: error.response?.data?.mensaje || "Error en el registro",
      });
    }
  } finally {
    registerButton.disabled = false;
    registerButton.innerHTML = originalText;
  }
}

// Función para verificar autenticación
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

// Función para actualizar información del usuario
function updateUserInfo(user) {
  currentUser = user;
  const userInfoElem = document.querySelector(".username");
  if (userInfoElem) {
    userInfoElem.textContent = `User: ${user.nombre}`;
  }
}
