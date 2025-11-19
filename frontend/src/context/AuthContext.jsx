import { createContext, useCallback, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import authService from "../services/auth.service.js";

const AuthContext = createContext(null);

const AUTH_USER_KEY = "electivos:user";
const AUTH_TOKEN_KEY = "electivos:token";
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === "true";

const MOCK_USER = {
  id: 0,
  nombre: "Alumno Demo",
  email: "alumno.demo@institucion.cl",
  role: "ALUMNO",
};
const MOCK_TOKEN = "mock-token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (USE_MOCK_AUTH) return MOCK_USER;
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Error al parsear el usuario almacenado", error);
      return null;
    }
  });

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
  }
  return context;
}


