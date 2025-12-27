import apiClient from "./apiClient";

export async function getPeriodo(anio, semestre) {
  try {
    const { data } = await apiClient.get("/periodo", {
      params: { anio, semestre },
    });
    return data?.data || null;
  } catch (error) {
    const message = error.response?.data?.message || "Error al obtener el periodo";
    throw new Error(message);
  }
}

export async function setPeriodo({ anio, semestre, inicio, fin }) {
  try {
    const { data } = await apiClient.post("/periodo", {
      anio: Number(anio),
      semestre: String(semestre),
      inicio,
      fin,
    });
    return data?.data || null;
  } catch (error) {
    const message = error.response?.data?.message || "Error al configurar el periodo";
    throw new Error(message);
  }
}

export default {
  getPeriodo,
  setPeriodo,
};
