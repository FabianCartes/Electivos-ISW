import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import inscripcionService from '../../services/inscripcion.service.js';

const MisInscripciones = () => {
  const navigate = useNavigate();
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInscripciones = async () => {
    try {
      const data = await inscripcionService.getMisInscripciones();
      setInscripciones(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInscripciones();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'APROBADA': return 'bg-green-100 text-green-700 border-green-200';
      case 'RECHAZADA': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'APROBADA': return 'Aprobada';
      case 'RECHAZADA': return 'Rechazada';
      default: return 'Pendiente';
    }
  };

  const formatPeriodo = (electivo) => {
    if (electivo && electivo.anio && electivo.semestre) {
      return `${electivo.anio}-${electivo.semestre}`;
    }
    return "Sin periodo";
  };

  const calcularTotalCupos = (cuposPorCarrera) => {
    if (!cuposPorCarrera || cuposPorCarrera.length === 0) return 0;
    return cuposPorCarrera.reduce((total, cupo) => total + (cupo.cupos || 0), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Inscripciones</h1>
            <p className="text-gray-500 mt-1">Consulta el estado de tus solicitudes de inscripción.</p>
          </div>
          <button 
            onClick={() => navigate('/alumno/dashboard')}
            className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Dashboard
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : inscripciones.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="text-gray-400 mb-4 text-6xl">📭</div>
            <h3 className="text-lg font-medium text-gray-900">No tienes inscripciones</h3>
            <p className="text-gray-500 mt-2 mb-6">Aún no te has inscrito en ningún electivo.</p>
            <button 
              onClick={() => navigate('/alumno/inscribir-electivo')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md"
            >
              Ver Electivos Disponibles
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {inscripciones.map((inscripcion) => {
              const electivo = inscripcion.electivo;
              if (!electivo) return null;

              return (
                <div 
                  key={inscripcion.id} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transform transition-all duration-300 flex flex-col hover:shadow-xl hover:-translate-y-2 cursor-pointer"
                >
                  <div className="p-6 flex-grow">
                    {/* Header Tarjeta */}
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getStatusColor(inscripcion.status)}`}>
                        {getStatusText(inscripcion.status)}
                      </span>
                      <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded">
                        {formatPeriodo(electivo)}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2" title={electivo.titulo}>
                      {electivo.titulo}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {electivo.descripcion}
                    </p>

                    {/* Profesor */}
                    {electivo.profesor && (
                      <div className="flex items-center gap-2 mb-4 bg-blue-50 p-2 rounded-lg border border-blue-100">
                        <div className="bg-blue-100 p-1 rounded-full">
                          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs text-blue-500 font-bold uppercase">Profesor</p>
                          <p className="text-sm text-gray-800 font-medium truncate">{electivo.profesor.nombre}</p>
                        </div>
                      </div>
                    )}

                    {/* Ayudante si existe */}
                    {electivo.ayudante && (
                      <div className="flex items-center gap-2 mb-4 bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                        <div className="bg-indigo-100 p-1 rounded-full">
                          <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs text-indigo-500 font-bold uppercase">Ayudante</p>
                          <p className="text-sm text-gray-800 font-medium truncate">{electivo.ayudante}</p>
                        </div>
                      </div>
                    )}

                    {/* Cupos por carrera */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cupos por Carrera</p>
                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          Total: {calcularTotalCupos(electivo.cuposPorCarrera)}
                        </span>
                      </div>
                      
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {electivo.cuposPorCarrera && electivo.cuposPorCarrera.length > 0 ? (
                          electivo.cuposPorCarrera.map((cupo, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm bg-gray-50 px-2 py-1.5 rounded border border-gray-100">
                              <span className="text-gray-600 truncate pr-2 text-xs" title={cupo.carrera}>
                                {cupo.carrera}
                              </span>
                              <span className="font-bold text-gray-800 text-xs bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                {cupo.cupos}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400 italic">No hay detalle de cupos.</p>
                        )}
                      </div>
                    </div>

                    {/* Razón de rechazo si está rechazada */}
                    {inscripcion.status === 'RECHAZADA' && inscripcion.razon_rechazo && (
                      <div className="mt-4 pt-4 border-t border-red-200 bg-red-50 p-3 rounded-lg">
                        <p className="text-xs font-bold text-red-700 uppercase mb-1">Razón de Rechazo</p>
                        <p className="text-sm text-red-600">{inscripcion.razon_rechazo}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisInscripciones;

