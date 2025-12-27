import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { isJefeCarrera } from "../middleware/role.middleware.js";
import { handleGetPeriodo, handleSetPeriodo } from "../controllers/periodo.controller.js";

const router = Router();

router.get("/", authMiddleware, handleGetPeriodo);
router.post("/", [authMiddleware, isJefeCarrera], handleSetPeriodo);

export default router;
