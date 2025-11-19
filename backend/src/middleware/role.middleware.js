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
    next();
  } else {
    return handleErrorClient(
      res, 
      403,
      "Acceso denegado. Se requieren permisos de JEFE DE CARRERA."
    );
  }
};

// ... (puedes añadir 'isAlumno' si lo necesitas)