import React, { createContext, useState, useContext } from 'react';

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

    "117012077": { 
    password: "01207", 
    rol: "JEFE_CARRERA", 
    nombre: "Juan Villagra",
    email: "juan.villagra@ubiobio.cl"
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