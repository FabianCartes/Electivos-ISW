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
        if (userData.token) {
          // TODO: Considerar usar httpOnly cookies en lugar de localStorage para mayor seguridad
          // localStorage es vulnerable a XSS. Las cookies httpOnly son más seguras pero requieren backend support
          localStorage.setItem('token', userData.token);
        }
        localStorage.setItem('user', JSON.stringify(userData.user));
        setUser(userData.user); // Guardamos al usuario real en el estado
        return userData; // Retornamos para que el Login sepa que fue exitoso
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
      localStorage.removeItem('token');
      setUser(null);
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