import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { isAlumno, isJefeCarrera } from "../middleware/role.middleware.js";
import {
  handleCreateInscripcion,
  handleGetInscripciones,
  handleGetMisInscripciones
} from "../controllers/inscripcion.controller.js";

const router = Router();

router.post("/", [authMiddleware, isAlumno], handleCreateInscripcion);
router.get("/", [authMiddleware, isJefeCarrera], handleGetInscripciones);
router.get("/mis-inscripciones", [authMiddleware, isAlumno], handleGetMisInscripciones);

export default router;