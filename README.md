# 🎓 Sistema de Inscripción y Gestión de Electivos (SIGE) - UBB

> Plataforma web integral para la administración, postulación y gestión de asignaturas electivas de la carrera de Ingeniería Civil en Informática de la Universidad del Bío-Bío.

![Estado del Proyecto](https://img.shields.io/badge/Estado-En_Desarrollo-yellow)
![Stack](https://img.shields.io/badge/Stack-PERN-blue)
![Licencia](https://img.shields.io/badge/Licencia-Privada-red)

## 📖 Descripción

Este proyecto nace ante la necesidad de modernizar la gestión de electivos en la Facultad de Ciencias Empresariales (FACE). [cite_start]Actualmente, el proceso presenta desafíos como asignaciones confusas, falta de notificaciones y rigidez en los cupos por carrera[cite: 48, 58].

[cite_start]**SIGE** es una solución web que centraliza el ciclo de vida de los electivos, permitiendo a los docentes proponer asignaturas, a los alumnos inscribirse mediante un sistema de prioridades y a los jefes de carrera gestionar la oferta académica de manera transparente y eficiente[cite: 49, 74].

## 🚀 Funcionalidades Principales

[cite_start]El sistema gestiona tres roles principales con funciones específicas[cite: 77]:

### 👨‍🎓 Alumnos
* [cite_start]**Inscripción por Prioridad:** Selección de asignaturas en orden de preferencia ($1^a, 2^a, 3^a$ prioridad)[cite: 117].
* [cite_start]**Visualización de Oferta:** Acceso a detalles del curso, horarios, cupos y descarga de Syllabus (PDF)[cite: 108, 139].
* [cite_start]**Notificaciones:** Alertas en tiempo real sobre el estado de su solicitud (Aceptada/Rechazada)[cite: 84].

### 👨‍🏫 Profesores
* [cite_start]**Propuesta de Electivos:** Creación y edición de asignaturas, definiendo cupos, horarios y requisitos[cite: 115].
* [cite_start]**Gestión de Syllabus:** Carga de programas de asignatura en formato PDF[cite: 661].
* [cite_start]**Nómina de Alumnos:** Visualización y descarga del listado de estudiantes inscritos[cite: 128].

### 👔 Jefe de Carrera (Admin)
* [cite_start]**Validación:** Aprobación o rechazo de propuestas de electivos y solicitudes de inscripción[cite: 123].
* [cite_start]**Gestión de Periodos:** Configuración de fechas de inicio y fin para los procesos de inscripción[cite: 129].
* [cite_start]**Segmentación de Cupos:** Control de vacantes específicas por carrera para evitar que alumnos externos ocupen cupos reservados[cite: 81].

## 🛠️ Stack Tecnológico

[cite_start]El proyecto está construido sobre una arquitectura **PERN** (PostgreSQL, Express, React, Node.js)[cite: 643].

### Backend
* **Runtime:** Node.js
* [cite_start]**Framework:** Express.js [cite: 644]
* [cite_start]**Base de Datos:** PostgreSQL [cite: 644]
* [cite_start]**ORM:** TypeORM (Manejo de entidades y relaciones) [cite: 659]
* [cite_start]**Autenticación:** JWT (JSON Web Tokens) & Bcrypt (Hashing) [cite: 652, 656]
* [cite_start]**Manejo de Archivos:** Multer (Subida de Syllabus PDF) [cite: 660]
* [cite_start]**Emails:** Nodemailer (Notificaciones automáticas) [cite: 662]

### Frontend
* [cite_start]**Framework:** React [cite: 644]
* [cite_start]**Build Tool:** Vite [cite: 673]
* [cite_start]**Estilos:** Tailwind CSS (Diseño responsivo y moderno) [cite: 663]
* [cite_start]**Cliente HTTP:** Axios [cite: 672]

## 📂 Estructura del Proyecto

[cite_start]La estructura del código sigue una separación clara de responsabilidades[cite: 681, 728]:

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
