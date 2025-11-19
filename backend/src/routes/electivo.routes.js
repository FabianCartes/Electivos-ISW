import { Router } from "express";
import { handleCreateElectivo } from "../controllers/electivo.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js"; 
import { isProfesor } from "../middleware/role.middleware.js"; 

const router = Router();

router.post("/",[authMiddleware,isProfesor,], handleCreateElectivo);

export default router;