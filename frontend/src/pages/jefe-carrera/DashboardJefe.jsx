import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // 1. Importar Hook

const DashboardJefe = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // 2. Inicializar Hook

  const nombreJefe = user?.nombre || "Jefe de Carrera";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-800">Panel de Jefatura</span>
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-10 relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50 transition-opacity duration-300 group-hover:opacity-70"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="bg-indigo-100 p-4 rounded-full flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <div className="text-center md:text-left space-y-2">
                    <h2 className="text-3xl font-bold text-gray-900">
                        ¡Bienvenido, <span className="text-indigo-600">{nombreJefe}</span>!
                    </h2>
                    <p className="text-gray-500 text-lg max-w-2xl">
                        Panel de administración académica. Aquí puedes gestionar las solicitudes de los alumnos, revisar historiales y emitir comunicados oficiales.
                    </p>
                </div>
            </div>
        </div>

        {/* Grid de Opciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Opción 1: Solicitudes (CONECTADA) */}
          <div 
            onClick={() => navigate('/jefe/solicitudes')} // 3. Navegación al hacer click en la tarjeta
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Solicitudes Pendientes</h3>
            <p className="text-gray-500 mb-6 flex-grow text-sm">
              Revisa y gestiona las solicitudes de inscripción de electivos enviadas por los alumnos y profesores.
            </p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate('/jefe/solicitudes'); // 4. Navegación en el botón
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition duration-200 shadow-sm group-hover:shadow-md"
            >
              Gestionar Solicitudes
            </button>
          </div>

          {/* Opción 2: Historial (Operativo) */}
          <div 
            onClick={() => navigate('/jefe/historial')}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Historial de Decisiones</h3>
            <p className="text-gray-500 mb-6 flex-grow text-sm">
              Consulta el registro histórico de todas las aprobaciones y rechazos realizados.
            </p>
            <div className="space-y-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate('/jefe/historial'); }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-4 rounded-lg font-medium transition duration-200 shadow-sm">
                  Ver Historial
                </button>
            </div>
          </div>

          {/* Opción 3: Envío de correos */}
          <div
            onClick={() => navigate('/jefe/envio-correos')}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
          >
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Envío de correos</h3>
            <p className="text-gray-500 mb-6 flex-grow text-sm">
              Envía correos masivos o mensajes específicos a alumnos y profesores.
            </p>
            <div className="space-y-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/jefe/envio-correos');
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-lg font-medium transition duration-200 shadow-sm"
                >
                  Abrir envío de correos
                </button>
            </div>
          </div>

          {/* Opción 4: Periodo de inscripción */}
          <div
            onClick={() => navigate('/jefe/periodo')}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
          >
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 11h14M5 19h14M5 7h14M5 15h14" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Periodo de Inscripción</h3>
            <p className="text-gray-500 mb-6 flex-grow text-sm">
              Define el año, semestre y el rango de fechas en que los alumnos pueden inscribirse en los electivos.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/jefe/periodo');
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-medium transition duration-200 shadow-sm group-hover:shadow-md"
            >
              Asignar periodo
            </button>
          </div>

        </div>

      </main>
    </div>
  );
};

export default DashboardJefe;