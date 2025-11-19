import React from 'react';
import { useAuth } from '../../context/AuthContext';

const DashboardProfesor = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-blue-600 shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-white">ELECTIVOS: Panel del Profesor</h1>
              <p className="text-sm text-white mt-1">
                Fue ingresado como profesor. Selecciona una de las opciones para continuar.
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
              Bienvenido, estás logeado como profesor
            </h3>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
              Desde aquí podrás administrar todo lo relacionado a los electivos que impartes. 
              Elige una de las acciones para continuar.
            </p>
          </div>
        </div>

        {/* Opciones */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Opción 1: Crear nuevo electivo */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition duration-300">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">1. Crear nuevo electivo</h3>
            </div>
            <p className="text-gray-600 mb-6 text-center">
              Añade nuevos electivos al sistema con la información necesaria
            </p>
            <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold text-lg transition duration-200 shadow-md hover:shadow-lg">
              Crear nuevo electivo
            </button>
          </div>

          {/* Opción 2: Editar electivo existente */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition duration-300">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">2. Editar electivo existente</h3>
            </div>
            <p className="text-gray-600 mb-4 text-center">
              Modifica la información de los electivos ya creados.
            </p>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-lg transition duration-200 shadow-md hover:shadow-lg mb-3">
              Editar electivo
            </button>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg py-2 px-3 text-center">
              <span className="text-yellow-700 text-sm font-medium">DISPONIBLE PRÓXIMAMENTE</span>
            </div>
          </div>

          {/* Opción 3: Ver lista de alumnos inscritos */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition duration-300">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">3. Ver lista de alumnos inscritos</h3>
            </div>
            <p className="text-gray-600 mb-4 text-center">
              Revisa la lista de alumnos inscritos a los electivos que impartes.
            </p>
            <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold text-lg transition duration-200 shadow-md hover:shadow-lg mb-3">
              Revisar lista de alumnos
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

export default DashboardProfesor;
