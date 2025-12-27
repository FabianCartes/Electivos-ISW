import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { isAlumno, isJefeCarrera, isProfesor } from "../middleware/role.middleware.js";
import {
  handleCreateInscripcion,
  handleGetInscripciones,
  handleGetInscripcionesPorElectivo,
  handleGetMisInscripciones,
  handleChangeInscripcionStatus
} from "../controllers/inscripcion.controller.js";

const router = Router();

// Rutas Alumno
//Corchetes crean arreglo de middlewares, se ejecutan antes que el controlador
router.post("/", [authMiddleware, isAlumno], handleCreateInscripcion);
router.get("/mis-inscripciones", [authMiddleware, isAlumno], handleGetMisInscripciones);
// Otras rutas
router.get("/", [authMiddleware, isJefeCarrera], handleGetInscripciones);
router.get("/electivo/:electivoId", [authMiddleware, isProfesor], handleGetInscripcionesPorElectivo);

// Cambiar estado de inscripción (JEFE_CARRERA)
router.patch("/:id/status", [authMiddleware, isJefeCarrera], handleChangeInscripcionStatus);

export default router;