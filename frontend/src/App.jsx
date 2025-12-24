import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Imports de páginas (Rutas relativas corregidas para estar en src/)
import Login from './pages/Login';
import DashboardAlumno from './pages/alumno/DashboardAlumno';
import DashboardProfesor from './pages/profesor/DashboardProfesor';
import InscribirElectivo from './pages/alumno/InscribirElectivo';
import ElectivosDisponibles from './pages/alumno/ElectivosDisponibles';
import MisInscripciones from './pages/alumno/MisInscripciones';
import CreateElectivo from './pages/profesor/CreateElectivo';
import MyElectivos from './pages/profesor/MyElectivos';
import EditElectivo from './pages/profesor/EditElectivo';
import AlumnosInscritos from './pages/profesor/AlumnosInscritos';
import DashboardJefe from './pages/jefe-carrera/DashboardJefe';
import ChatbotWidget from './components/ChatbotWidget';

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

        <Route 
          path="/profesor/alumnos-inscritos" 
          element={
            <ProtectedRoute allowedRoles={['PROFESOR']}>
              <AlumnosInscritos />
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

        {/* --- RUTA JEFE DE CARRERA (AGREGADA) --- */}
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

        {/* REDIRECCIÓN POR DEFECTO */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      {/* Chat flotante disponible en todas las rutas */}
      <ChatbotWidget />
    </BrowserRouter>
  );
}

export default App;