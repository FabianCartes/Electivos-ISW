import apiClient from "./apiClient.js";

// --- OBTENER MIS INSCRIPCIONES (Para alumnos) ---
export async function getMisInscripciones() {
  try {
    const response = await apiClient.get("/inscripcion/mis-inscripciones");
    return response.data?.data || [];
  } catch (error) {
    const message = error.response?.data?.message || "Error al obtener mis inscripciones";
    throw new Error(message);
  }
}

export default {
  getMisInscripciones
};

