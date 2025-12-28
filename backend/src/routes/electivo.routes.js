import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { 
  handleCreateElectivo, 
  handleGetMyElectivos, 
  handleGetElectivoById, 
  handleUpdateElectivo, 
  handleDeleteElectivo,
  handleDescargarSyllabus,
  handleGetAllElectivosAdmin,
  handleManageElectivoStatus,
  handleGetElectivosDisponibles
} from "../controllers/electivo.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js"; 
import { isProfesor, isJefeCarrera } from "../middleware/role.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Configurar MULTER para manejar el pdf usando diskStorage en lugar de memoryStorage
// Esto reduce el consumo de memoria cuando hay múltiples uploads concurrentes
const storage = multer.diskStorage({
  // Carpeta donde se guardarán temporalmente los archivos antes de procesarlos
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/temp'));
  },
  // Generar un nombre de archivo único para evitar colisiones
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Máximo 10MB
  fileFilter: (req, file, cb) => {
    // Solo acepta PDF
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'), false);
    }
  },
});

// ENDPOINTS:

// Crear nuevo electivo
// Autenticar y autorizar ANTES de procesar el archivo para evitar uploads no autorizados
router.post("/", authMiddleware, isProfesor, upload.single('syllabusPDF'), handleCreateElectivo);

// Listar todos mis electivos creados
router.get("/", authMiddleware, isProfesor, handleGetMyElectivos);

// Listar solicitudes de electivos (solo Jefe de Carrera, filtrado por su carrera)
router.get("/all", authMiddleware, isJefeCarrera, handleGetAllElectivosAdmin);

// IMPORTANTE: Solo usa 'authMiddleware', NO uses 'isProfesor'
router.get("/disponibles", authMiddleware, handleGetElectivosDisponibles);

// Usamos PATCH porque solo modificamos una parte del recurso
// Cambiar estado de electivo (solo JEFE_CARRERA)
router.patch("/:id/status", [authMiddleware, isJefeCarrera], handleManageElectivoStatus);

// Ruta para descargar el Programa del Electivo (PDF) (acceso para cualquier usuario autenticado)
router.get("/:id/descargar-syllabus", authMiddleware, handleDescargarSyllabus);

// Obtener detalle de uno específico (útil para el formulario de edición)
router.get("/:id", authMiddleware, isProfesor, handleGetElectivoById);

// Editar electivo
// Autenticar y autorizar ANTES de procesar el archivo
router.put("/:id", authMiddleware, isProfesor, upload.single('syllabusPDF'), handleUpdateElectivo);

// Eliminar electivo (solo Jefe de Carrera)
router.delete("/:id", authMiddleware, isJefeCarrera, handleDeleteElectivo);

export default router;