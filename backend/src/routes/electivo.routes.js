import { Router } from "express";
import { 
  handleCreateElectivo, 
  handleGetMyElectivos, 
  handleGetElectivoById, 
  handleUpdateElectivo, 
  handleDeleteElectivo,
  handleGetElectivosDisponibles
} from "../controllers/electivo.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js"; 
import { isProfesor } from "../middleware/role.middleware.js"; 

const router = Router();

// IMPORTANTE: Las rutas específicas (como /disponibles) deben estar ANTES de las rutas con parámetros (como /:id)
// porque Express evalúa las rutas en orden y /:id capturaría /disponibles

// RUTA PARA ALUMNOS (solo requiere autenticación, NO requiere ser profesor)
// GET /api/electivos/disponibles - Obtener electivos disponibles (APROBADOS y PENDIENTES)
router.get("/disponibles", authMiddleware, handleGetElectivosDisponibles);

// A partir de aquí, todas las rutas requieren ser PROFESOR
// debe estar logueado (authMiddleware)
// debe ser Profesor (isProfesor)
router.use(authMiddleware, isProfesor);

//ENDPOINTS PARA PROFESORES:

// Crear nuevo electivo
router.post("/", handleCreateElectivo);

// Listar todos mis electivos creados (debe estar DESPUÉS de /disponibles para no capturarla)
router.get("/", handleGetMyElectivos);

// Obtener detalle de uno específico (útil para el formulario de edición)
// IMPORTANTE: Esta ruta con :id debe estar AL FINAL para no capturar rutas específicas como /disponibles
router.get("/:id", handleGetElectivoById);

// Editar electivo
router.put("/:id", handleUpdateElectivo);

// Eliminar electivo
router.delete("/:id", handleDeleteElectivo);

export default router;