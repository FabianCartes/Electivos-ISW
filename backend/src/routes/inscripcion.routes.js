import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { isAlumno, isJefeCarrera, isProfesor } from "../middleware/role.middleware.js";
import {
  handleCreateInscripcion,
  handleGetInscripciones,
  handleGetInscripcionesPorElectivo,
  handleGetMisInscripciones 
} from "../controllers/inscripcion.controller.js";

const router = Router();

// Rutas
router.post("/", [authMiddleware, isAlumno], handleCreateInscripcion);


router.get("/mis-inscripciones", [authMiddleware, isAlumno], handleGetMisInscripciones);

// Otras rutas
router.get("/", [authMiddleware, isJefeCarrera], handleGetInscripciones);
router.get("/electivo/:electivoId", [authMiddleware, isProfesor], handleGetInscripcionesPorElectivo);

export default router;