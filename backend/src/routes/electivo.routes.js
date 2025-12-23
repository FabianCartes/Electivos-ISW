import { Router } from "express";
import multer from "multer";
import { 
  handleCreateElectivo, 
  handleGetMyElectivos, 
  handleGetElectivoById, 
  handleUpdateElectivo, 
  handleDeleteElectivo,
  handleDescargarSyllabus
} from "../controllers/electivo.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js"; 
import { isProfesor } from "../middleware/role.middleware.js"; 

const router = Router();

//configurar MULTER para manejar el pdf
const upload = multer({
  storage: multer.memoryStorage(), // Guarda en memoria, no en disco
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
router.post("/", upload.single('syllabusPDF'), authMiddleware, isProfesor, handleCreateElectivo);

// Listar todos mis electivos creados
router.get("/", authMiddleware, isProfesor, handleGetMyElectivos);

// Ruta para descargar el syllabus PDF de un electivo
router.get("/:id/descargar-syllabus", authMiddleware, isProfesor, handleDescargarSyllabus);

// Obtener detalle de uno específico (útil para el formulario de edición)
router.get("/:id", authMiddleware, isProfesor, handleGetElectivoById);

// Editar electivo
router.put("/:id", upload.single('syllabusPDF'), authMiddleware, isProfesor, handleUpdateElectivo);

// Eliminar electivo
router.delete("/:id", authMiddleware, isProfesor, handleDeleteElectivo);

export default router;