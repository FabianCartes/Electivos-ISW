import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Imports de páginas
import Login from './pages/Login';
import DashboardAlumno from './pages/alumno/DashboardAlumno';
import InscribirElectivo from './pages/alumno/InscribirElectivo';     // <--- Asegúrate de tener este archivo
import ElectivosDisponibles from './pages/alumno/ElectivosDisponibles';
import MisInscripciones from './pages/alumno/MisInscripciones';       // <--- Asegúrate de tener este archivo

import DashboardProfesor from './pages/profesor/DashboardProfesor';
import CreateElectivo from './pages/profesor/CreateElectivo';
import MyElectivos from './pages/profesor/MyElectivos';
import EditElectivo from './pages/profesor/EditElectivo';
import AlumnosInscritos from './pages/profesor/AlumnosInscritos';

import DashboardJefe from './pages/jefe-carrera/DashboardJefe';
import Solicitudes from './pages/jefe-carrera/Solicitudes';

import ChatbotWidget from './components/ChatbotWidget';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  // Si no hay usuario, al login
  if (!user) return <Navigate to="/login" replace />;
  // Si el rol no coincide, al login
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* =========================================
            RUTAS ALUMNO
           ========================================= */}
        <Route path="/alumno/dashboard" element={
            <ProtectedRoute allowedRoles={['ALUMNO']}>
              <DashboardAlumno />
            </ProtectedRoute>
        } />

        {/* ✨ ESTA ES LA QUE FALTABA Y CAUSABA EL ERROR ✨ */}
        <Route path="/alumno/electivos-disponibles" element={
            <ProtectedRoute allowedRoles={['ALUMNO']}>
              <ElectivosDisponibles />
            </ProtectedRoute>
        } />

        {/* Agregamos las otras para que funcionen los demás botones */}
        <Route path="/alumno/inscribir-electivo" element={
            <ProtectedRoute allowedRoles={['ALUMNO']}>
              <InscribirElectivo />
            </ProtectedRoute>
        } />

        <Route path="/alumno/mis-inscripciones" element={
            <ProtectedRoute allowedRoles={['ALUMNO']}>
              <MisInscripciones />
            </ProtectedRoute>
        } />


        {/* =========================================
            RUTAS PROFESOR
           ========================================= */}
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

        <Route path="/profesor/alumnos-inscritos" element={
            <ProtectedRoute allowedRoles={['PROFESOR']}>
              <AlumnosInscritos />
            </ProtectedRoute>
        } />


        {/* =========================================
            RUTAS JEFE DE CARRERA
           ========================================= */}
        <Route path="/jefe/dashboard" element={
            <ProtectedRoute allowedRoles={['JEFE_CARRERA']}>
              <DashboardJefe />
            </ProtectedRoute>
        } />

        <Route path="/jefe/solicitudes" element={
            <ProtectedRoute allowedRoles={['JEFE_CARRERA']}>
              <Solicitudes />
            </ProtectedRoute>
        } />


        {/* =========================================
            REDIRECCIONES POR DEFECTO
           ========================================= */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Cualquier ruta desconocida manda al login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
        
      </Routes>

      <ChatbotWidget />
    </BrowserRouter>
  );
}

export default App;