import apiClient from "./apiClient.js";

// --- CREAR ---
export async function createElectivo(data) {
  try {
    // Si es FormData, axios automáticamente detecta y configura multipart/form-data
    // No pasamos config para permitir que axios lo maneje correctamente
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
    // Si es FormData, axios lo manejará automáticamente vía el interceptor
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

// --- DESCARGAR SYLLABUS (PDF) ---
export async function descargarSyllabus(id) {
  try {
    const response = await apiClient.get(`/electivos/${id}/descargar-syllabus`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Error al descargar el syllabus";
    throw new Error(message);
  }
}


export async function getAllElectivosAdmin() {
  try {
    // ATENCIÓN: Verifica en tu backend si la ruta es '/electivos/all' o '/electivos/admin'
    // Si no tienes una ruta específica, a veces se usa GET '/electivos' si el usuario es admin.
    // Probaré con '/electivos/all' que es lo común en estos casos.
    const response = await apiClient.get("/electivos/all");
    return response.data?.data || []; 
  } catch (error) {
    const message = error.response?.data?.message || "Error al cargar las solicitudes";
    throw new Error(message);
  }
}

export async function reviewElectivo(id, status, motivo_rechazo = null) {
  try {
    // Enviamos una petición PATCH para actualizar solo el estado
    const response = await apiClient.patch(`/electivos/${id}/status`, { 
      status, 
      motivo_rechazo 
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Error al actualizar el estado";
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
  descargarSyllabus,
  getAllElectivosAdmin,
  reviewElectivo
};