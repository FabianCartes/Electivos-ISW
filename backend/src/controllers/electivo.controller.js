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
    // 1. Extraemos los datos del body (Actualizado con periodo y cuposList)
    const { titulo, descripcion, periodo, cuposList, requisitos, ayudante } = req.body;

    // 2. Extraemos el ID del profesor desde el Token
    const profesorId = req.user.sub;

    if (!profesorId) {
      return handleErrorClient(res, 401, "No autorizado. ID de usuario no encontrado en el token.");
    }

    // 3. Validaciones básicas
    // Ahora validamos que venga el periodo y la lista de cupos
    if (!titulo || !descripcion || !periodo || !requisitos) {
        return handleErrorClient(res, 400, "Faltan datos obligatorios (titulo, descripcion, periodo o requisitos).");
    }

    // Validar que cuposList sea un array y tenga al menos un elemento
    if (!cuposList || !Array.isArray(cuposList) || cuposList.length === 0) {
        return handleErrorClient(res, 400, "Debes asignar cupos al menos a una carrera.");
    }
    // validar que existe el syllabuspdf
    if (!req.file) {
        return handleErrorClient(res, 400, "El syllabus PDF es obligatorio.");
    }
    //extrar el pdf
    const syllabusPDF = req.file.buffer; // pdf como bytes
    const syllabusNombre = req.file.originalname; // Nombre original del archivo

    // Preparamos el objeto para el servicio
    const electivoData = {
        titulo,
        descripcion,
        periodo,      
        cuposList,   //(Array de objetos {carrera, cupos})
        requisitos,
        ayudante
    };

    // 4. Llamamos al servicio para crear el registro en la BD
    // se pasa syllabusPDF y syllabusNombre
    const nuevoElectivo = await createElectivo(electivoData, profesorId, syllabusPDF, syllabusNombre);

    // 5. Respuesta exitosa
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
    // Extraemos los datos actualizables
    const { titulo, descripcion, periodo, requisitos, ayudante, cuposList } = req.body;
    if (!req.file) {
        return handleErrorClient(res, 400, "El syllabus PDF es obligatorio.");
    }
    const syllabusPDF = req.file.buffer; // pdf como bytes
    const syllabusNombre = req.file.originalname; // Nombre original del archivo
    const data = { 
        titulo, 
        descripcion,
        periodo, //actualizar el periodo
        requisitos, 
        ayudante,
        cuposList  //actualizar cupos
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