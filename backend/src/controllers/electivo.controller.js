import { 
  createElectivo, 
  getElectivosByProfesor, 
  getElectivoById, 
  updateElectivo, 
  deleteElectivo,
  descargarSyllabus
} from "../services/electivo.service.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

// --- CREAR UN NUEVO ELECTIVO ---
export const handleCreateElectivo = async (req, res) => {
  try {
    const { codigoElectivo, titulo, sala, observaciones, requisitos, ayudante, anio, semestre, cuposList, horarios } = req.body;

    const profesorId = req.user.sub;

    if (!profesorId) {
      return handleErrorClient(res, 401, "No autorizado. ID de usuario no encontrado en el token.");
    }

    if (!codigoElectivo || !titulo || !sala || !requisitos) {
        return handleErrorClient(res, 400, "Faltan datos obligatorios.");
    }

    // Parsear JSON strings
    let parsedCuposList = [];
    let parsedHorarios = [];
    
    try {
        parsedCuposList = JSON.parse(cuposList);
        parsedHorarios = JSON.parse(horarios);
    } catch (err) {
        return handleErrorClient(res, 400, "Formato inválido en cuposList o horarios.");
    }

    if (!parsedCuposList || !Array.isArray(parsedCuposList) || parsedCuposList.length === 0) {
        return handleErrorClient(res, 400, "Debes asignar cupos al menos a una carrera.");
    }

    if (!parsedHorarios || !Array.isArray(parsedHorarios) || parsedHorarios.length === 0) {
        return handleErrorClient(res, 400, "Debes agregar al menos un horario.");
    }

    if (!req.file) {
        return handleErrorClient(res, 400, "El syllabus PDF es obligatorio.");
    }

    const syllabusPDF = req.file.buffer;
    const syllabusNombre = req.file.originalname;

    const electivoData = {
        codigoElectivo: parseInt(codigoElectivo),
        titulo,
        sala,
        observaciones,
        anio: parseInt(anio),
        semestre: parseInt(semestre),
        cuposList: parsedCuposList,
        requisitos,
        ayudante,
        horarios: parsedHorarios
    };

    const nuevoElectivo = await createElectivo(electivoData, profesorId, syllabusPDF, syllabusNombre);

    handleSuccess(res, 201, "Electivo creado exitosamente y pendiente de aprobación.", { electivo: nuevoElectivo });

  } catch (error) {
    const statusCode = error.status || 500;
    if (statusCode < 500) {
        return handleErrorClient(res, statusCode, error.message);
    } else {
        return handleErrorServer(res, 500, error.message);
    }
  }
};

// --- LISTAR MIS ELECTIVOS (Solo los del profesor logueado) ---
export const handleGetMyElectivos = async (req, res) => {
  try {
    const profesorId = req.user.sub;
    const electivos = await getElectivosByProfesor(profesorId);
    handleSuccess(res, 200, "Lista de electivos obtenida", electivos);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
};

// --- OBTENER UN ELECTIVO POR ID (Para cargar datos al editar) ---
export const handleGetElectivoById = async (req, res) => {
  try {
    const { id } = req.params;
    const profesorId = req.user.sub;
    
    const electivo = await getElectivoById(id, profesorId);
    handleSuccess(res, 200, "Detalle del electivo", electivo);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
};

// --- ACTUALIZAR UN ELECTIVO ---
export const handleUpdateElectivo = async (req, res) => {
  try {
    const { id } = req.params;
    const profesorId = req.user.sub;
    const { codigoElectivo, titulo, sala, observaciones, requisitos, ayudante, anio, semestre, cuposList, horarios } = req.body;
    
    // En un UPDATE, el PDF es OPCIONAL (solo si quiere cambiarlo)
    let syllabusPDF = null;
    let syllabusNombre = null;
    
    if (req.file) {
        syllabusPDF = req.file.buffer;
        syllabusNombre = req.file.originalname;
    }

    const data = { 
        codigoElectivo: codigoElectivo ? parseInt(codigoElectivo) : undefined,
        titulo,
        sala,
        observaciones,
        anio: anio ? parseInt(anio) : undefined,
        semestre: semestre ? parseInt(semestre) : undefined,
        requisitos, 
        ayudante,
        cuposList: cuposList ? JSON.parse(cuposList) : undefined,
        horarios: horarios ? JSON.parse(horarios) : undefined
    };
    
    const actualizado = await updateElectivo(id, data, profesorId, syllabusPDF, syllabusNombre);
    handleSuccess(res, 200, "Electivo actualizado exitosamente", actualizado);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
};

// --- ELIMINAR UN ELECTIVO ---
export const handleDeleteElectivo = async (req, res) => {
  try {
    const { id } = req.params;
    const profesorId = req.user.sub;
    
    await deleteElectivo(id, profesorId);
    handleSuccess(res, 200, "Electivo eliminado exitosamente");
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
};

// --- descargar syllabus pdf ---
export const handleDescargarSyllabus = async (req, res) => {
  try {
    const { id } = req.params;

    const { syllabusPDF, syllabusNombre } = await descargarSyllabus(id);

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${syllabusNombre}"`);

    // Enviar el PDF como bytes
    res.send(syllabusPDF);

  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "Error al descargar syllabus";
    res.status(status).json({ message });
  }
};