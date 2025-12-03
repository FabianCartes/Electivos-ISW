import { Router } from "express";
import { 
  handleCreateElectivo, 
  handleGetMyElectivos, 
  handleGetElectivoById, 
  handleUpdateElectivo, 
  handleDeleteElectivo 
} from "../controllers/electivo.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js"; 
import { isProfesor } from "../middleware/role.middleware.js"; 

const router = Router();

// debe estar logueado (authMiddleware)
// debe ser Profesor (isProfesor)
router.use(authMiddleware, isProfesor);


//ENDPOINTS:

// Crear nuevo electivo
router.post("/", handleCreateElectivo);

// Listar todos mis electivos creados
router.get("/", handleGetMyElectivos);

// Obtener detalle de uno específico (útil para el formulario de edición)
router.get("/:id", handleGetElectivoById);

// Editar electivo
router.put("/:id", handleUpdateElectivo);

// Eliminar electivo
router.delete("/:id", handleDeleteElectivo);

export default router;