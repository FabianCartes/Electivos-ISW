import apiClient from "./apiClient.js";

export async function login(rut, password) {
  try {
    // Ahora enviamos 'rut' en lugar de 'email'
    const response = await apiClient.post("/auth/login", { rut, password });
    
    // El backend devuelve: { status: "Success", data: { user: {...}, token: "..." } }
    // Retornamos todo el objeto 'data' (que incluye al usuario y su rol)
    return response.data?.data; 
  } catch (err) {
    const message = err.response?.data?.message ?? err.message ?? "Error al iniciar sesión";
    throw new Error(message);
  }
}

export async function logout() {
    try {
        await apiClient.post("/auth/logout");
    } catch (error) {
        console.error("Error al cerrar sesión", error);
    }
}

export default {
  login,
  logout
};