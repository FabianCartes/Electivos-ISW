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
      console.error('Error de autenticación en interceptor:', {
        status: error.response.status,
        data: error.response.data,
        path: window.location.pathname,
        url: error.config?.url
      });
      
      // Solo redirigir al login si NO estamos ya ahí y NO estamos en una ruta protegida
      // que pueda estar haciendo una llamada de carga inicial
      const currentPath = window.location.pathname;
      
      // No redirigir automáticamente para permitir que los componentes manejen el error
      // Los componentes pueden decidir si redirigir o mostrar un mensaje de error
      if (currentPath === '/login') {
        // Ya estamos en login, no hacer nada
        return Promise.reject(error);
      }
      
      // Para otros casos, dejar que el componente maneje el error
      // La redirección se puede hacer manualmente desde el componente si es necesario
    }
    return Promise.reject(error);
  }
);

export default apiClient;