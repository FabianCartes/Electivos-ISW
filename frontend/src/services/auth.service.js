import apiClient from "./apiClient.js";

/**
 * Auth service for login/register requests.
 * Uses the configured apiClient which reads import.meta.env.VITE_API_URL.
 */
export async function login(email, password) {
  try {
    const response = await apiClient.post("/auth/login", { email, password });
    // backend follows pattern: { data: { user, token } }
    return response.data?.data;
  } catch (err) {
    const message = err.response?.data?.message ?? err.message ?? "Error en la petición de autenticación";
    throw new Error(message);
  }
}

export async function register(payload) {
  try {
    const response = await apiClient.post("/auth/register", payload);
    return response.data?.data;
  } catch (err) {
    const message = err.response?.data?.message ?? err.message ?? "Error en el registro";
    throw new Error(message);
  }
}

export default {
  login,
  register,
};
