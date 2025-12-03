import apiClient from "./apiClient.js"; // Asegúrate de tener la extensión .js si usas Vite

export async function createElectivo(data) {
  try {
    // Realizamos la petición POST al endpoint /electivos del backend
    // 'data' contiene: { titulo, cupos, requisitos, ayudante, descripcion }
    const response = await apiClient.post("/electivos", data);
    
    // Retornamos la respuesta del servidor (ej: { message: "Creado...", electivo: {...} })
    return response.data;
  } catch (error) {
    // Si hay error, extraemos el mensaje que envía el backend (ej: "Faltan datos")
    const message = error.response?.data?.message || "Error desconocido al crear el electivo";
    throw new Error(message);
  }
}

export default {
  createElectivo
};