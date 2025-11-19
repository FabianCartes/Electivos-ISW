import { Router } from "express";
import { login, logout } from "../controllers/auth.controller.js"; 

const router = Router();

// ruta para iniciar sesion (Recibe rut y pass)
router.post("/login", login);

// ruta para cerrar sesion (destruye la cookie)
router.post("/logout", logout);

export default router;