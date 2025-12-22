import apiClient from "./apiClient.js";

// --- CREAR ---
export async function createElectivo(data) {
  try {
    let config = {};
    
    // Si es FormData, axios automáticamente detecta y configura multipart/form-data
    // No forzamos Content-Type para permitir que axios maneje los límites correctamente
    if (data instanceof FormData) {
      config = { headers: {} };
    }
    
    const response = await apiClient.post("/electivos", data, config);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Error al crear el electivo";
    throw new Error(message);
  }
}

// --- LISTAR MIS ELECTIVOS ---
export async function getMyElectivos() {
  try {
    const response = await apiClient.get("/electivos");
    // El backend devuelve: { message: "...", data: [...] } o directamente el array dependiendo de tu handler
    // Asumiendo que tu handleSuccess devuelve la data en 'data' o 'electivos'
    return response.data?.data || []; 
  } catch (error) {
    const message = error.response?.data?.message || "Error al obtener los electivos";
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
    let config = {};
    
    // Si es FormData, permitir que axios maneje multipart/form-data
    if (data instanceof FormData) {
      config = { headers: {} };
    }
    
    const response = await apiClient.put(`/electivos/${id}`, data, config);
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

export default {
  createElectivo,
  getMyElectivos,
  getElectivoById,
  updateElectivo,
  deleteElectivo,
  descargarSyllabus
};