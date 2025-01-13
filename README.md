# Sistema de Gestión de Tareas - Laravel & Front-End Dinámico

Sistema de gestión de tareas que proporciona una API RESTful con Laravel y una interfaz de usuario dinámica.

## 🚀 Características

- API RESTful completa para gestión de tareas
- Autenticación JWT
- Interfaz de usuario dinámica (SPA)
- Validaciones tanto en frontend como backend
- Sistema de filtrado y búsqueda de tareas
- Manejo de estados de tareas (pendiente, en progreso, completada)

## 📋 Rutas del Backend

**Autenticación:**
- `POST /api/auth/registro`: nombre, email, password, password_confirmation
- `POST /api/auth/login`: email, password
- `POST /api/auth/logout`: (Solo encabezado de autorización)
- `POST /api/auth/refresh`: (Solo encabezado de autorización)
- `GET /api/auth/perfil`: (Solo encabezado de autorización)
- `GET /api/auth/email/verify/{id}/{hash}`: (Solo encabezado de autorización)
- `POST /api/auth/password/reset`: email

**Tareas:**
- `GET /api/tasks`: (Solo encabezado de autorización)
- `GET /api/tasks/{id}`: (Solo encabezado de autorización)
- `POST /api/tasks`: title, description, status, due_date
- `PUT /api/tasks/{id}`: title, description, status, due_date
- `PATCH /api/tasks/{id}`: Cualquier campo que desees actualizar parcialmente
- `DELETE /api/tasks/{id}`: (Solo encabezado de autorización)

## 🛠️ Tecnologías

**Backend:**
- Laravel 10.x
- PHP 8.1+
- MySQL/PostgreSQL
- JWT Authentication

**Frontend:**
- URL: [https://dramatask.helioho.st/](https://dramatask.helioho.st/)
- HTML5
- CSS3
- JavaScript
- Fetch/Axios para consumo de API

## 📚 Uso

**Registro e Inicio de Sesión:**
- Regístrate con tu nombre, correo electrónico y contraseña.
- Inicia sesión con las credenciales registradas.

**Gestión de Tareas:**
- Agrega nuevas tareas con título, descripción, estado y fecha de vencimiento.
- Edita las tareas existentes.
- Elimina tareas completadas.
- Busca tareas por palabras clave.

## 📋 Requisitos Previos

- PHP >= 8.1
- Composer
- Node.js y npm
- MySQL/PostgreSQL
- Git

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](https://github.com/DrEureka/DramaTaskApi/blob/Main/LICENSE) para más detalles.

## ✨ Créditos

Desarrollado por Dramadan.
