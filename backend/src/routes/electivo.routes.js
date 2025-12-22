import { Router } from "express";
import { 
  handleCreateElectivo, 
  handleGetMyElectivos, 
  handleGetElectivoById, 
  handleUpdateElectivo, 
  handleDeleteElectivo,
  handleGetElectivosDisponibles,
  handleGetAllElectivos, 
  handleReviewElectivo   
} from "../controllers/electivo.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js"; 
import { isProfesor, isJefeCarrera } from "../middleware/role.middleware.js"; 

const router = Router();

// 1. Middleware Global: Todos los endpoints requieren estar logueados
router.use(authMiddleware);

// --- RUTA PÚBLICA (Para Alumnos) ---
// Obtener electivos disponibles (APROBADOS)
// No requiere rol específico, solo estar logueado
router.get("/disponibles", handleGetElectivosDisponibles);


// --- RUTAS JEFE DE CARRERA ---
// IMPORTANTE: Definir estas rutas ANTES de las rutas con :id para evitar conflictos

// Listar TODOS los electivos (Pendientes, Aprobados, Rechazados)
router.get("/admin/todos", isJefeCarrera, handleGetAllElectivos);

// Aprobar o Rechazar un electivo
router.patch("/:id/review", isJefeCarrera, handleReviewElectivo);


// --- RUTAS PROFESOR ---
// Todas estas rutas requieren el rol de PROFESOR

// Crear nuevo electivo
router.post("/", isProfesor, handleCreateElectivo);

// Listar solo MIS electivos creados
router.get("/", isProfesor, handleGetMyElectivos);

// Obtener detalle de un electivo propio (por ID)
// NOTA: Esta ruta captura cualquier cosa como /123, por eso va al final de los GETs
router.get("/:id", isProfesor, handleGetElectivoById);

// Editar mi electivo
router.put("/:id", isProfesor, handleUpdateElectivo);

// Eliminar mi electivo
router.delete("/:id", isProfesor, handleDeleteElectivo);

export default router;