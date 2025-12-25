import { Router } from "express";
import { handleGetProfesores, handleGetUsersByRole, handleGetCarreras } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/profesores", authMiddleware, handleGetProfesores);
router.get("/rol/:role", authMiddleware, handleGetUsersByRole);
router.get("/carreras", authMiddleware, handleGetCarreras);

export default router;
