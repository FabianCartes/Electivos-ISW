import apiClient from "./apiClient.js";

// --- CREAR INSCRIPCIÓN (Alumno) ---
export async function createInscripcion(electivoId, prioridad) {
  try {
    const response = await apiClient.post("/inscripcion", { electivoId, prioridad });
    return response.data?.data; // retorna la inscripción creada
  } catch (error) {
    const message = error.response?.data?.message || "Error al crear la inscripción";
    throw new Error(message);
  }
}

// --- OBTENER MIS INSCRIPCIONES (Alumno) ---
export async function getMisInscripciones() {
  try {
    const response = await apiClient.get("/inscripcion/mis-inscripciones");
    return response.data?.data || [];
  } catch (error) {
    const message = error.response?.data?.message || "Error al obtener mis inscripciones";
    throw new Error(message);
  }
}

// --- LISTAR INSCRIPCIONES (Jefe de Carrera) ---
export async function getInscripciones(params = {}) {
  try {
    const response = await apiClient.get("/inscripcion", { params });
    return response.data?.data || [];
  } catch (error) {
    const message = error.response?.data?.message || "Error al obtener inscripciones";
    throw new Error(message);
  }
}

// --- INSCRIPCIONES POR ELECTIVO (Profesor) ---
export async function getInscripcionesPorElectivo(electivoId, params = {}) {
  try {
    const response = await apiClient.get(`/inscripcion/electivo/${electivoId}`, { params });
    return response.data?.data || [];
  } catch (error) {
    const message = error.response?.data?.message || "Error al obtener inscripciones por electivo";
    throw new Error(message);
  }
}

// --- Actualizar estado de una inscripción (Jefe de Carrera) ---
export async function updateInscripcionStatus(id, status, motivo_rechazo = null) {
  try {
    const response = await apiClient.patch(`/inscripcion/${id}/status`, { status, motivo_rechazo });
    return response.data?.data;
  } catch (error) {
    const message = error.response?.data?.message || "Error al actualizar estado de inscripción";
    throw new Error(message);
  }
}

export default {
  createInscripcion,
  getMisInscripciones,
  getInscripciones,
  getInscripcionesPorElectivo,
  updateInscripcionStatus,
};

