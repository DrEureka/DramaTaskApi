// Script para mostrar/ocultar contraseña en el formulario de registro
document
  .getElementById("show-password-register")
  .addEventListener("change", function () {
    const passwordField = document.getElementById("register-password");
    const confirmPasswordField = document.getElementById(
      "register-password-confirmation"
    );

    if (this.checked) {
      passwordField.type = "text";
      confirmPasswordField.type = "text";
    } else {
      passwordField.type = "password";
      confirmPasswordField.type = "password";
    }
  });
