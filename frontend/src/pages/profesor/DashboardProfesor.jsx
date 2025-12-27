import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import periodoService from '../../services/periodo.service';

const DashboardProfesor = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState('');

  const nombreProfesor = user?.nombre || "Profesor";

  const handleCrearElectivoClick = async () => {
    setError('');
    try {
      // Si hay un periodo de inscripción activo ahora mismo, bloquear creación
      const periodo = await periodoService.getPeriodoActivo();

      if (periodo) {
        setError('No puedes crear nuevos electivos durante el periodo de inscripción activo.');
        return;
      }

      // No hay periodo activo -> permitir crear
      navigate('/profesor/crear-electivo');
    } catch (e) {
      // Si falla la verificación, dejamos que el backend haga cumplir la regla
      navigate('/profesor/crear-electivo');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header / Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-800">Panel Docente</span>
            </div>
            
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-red-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Salir</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        {/* TARJETA DE BIENVENIDA */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-10 relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 transition-opacity duration-300 group-hover:opacity-70"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="bg-blue-100 p-4 rounded-full flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="text-center md:text-left space-y-2">
                    <h2 className="text-3xl font-bold text-gray-900">
                        ¡Bienvenido, <span className="text-blue-600">{nombreProfesor}</span>!
                    </h2>
                    <p className="text-gray-500 text-lg max-w-2xl">
                        Este es tu centro de control académico. Desde aquí puedes gestionar tus electivos, actualizar contenidos y revisar las solicitudes de tus estudiantes.
                    </p>
                </div>
            </div>
        </div>

        {/* Grid de Opciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Opción 1: Crear nuevo electivo */}
          <div 
            onClick={handleCrearElectivoClick}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
          >
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Publicar Electivo</h3>
            <p className="text-gray-500 mb-6 flex-grow text-sm">
              Crea una nueva propuesta de asignatura electiva para el próximo semestre.
            </p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleCrearElectivoClick();
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-medium transition duration-200 shadow-sm group-hover:shadow-md"
            >
              Crear Nuevo
            </button>
          </div>

          {/* Opción 2: Editar electivo existente (AHORA FUNCIONAL) */}
          <div 
            onClick={() => navigate('/profesor/mis-electivos')} // <--- CONECTADO AQUÍ
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Mis Electivos</h3>
            <p className="text-gray-500 mb-6 flex-grow text-sm">
              Gestiona, edita o elimina la información de los electivos que ya has registrado.
            </p>
            <div className="space-y-3">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/profesor/mis-electivos'); // <--- CONECTADO AQUÍ TAMBIÉN
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition duration-200 shadow-sm"
                >
                Ver Listado
                </button>
            </div>
          </div>

          {/* Opción 3: Ver lista de alumnos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Alumnos Inscritos</h3>
            <p className="text-gray-500 mb-6 flex-grow text-sm">
              Consulta quiénes se han inscrito en tus asignaturas este semestre.
            </p>
            <div className="space-y-3">
                <button 
                  onClick={() => navigate('/profesor/alumnos-inscritos')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-4 rounded-lg font-medium transition duration-200 shadow-sm"
                >
                  Ver Alumnos
                </button>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default DashboardProfesor;