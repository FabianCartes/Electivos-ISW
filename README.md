# 🎓 Sistema de Inscripción y Gestión de Electivos (SIGE) - UBB

> Plataforma web integral para la administración, postulación y gestión de asignaturas electivas de la carrera de Ingeniería Civil en Informática de la Universidad del Bío-Bío.

![Estado del Proyecto](https://img.shields.io/badge/Estado-En_Desarrollo-yellow)
![Stack](https://img.shields.io/badge/Stack-PERN-blue)
![Licencia](https://img.shields.io/badge/Licencia-Privada-red)

## 📖 Descripción

Este proyecto nace ante la necesidad de modernizar la gestión de electivos en la Facultad de Ciencias Empresariales (FACE). Actualmente, el proceso presenta desafíos como asignaciones confusas, falta de notificaciones y rigidez en los cupos por carrera.

**SIGE** es una solución web que centraliza el ciclo de vida de los electivos, permitiendo a los docentes proponer asignaturas, a los alumnos inscribirse mediante un sistema de prioridades y a los jefes de carrera gestionar la oferta académica de manera transparente y eficiente.

## 🚀 Funcionalidades Principales

El sistema gestiona tres roles principales con funciones específicas:

### 👨‍🎓 Alumnos
* **Inscripción por Prioridad:** Selección de asignaturas en orden de preferencia (1ª, 2ª y 3ª prioridad).
* **Visualización de Oferta:** Acceso a detalles del curso, horarios, cupos y descarga de Syllabus (PDF).
* **Notificaciones:** Alertas en tiempo real sobre el estado de su solicitud (Aceptada/Rechazada) y cambios en la carga académica.

### 👨‍🏫 Profesores
* **Propuesta de Electivos:** Creación y edición de asignaturas, definiendo cupos, horarios y requisitos.
* **Gestión de Syllabus:** Carga de programas de asignatura en formato PDF.
* **Nómina de Alumnos:** Visualización y descarga del listado de estudiantes inscritos en sus cursos.

### 👔 Jefe de Carrera (Admin)
* **Validación:** Aprobación o rechazo de propuestas de electivos y solicitudes de inscripción.
* **Gestión de Periodos:** Configuración de fechas de inicio y fin para los procesos de inscripción.
* **Segmentación de Cupos:** Control de vacantes específicas por carrera para evitar que alumnos externos ocupen cupos reservados.

## 🛠️ Stack Tecnológico

El proyecto está construido sobre una arquitectura **PERN** (PostgreSQL, Express, React, Node.js).

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **Base de Datos:** PostgreSQL
* **ORM:** TypeORM (Manejo de entidades y relaciones)
* **Autenticación:** JWT (JSON Web Tokens) & Bcrypt (Hashing)
* **Manejo de Archivos:** Multer (Subida de Syllabus PDF)
* **Emails:** Nodemailer (Notificaciones automáticas)

### Frontend
* **Framework:** React
* **Build Tool:** Vite
* **Estilos:** Tailwind CSS (Diseño responsivo y moderno)
* **Cliente HTTP:** Axios

## 📂 Estructura del Proyecto

La estructura del código sigue una separación clara de responsabilidades:

```bash
ELECTIVOS-ISW/
├── backend/
│   ├── src/
│   │   ├── config/       # Configuración de BD y variables
│   │   ├── controllers/  # Lógica de entrada/salida
│   │   ├── entities/     # Modelos TypeORM (User, Electivo, etc.)
│   │   ├── routes/       # Definición de endpoints API
│   │   ├── services/     # Lógica de negocio
│   │   └── validations/  # Validaciones de datos
│   └── uploads/          # Almacenamiento de Syllabus
│
└── frontend/
    ├── src/
    │   ├── components/   # Componentes reutilizables (Botones, Cards)
    │   ├── pages/        # Vistas por Rol (Alumno, Profe, Jefe)
    │   ├── services/     # Conexión con la API (Axios)
    │   └── context/      # Estado global (Auth)
