import React from 'react';
import { useAuth } from '../../context/AuthContext';

const DashboardAlumno = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-blue-600 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-white">ELECTIVOS: Panel del Alumno</h1>
              <p className="text-sm text-white mt-1">
                Fue ingresado como estudiante. Selecciona una de las opciones para continuar.
              </p>
            </div>
            <button 
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Estado Actual */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">ESTADO ACTUAL</h2>
            <div className="w-24 h-1 bg-blue-500 mx-auto mb-4"></div>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Bienvenido, estás logeado como alumno
            </h3>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
              Desde aquí podrás administrar todo lo relacionado a tus electivos. 
              Elige una de las acciones para continuar.
            </p>
          </div>
        </div>

        {/* Opciones */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          

         {/* Opción 1: Inscribir electivos */}
<div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition duration-300">
  <div className="text-center mb-4">
    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">1. Inscribir electivos</h3>
  </div>
  <p className="text-gray-600 mb-6 text-center">
    Selecciona el electivo que deseas inscribir este semestre.
  </p>
  <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold text-lg transition duration-200 shadow-md hover:shadow-lg mt-6">
    Ver electivos
  </button>
</div>


{/* Opción 2: Electivos inscritos */}
<div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition duration-300">
  <div className="text-center mb-4">
    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">2. Electivos inscritos</h3>
  </div>
  <p className="text-gray-600 mb-4 text-center">
    Consulta el estado de tus electivos inscritos.
  </p>
  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-lg transition duration-200 shadow-md hover:shadow-lg mb-3 mt-7">
    Revisar historial
  </button>
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg py-2 px-3 text-center">
    <span className="text-yellow-700 text-sm font-medium">DISPONIBLE PRÓXIMAMENTE</span>
  </div>
</div>

         {/* Opción 3: Comunicarse con el Jefe de Carrera */}
<div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition duration-300">
  <div className="text-center mb-4">
    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">3. Comunicarse con el Jefe de Carrera</h3>
  </div>
  <p className="text-gray-600 mb-4 text-center">
    Si tienes alguna duda contacta con el jefe de carrera para resolverlas.
  </p>
  <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold text-lg transition duration-200 shadow-md hover:shadow-lg mb-3">
    Contactar Jefe de Carrera
  </button>
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg py-2 px-3 text-center">
    <span className="text-yellow-700 text-sm font-medium">DISPONIBLE PRÓXIMAMENTE</span>
  </div>
</div>

        </div>

        {/* Información adicional */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <p className="text-gray-600 text-lg">
              ¿Necesitas ayuda? Contacta con la administración del sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAlumno;