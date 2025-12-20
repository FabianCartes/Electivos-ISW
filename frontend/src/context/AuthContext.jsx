import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/auth.service.js'; 

const AuthContext = createContext();

// 1. Exportamos el Provider como una función nombrada
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Intentamos recuperar al usuario del localStorage para que la sesión sea persistente
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (rut, password) => {
    try {
      const userData = await authService.login(rut, password);
      if (userData && userData.user) {
        setUser(userData.user);
        localStorage.setItem('user', JSON.stringify(userData.user));
        return userData;
      }
      return null;
    } catch (error) {
      console.error("Error en login context:", error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Error en logout service:", error);
    } finally {
      // Siempre limpiamos el estado local al salir
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 2. Exportamos el Hook de forma independiente
export function useAuth() {
  return useContext(AuthContext);
}