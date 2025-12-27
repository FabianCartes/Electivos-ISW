import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { isJefeCarrera } from "../middleware/role.middleware.js";
import {
  handleSendEmailToUser,
  handleSendEmailToRole,
  handleSendEmailToAlumnosByCarrera,
} from "../controllers/notification.controller.js";

const router = Router();

// Enviar correo a un usuario específico por id
router.post("/user", [authMiddleware, isJefeCarrera], handleSendEmailToUser);

// Enviar correos a todos los usuarios de un rol (ALUMNO, PROFESOR, JEFE_CARRERA)
router.post("/role", [authMiddleware, isJefeCarrera], handleSendEmailToRole);

// Enviar correos a todos los alumnos de una carrera
router.post("/alumnos-carrera", [authMiddleware, isJefeCarrera], handleSendEmailToAlumnosByCarrera);

export default router;
