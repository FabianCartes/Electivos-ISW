import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { isAlumno, isJefeCarrera } from "../middleware/role.middleware.js";
import {
  handleCreateInscripcion,
  handleGetInscripciones,
  handleGetTodasInscripciones,
  handleAprobarInscripcion,
  handleRechazarInscripcion,
} from "../controllers/inscripcion.controller.js";

const router = Router();

router.post("/", [authMiddleware, isAlumno], handleCreateInscripcion);
router.get("/", [authMiddleware, isJefeCarrera], handleGetInscripciones);
// listar TODAS las inscripciones (jefe de carrera)
router.get("/todas", [authMiddleware, isJefeCarrera], handleGetTodasInscripciones);
// cambiar estado de una inscripción (jefe de carrera)
router.patch(
  "/:id/aprobar",
  [authMiddleware, isJefeCarrera],
  handleAprobarInscripcion
);
router.patch(
  "/:id/rechazar",
  [authMiddleware, isJefeCarrera],
  handleRechazarInscripcion
);

export default router;