import { handleErrorClient } from "../Handlers/responseHandlers.js";

/**
 * Middleware para verificar si el usuario tiene el rol de PROFESOR.
 * Debe usarse DESPUÉS de 'authMiddleware'.
 */
export const isProfesor = (req, res, next) => {
  
  console.log("Datos del usuario (isProfesor):", req.user);
  if (req.user && req.user.role === "PROFESOR") {
    // El usuario es profesor, puede continuar
    next();
  } else {
    return handleErrorClient(res,403,"Acceso denegado. Se requieren permisos de PROFESOR.");
  }
};

/**
 * Middleware para verificar si el usuario es JEFE_CARRERA (Ejemplo a futuro)
 */
export const isJefeCarrera = (req, res, next) => {
  if (req.user && req.user.role === "JEFE_CARRERA") {
    // Validar que el Jefe tenga carrera asignada
    if (!req.user.carrera || String(req.user.carrera).trim().length === 0) {
      return handleErrorClient(res, 400, "Tu perfil de Jefe de Carrera no tiene una carrera asignada.");
    }
    next();
  } else {
    return handleErrorClient(
      res, 
      403,
      "Acceso denegado. Se requieren permisos de JEFE DE CARRERA."
    );
  }
};
export const isAlumno = (req, res, next) => {
  if (req.user && req.user.role === "ALUMNO") {
    next();
  } else {
    return handleErrorClient(
      res, 
      403,
      "Acceso denegado. Se requieren permisos de ALUMNO."
    );
  }
};
// ... (puedes añadir 'isAlumno' si lo necesitas)