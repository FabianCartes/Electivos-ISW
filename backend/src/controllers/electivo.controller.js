import { 
  createElectivo, 
  getElectivosByProfesor, 
  getElectivoById, 
  updateElectivo, 
  deleteElectivo,
  getElectivosDisponibles,
  getAllElectivosAdmin, 
  manageElectivoStatus
} from "../services/electivo.service.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

// --- CREAR UN NUEVO ELECTIVO ---
export const handleCreateElectivo = async (req, res) => {
  try {
    // 1. Extraemos los datos del body (anio, semestre y cuposList)
    const { titulo, descripcion, anio, semestre, cuposList, requisitos, ayudante } = req.body;

    // 2. Extraemos el ID del profesor desde el Token
    const profesorId = req.user.sub;

    if (!profesorId) {
      return handleErrorClient(res, 401, "No autorizado. ID de usuario no encontrado en el token.");
    }

    // 3. Validaciones básicas
    if (!titulo || !descripcion || !anio || !semestre || !requisitos) {
        return handleErrorClient(res, 400, "Faltan datos obligatorios (titulo, descripcion, anio, semestre o requisitos).");
    }

    // Validar que cuposList sea un array y tenga al menos un elemento
    if (!cuposList || !Array.isArray(cuposList) || cuposList.length === 0) {
        return handleErrorClient(res, 400, "Debes asignar cupos al menos a una carrera.");
    }

    // Preparamos el objeto para el servicio
    const electivoData = {
        titulo,
        descripcion,
        anio: parseInt(anio),
        semestre: String(semestre),      
        cuposList,   //(Array de objetos {carrera, cupos})
        requisitos,
        ayudante
    };

    // 4. Llamamos al servicio para crear el registro en la BD
    const nuevoElectivo = await createElectivo(electivoData, profesorId);

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
    const { titulo, descripcion, anio, semestre, requisitos, ayudante } = req.body;

    const data = { 
        titulo, 
        descripcion,
        anio: anio ? parseInt(anio) : undefined,
        semestre: semestre ? String(semestre) : undefined,
        requisitos, 
        ayudante,
        cuposList
        // Nota: Para actualizar cuposList se requiere una lógica más compleja en el servicio
        // (borrar cupos viejos y crear nuevos), por ahora actualizamos datos básicos.
    };
    
    const actualizado = await updateElectivo(id, data, profesorId);
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

// --- OBTENER ELECTIVOS DISPONIBLES (Para alumnos - Solo APROBADOS) ---
export const handleGetElectivosDisponibles = async (req, res) => {
  try {
    const electivos = await getElectivosDisponibles();
    handleSuccess(res, 200, "Electivos disponibles obtenidos", electivos);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
};


// --- [JEFE] OBTENER TODOS LOS ELECTIVOS (Gestión) ---
export const handleGetAllElectivos = async (req, res) => {
  try {
    const todos = await getAllElectivosAdmin();
    handleSuccess(res, 200, "Listado completo de electivos obtenido", todos);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
};

// --- [JEFE] REVISAR SOLICITUD (Aprobar/Rechazar) ---
export const handleReviewElectivo = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, motivo } = req.body;

    // Validar estado
    if (!["APROBADO", "RECHAZADO", "PENDIENTE"].includes(status)) {
        return handleErrorClient(res, 400, "Estado inválido. Debe ser APROBADO o RECHAZADO.");
    }

    // Validar motivo si rechaza
    if (status === "RECHAZADO" && !motivo) {
        return handleErrorClient(res, 400, "Se requiere un motivo para rechazar la solicitud.");
    }

    const actualizado = await manageElectivoStatus(id, status, motivo);
    handleSuccess(res, 200, `Electivo ${status.toLowerCase()} exitosamente`, actualizado);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
};