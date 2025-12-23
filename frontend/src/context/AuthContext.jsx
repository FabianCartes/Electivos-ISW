import React, { createContext, useState, useContext } from 'react';
import authService from '../services/auth.service.js'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (rut, password) => {
    try {
      // Llamada al servicio real
      const userData = await authService.login(rut, password);
      
      // userData trae { user: { role: 'ALUMNO', ... }, token: '...' }
      if (userData && userData.user) {
        if (userData.token) {
          localStorage.setItem('token', userData.token);
        }
        setUser(userData.user); // Guardamos al usuario real en el estado
        return userData; // Retornamos para que el Login sepa que fue exitoso
      }
      return null;
    } catch (error) {
      console.error("Error en login context:", error.message);
      throw error; // Lanzamos el error para que la UI lo muestre
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error("Error en logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);