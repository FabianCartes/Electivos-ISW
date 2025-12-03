import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';


import Login from './pages/Login';
import DashboardAlumno from './pages/alumno/DashboardAlumno';
import DashboardProfesor from './pages/profesor/DashboardProfesor';
import CreateElectivo from './pages/profesor/CreateElectivo';
import MyElectivos from './pages/profesor/MyElectivos'; 
import EditElectivo from './pages/profesor/EditElectivo';
import DashboardJefe from './pages/jefe-carrera/DashboardJefe';

// esto hace como un guardia de seguridad
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  //si el usuario no ha iniciado sesion, se redirige al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // si llega un rol no permitido
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // se envia devuelta al login
    return <Navigate to="/login" replace />;
  }

  // si pasa las validaciones, muestra la pagina
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- RUTA PÚBLICA --- */}
        <Route path="/login" element={<Login />} />


        {/* --- RUTAS PROTEGIDAS POR ROL --- */}

        {/* RUTA ALUMNO */}
        <Route 
          path="/alumno/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['ALUMNO']}>
              <DashboardAlumno />
            </ProtectedRoute>
          } 
        />

        {/* RUTA PROFESOR */}
        <Route 
          path="/profesor/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['PROFESOR']}>
              <DashboardProfesor />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profesor/crear-electivo" 
          element={
            <ProtectedRoute allowedRoles={['PROFESOR']}>
              <CreateElectivo />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profesor/mis-electivos" 
          element={
            <ProtectedRoute allowedRoles={['PROFESOR']}>
              <MyElectivos />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profesor/editar-electivo/:id" 
          element={
            <ProtectedRoute allowedRoles={['PROFESOR']}>
              <EditElectivo />
            </ProtectedRoute>
          } 
        />

        {/* RUTA JEFE DE CARRERA */}
        <Route 
          path="/jefe/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['JEFE_CARRERA']}>
              <DashboardJefe />
            </ProtectedRoute>
          } 
        />

        {/* --- RUTAS DE REDIRECCIÓN --- */}
        
        {/* Si entran a la raíz, enviar al Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Si escriben una ruta que no existe, enviar al Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;