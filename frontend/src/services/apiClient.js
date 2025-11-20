import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar sesiones expiradas
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el backend dice 401 (No autorizado) o 403 (Prohibido)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Redirigir al login si no estamos ya ahí
      if (window.location.pathname !== '/login') {
          window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;