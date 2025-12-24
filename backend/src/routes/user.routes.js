import { Router } from "express";
import { handleGetProfesores, handleGetUsersByRole } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/profesores", authMiddleware, handleGetProfesores);
router.get("/rol/:role", authMiddleware, handleGetUsersByRole);

export default router;
