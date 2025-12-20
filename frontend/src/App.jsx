import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Imports de páginas (Rutas relativas corregidas para estar en src/)
import Login from './pages/Login';
import DashboardAlumno from './pages/alumno/DashboardAlumno';
import DashboardProfesor from './pages/profesor/DashboardProfesor';
import InscribirElectivo from './pages/alumno/InscribirElectivo';
import CreateElectivo from './pages/profesor/CreateElectivo';
import MyElectivos from './pages/profesor/MyElectivos';
import EditElectivo from './pages/profesor/EditElectivo';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  // Si no hay usuario en localStorage o RAM, rebota al login
  if (!user) return <Navigate to="/login" replace />;
  // Si el rol no coincide, rebota al login
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* RUTA ALUMNO PROTEGIDA */}
        <Route path="/alumno/dashboard" element={
          <ProtectedRoute allowedRoles={['ALUMNO']}>
            <DashboardAlumno />
          </ProtectedRoute>
        } />
        
        <Route path="/alumno/inscribir-electivo" element={
          <ProtectedRoute allowedRoles={['ALUMNO']}>
            <InscribirElectivo />
          </ProtectedRoute>
        } />

        {/* RUTAS PROFESOR PROTEGIDAS */}
        <Route path="/profesor/dashboard" element={
          <ProtectedRoute allowedRoles={['PROFESOR']}>
            <DashboardProfesor />
          </ProtectedRoute>
        } />
        
        <Route path="/profesor/crear-electivo" element={
          <ProtectedRoute allowedRoles={['PROFESOR']}>
            <CreateElectivo />
          </ProtectedRoute>
        } />
        
        <Route path="/profesor/mis-electivos" element={
          <ProtectedRoute allowedRoles={['PROFESOR']}>
            <MyElectivos />
          </ProtectedRoute>
        } />
        
        <Route path="/profesor/editar-electivo/:id" element={
          <ProtectedRoute allowedRoles={['PROFESOR']}>
            <EditElectivo />
          </ProtectedRoute>
        } />

        {/* REDIRECCIÓN POR DEFECTO */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;