import React from 'react';
import { useAuth } from '../../context/AuthContext';

const DashboardJefe = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-blue-600 shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-white">ELECTIVOS: Panel del Jefe de Carrera</h1>
              <p className="text-sm text-white mt-1">
                Fue ingresado como jefe de carrera. Selecciona una de las opciones para continuar.
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
              Bienvenido, estás logeado como jefe de carrera
            </h3>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
              Desde aquí podrás administrar todo el sistema de electivos de la carrera. 
              Elige una de las acciones para continuar.
            </p>
          </div>
        </div>

        {/* Opciones */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
         {/* Opción 1: Revisar solicitudes de inscripción */}
<div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition duration-300">
  <div className="text-center mb-4">
    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">1. Revisar solicitudes de inscripción</h3>
  </div>
  <p className="text-gray-600 mb-6 text-center">
    Gestiona las solicitudes de inscripción pendientes de los alumnos.
  </p>
  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-lg transition duration-200 shadow-md hover:shadow-lg mt-6">
    Gestionar electivos
  </button>
</div>

          {/* Opción 2: Historial de decisiones */}
<div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition duration-300">
  <div className="text-center mb-4">
    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">2. Historial de decisiones</h3>
  </div>
  <p className="text-gray-600 mb-6 text-center">
    Consulta el registro completo de decisiones tomadas sobre inscripciones.
  </p>
  <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold text-lg transition duration-200 shadow-md hover:shadow-lg mt-6">
    Gestionar profesores
  </button>
  <div className="mt-4 text-center">
    <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
      DISPONIBLE PRÓXIMAMENTE
    </span>
  </div>
</div>

         {/* Opción 3: Notificar estudiantes */}
<div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition duration-300">
  <div className="text-center mb-4">
    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">3. Notificar estudiantes</h3>
  </div>
  <p className="text-gray-600 mb-6 text-center">
    Comunica a los alumnos el resultado de sus solicitudes.
  </p>
  <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold text-lg transition duration-200 shadow-md hover:shadow-lg mt-6">
    Ver reportes
  </button>
  <div className="mt-4 text-center">
    <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
      DISPONIBLE PRÓXIMAMENTE
    </span>
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

export default DashboardJefe;