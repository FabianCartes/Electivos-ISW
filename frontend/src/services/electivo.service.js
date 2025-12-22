import apiClient from "./apiClient.js";

// --- CREAR ---
export async function createElectivo(data) {
  try {
    const response = await apiClient.post("/electivos", data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Error al crear el electivo";
    throw new Error(message);
  }
}

// --- LISTAR MIS ELECTIVOS (Para profesores) ---
export async function getMyElectivos() {
  try {
    const response = await apiClient.get("/electivos");
    return response.data?.data || []; 
  } catch (error) {
    const message = error.response?.data?.message || "Error al obtener los electivos";
    throw new Error(message);
  }
}

// --- LISTAR ELECTIVOS DISPONIBLES (Para alumnos - Solo APROBADOS) ---
export async function getElectivosDisponibles() {
  try {
    const response = await apiClient.get("/electivos/disponibles");
    return response.data?.data || []; 
  } catch (error) {
    const message = error.response?.data?.message || "Error al obtener los electivos disponibles";
    throw new Error(message);
  }
}

// --- OBTENER UNO POR ID (Para editar) ---
export async function getElectivoById(id) {
  try {
    const response = await apiClient.get(`/electivos/${id}`);
    return response.data?.data;
  } catch (error) {
    const message = error.response?.data?.message || "Error al obtener el detalle del electivo";
    throw new Error(message);
  }
}

// --- ACTUALIZAR ---
export async function updateElectivo(id, data) {
  try {
    const response = await apiClient.put(`/electivos/${id}`, data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Error al actualizar el electivo";
    throw new Error(message);
  }
}

// --- ELIMINAR ---
export async function deleteElectivo(id) {
  try {
    await apiClient.delete(`/electivos/${id}`);
    return true;
  } catch (error) {
    const message = error.response?.data?.message || "Error al eliminar el electivo";
    throw new Error(message);
  }
}

// ==========================================
//      NUEVAS FUNCIONES JEFE DE CARRERA
// ==========================================

// --- OBTENER TODOS LOS ELECTIVOS (Para Gestión) ---
export async function getAllElectivosAdmin() {
  try {
    const response = await apiClient.get("/electivos/admin/todos");
    return response.data?.data || [];
  } catch (error) {
    const message = error.response?.data?.message || "Error al obtener lista completa de electivos";
    throw new Error(message);
  }
}

// --- REVISAR ELECTIVO (Aprobar/Rechazar) ---
export async function reviewElectivo(id, status, motivo = null) {
  try {
    const response = await apiClient.patch(`/electivos/${id}/review`, { status, motivo });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Error al procesar la solicitud";
    throw new Error(message);
  }
}

export default {
  createElectivo,
  getMyElectivos,
  getElectivosDisponibles,
  getElectivoById,
  updateElectivo,
  deleteElectivo,
  getAllElectivosAdmin, 
  reviewElectivo        
};