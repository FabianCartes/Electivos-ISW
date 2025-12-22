import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import electivoService from '../../services/electivo.service';

const ElectivosDisponibles = () => {
  const navigate = useNavigate();
  const [electivos, setElectivos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElectivos = async () => {
      try {
        const data = await electivoService.getElectivosDisponibles();
        console.log("✅ Electivos obtenidos:", data);
        console.log("📊 Cantidad de electivos:", data?.length || 0);
        
        // Filtro adicional de seguridad: solo mostrar electivos APROBADOS
        const electivosAprobados = (data || []).filter(e => e.status === "APROBADO");
        console.log("📋 Electivos filtrados (solo APROBADOS):", electivosAprobados.length);
        
        setElectivos(electivosAprobados);
      } catch (err) {
        console.error("❌ Error al cargar electivos:", err);
        setElectivos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchElectivos();
  }, []);

  // Función para formatear el periodo (año-semestre)
  const formatPeriodo = (electivo) => {
    if (electivo.anio && electivo.semestre) {
      return `${electivo.anio}-${electivo.semestre}`;
    }
    return "Sin periodo";
  };

  // Función para calcular total de cupos
  const calcularTotalCupos = (cuposPorCarrera) => {
    if (!cuposPorCarrera || cuposPorCarrera.length === 0) return 0;
    return cuposPorCarrera.reduce((total, cupo) => total + (cupo.cupos || 0), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* BOTÓN VOLVER */}
        <button 
          onClick={() => navigate('/alumno/dashboard')}
          className="mb-8 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Dashboard
        </button>

        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Electivos Disponibles</h1>
          <p className="text-gray-500 text-lg">Consulta la información completa de cada electivo aprobado para este semestre.</p>
        </div>

        {/* SECCIÓN: LISTA DE ELECTIVOS DISPONIBLES */}
        <div className="mb-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : electivos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4 text-5xl">📭</div>
                <p className="text-gray-500 text-lg">No hay electivos disponibles en este momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {electivos.map((electivo) => {
                  const totalCupos = calcularTotalCupos(electivo.cuposPorCarrera);
                  
                  return (
                    <div
                      key={electivo.id}
                      className="border-2 rounded-2xl p-6 border-gray-200 bg-white hover:border-gray-300 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer"
                    >
                      {/* Header con título y periodo */}
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-gray-900 flex-1 pr-4">
                          {electivo.titulo}
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                          {formatPeriodo(electivo)}
                        </span>
                      </div>

                      {/* Descripción */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {electivo.descripcion}
                      </p>

                      {/* Cupos por carrera */}
                      {electivo.cuposPorCarrera && electivo.cuposPorCarrera.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Cupos por Carrera</span>
                            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                              Total: {totalCupos}
                            </span>
                          </div>
                          <div className="space-y-1.5 max-h-24 overflow-y-auto">
                            {electivo.cuposPorCarrera.map((cupo, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs bg-gray-50 px-2 py-1.5 rounded border border-gray-100">
                                <span className="text-gray-600 truncate pr-2">{cupo.carrera}</span>
                                <span className="font-bold text-gray-800 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                  {cupo.cupos}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Profesor si existe */}
                      {electivo.profesor && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span><span className="font-semibold">Profesor:</span> {electivo.profesor.nombre}</span>
                        </div>
                      )}

                      {/* Ayudante si existe */}
                      {electivo.ayudante && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                          <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span><span className="font-semibold">Ayudante:</span> {electivo.ayudante}</span>
                        </div>
                      )}

                      {/* Requisitos */}
                      {electivo.requisitos && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-1 font-semibold uppercase">Requisitos Previos</p>
                          <p className="text-xs text-gray-600 line-clamp-2">{electivo.requisitos}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectivosDisponibles;

