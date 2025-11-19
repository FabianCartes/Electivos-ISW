import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardAlumno from './pages/alumno/DashboardAlumno';
import DashboardProfesor from './pages/profesor/DashboardProfesor';
import DashboardJefe from './pages/jefe-carrera/DashboardJefe';

function App() {
  const { user } = useAuth();
  console.log('App - User:', user);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element={user ? <DashboardByRole user={user} /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

function DashboardByRole({ user }) {
  console.log('DashboardByRole - User:', user);
  
  if (!user) return <Navigate to="/login" />;
  
  const rol = user.rol.toUpperCase();
  console.log('Rol detectado:', rol);
  
  switch(rol) {
    case 'ALUMNO':
      return <DashboardAlumno />; 
    case 'PROFESOR':
      return <DashboardProfesor />; 
    case 'JEFE_CARRERA':
      return <DashboardJefe />; 
    default:
      console.log('Rol no reconocido:', rol);
      return <Navigate to="/login" />;
  }
}

export default App;