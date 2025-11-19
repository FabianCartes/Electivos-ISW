import { Router } from "express";
import { login, logout } from "../controllers/auth.controller.js"; 

const router = Router();

// Ruta para iniciar sesión (Recibe RUT y Pass)
router.post("/login", login);

// Ruta para cerrar sesión (Destruye la cookie)
router.post("/logout", logout);

export default router;