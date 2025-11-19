<<<<<<< HEAD
import React, { createContext, useState, useContext } from 'react';
=======
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import authService from "../services/auth.service.js";
>>>>>>> main

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Usuarios de prueba - por ahora solo el alumno
  const mockUsers = {
    "210196536": { 
      password: "19653", 
      rol: "ALUMNO", 
      nombre: "Carlos Cádiz",
      email: "carlos.cadiz2201@alumnos.ubbio.cl"
    },

    "196163212": { 
    password: "16321", 
    rol: "PROFESOR", 
    nombre: "Jairo Cádiz",
    email: "jairo.cadiz@ubiobio.cl"
  },

<<<<<<< HEAD
    "117012077": { 
    password: "01207", 
    rol: "JEFE_CARRERA", 
    nombre: "Juan Villagra",
    email: "juan.villagra@ubiobio.cl"
=======
  const [token, setToken] = useState(() => {
    if (USE_MOCK_AUTH) return MOCK_TOKEN;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const persistAuth = useCallback((authUser, authToken) => {
    if (USE_MOCK_AUTH) return;
    if (authUser && authToken) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
      localStorage.setItem(AUTH_TOKEN_KEY, authToken);
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    if (USE_MOCK_AUTH) {
      setUser(MOCK_USER);
      setToken(MOCK_TOKEN);
      return MOCK_USER;
    }

    setIsLoading(true);
    setError(null);
    try {
      const payload = await authService.login(email, password);
      if (!payload?.user || !payload?.token) {
        throw new Error("Respuesta del servidor incompleta");
      }

      setUser(payload.user);
      setToken(payload.token);
      persistAuth(payload.user, payload.token);

      return payload.user;
    } catch (err) {
      const message =
        err.response?.data?.message ??
        err.message ??
        "No se pudo iniciar sesión. Inténtalo nuevamente.";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [persistAuth]);

  const logout = useCallback(() => {
    if (USE_MOCK_AUTH) {
      setUser(MOCK_USER);
      setToken(MOCK_TOKEN);
      return;
    }
    setUser(null);
    setToken(null);
    persistAuth(null, null);
  }, [persistAuth]);

  const setMockRole = useCallback((role) => {
    if (!USE_MOCK_AUTH) return;
    const roleNames = {
      ALUMNO: "Alumno Demo",
      PROFESOR: "Profesor Demo",
      JEFE_CARRERA: "Jefe de Carrera Demo",
    };
    const roleEmails = {
      ALUMNO: "alumno.demo@institucion.cl",
      PROFESOR: "profesor.demo@institucion.cl",
      JEFE_CARRERA: "jefe.demo@institucion.cl",
    };
    setUser({
      id: 0,
      nombre: roleNames[role] || "Usuario Demo",
      email: roleEmails[role] || "demo@institucion.cl",
      role: role,
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isLoading,
      error,
      isAuthenticated: USE_MOCK_AUTH ? true : Boolean(user && token),
      isMocked: USE_MOCK_AUTH,
      setMockRole: USE_MOCK_AUTH ? setMockRole : undefined,
    }),
    [user, token, login, logout, isLoading, error, setMockRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de un AuthProvider");
>>>>>>> main
  }



  };

  const login = (rut, password) => {
    const user = mockUsers[rut];
    if (user && user.password === password) {
      setUser({ rut, ...user });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);