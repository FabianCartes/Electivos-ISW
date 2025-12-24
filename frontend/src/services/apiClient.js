import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para peticiones
apiClient.interceptors.request.use((config) => {
  // Inyectar token JWT si existe y es válido
  const token = localStorage.getItem('token');
  if (token) {
    // TODO: Considerar validar expiration del token aquí antes de enviar
    // import jwtDecode from 'jwt-decode';
    // try {
    //   const decoded = jwtDecode(token);
    //   if (decoded.exp * 1000 < Date.now()) {
    //     localStorage.removeItem('token');
    //     return Promise.reject(new Error('Token expirado'));
    //   }
    // } catch (e) {
    //   console.error('Error decodificando token:', e);
    // }
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Si es FormData, no forzar Content-Type para que el navegador use multipart/form-data
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// Interceptor para manejar sesiones expiradas
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el backend dice 401 (No autorizado) o 403 (Prohibido)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token');
      // Redirigir al login si no estamos ya ahí
      if (window.location.pathname !== '/login') {
          window.location.href = '/login';
      }
      
      // Para otros casos, dejar que el componente maneje el error
      // La redirección se puede hacer manualmente desde el componente si es necesario
    }
    return Promise.reject(error);
  }
);

export default apiClient;