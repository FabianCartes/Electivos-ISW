import React from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importamos el hook
import { useAuth } from '../../context/AuthContext';

const DashboardAlumno = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // 2. Inicializamos la función de navegación

  // Obtenemos el nombre del alumno
  const nombreAlumno = user?.nombre || "Estudiante";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header / Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-800">Portal Estudiante</span>
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

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        {/* TARJETA DE BIENVENIDA */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="bg-blue-100 p-4 rounded-full flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                
                <div className="text-center md:text-left space-y-2">
                    <h2 className="text-3xl font-bold text-gray-900">
                        ¡Hola, <span className="text-blue-600">{nombreAlumno}</span>!
                    </h2>
                    <p className="text-gray-500 text-lg max-w-2xl">
                        Bienvenido a tu portal de electivos. Aquí puedes revisar la oferta académica disponible, inscribir tus asignaturas y consultar tu historial.
                    </p>
                </div>
            </div>
        </div>

        {/* Grid de Opciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Opción 1: Electivos Disponibles (Naranja/Amarillo) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transform transition-all duration-300 flex flex-col hover:shadow-xl hover:-translate-y-2">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Electivos Disponibles</h3>
            <p className="text-gray-500 mb-6 flex-grow text-sm">
              Explora todos los electivos aprobados disponibles para este semestre académico.
            </p>
            <button 
              onClick={() => navigate('/alumno/electivos-disponibles')}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 px-4 rounded-lg font-medium transition duration-200 shadow-sm"
            >
              Ver Electivos Disponibles
            </button>
          </div>

          {/* Opción 2: Inscribir Electivos (Verde) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transform transition-all duration-300 flex flex-col hover:shadow-xl hover:-translate-y-2">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Inscribir Electivos</h3>
            <p className="text-gray-500 mb-6 flex-grow text-sm">
              Selecciona tus 3 prioridades e inscribe tus asignaturas para este semestre.
            </p>
            <button 
              onClick={() => navigate('/alumno/inscribir-electivo')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-medium transition duration-200 shadow-sm"
            >
              Inscribir Ahora
            </button>
          </div>

          {/* Opción 3: Mis Inscripciones (Azul) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transform transition-all duration-300 flex flex-col hover:shadow-xl hover:-translate-y-2">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Mis Inscripciones</h3>
            <p className="text-gray-500 mb-6 flex-grow text-sm">
              Consulta el estado de tus solicitudes y revisa los electivos que ya tienes inscritos.
            </p>
            <button 
              onClick={() => navigate('/alumno/mis-inscripciones')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition duration-200 shadow-sm"
            >
              Ver Mi Historial
            </button>
          </div>

        </div>

      </main>
    </div>
  );
};

export default DashboardAlumno;