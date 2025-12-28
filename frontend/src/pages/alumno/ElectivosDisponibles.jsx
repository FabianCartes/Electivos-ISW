import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import electivoService from '../../services/electivo.service';
import { useAuth } from '../../context/AuthContext.jsx';

const ElectivosDisponibles = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [electivos, setElectivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const carreraUsuario = user?.carrera ?? null;

  // Normaliza texto para comparar carreras sin tildes y sin sensibilidad a mayúsculas
  const normalize = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  };

  useEffect(() => {
    const fetchElectivos = async () => {
      try {
        const data = await electivoService.getElectivosDisponibles();
        console.log("✅ Electivos obtenidos:", data);
        
        // Filtro adicional de seguridad: solo mostrar electivos APROBADOS
        const electivosAprobados = (data || []).filter(e => e.status === "APROBADO");

        // Si el usuario tiene carrera, filtramos por los cupos declarados para su carrera
        let electivosFiltrados = electivosAprobados;
        if (carreraUsuario) {
          const carreraNorm = normalize(carreraUsuario);
          electivosFiltrados = electivosAprobados.filter((e) => {
            const cupos = e.cuposPorCarrera || [];
            return cupos.some((c) => normalize(c.carrera) === carreraNorm && (c.cupos ?? 0) > 0);
          });
        }

        setElectivos(electivosFiltrados);
      } catch (err) {
        console.error("❌ Error al cargar electivos:", err);
        setElectivos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchElectivos();
    // Re-evaluar si cambia la carrera del usuario
  }, [carreraUsuario]);

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
          {carreraUsuario && (
            <p className="mt-2 text-sm text-gray-600">Filtrados por tu carrera: <span className="font-semibold text-gray-800">{carreraUsuario}</span></p>
          )}
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
                {carreraUsuario ? (
                  <p className="text-gray-500 text-lg">No hay electivos disponibles para tu carrera en este momento.</p>
                ) : (
                  <p className="text-gray-500 text-lg">No hay electivos disponibles en este momento.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {electivos.map((electivo) => {
                  const totalCupos = calcularTotalCupos(electivo.cuposPorCarrera);
                  
                  return (
                    <div
                      key={electivo.id}
                      className="border-2 rounded-2xl p-6 border-gray-200 bg-white hover:border-gray-300 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer flex flex-col h-full"
                    >
                      {/* Header con título y periodo */}
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-gray-900 flex-1 pr-4 break-words">
                          {electivo.titulo}
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                          {formatPeriodo(electivo)}
                        </span>
                      </div>

                      {/* Descripción (Usando observaciones si descripcion no existe, como vimos antes) */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 break-words flex-grow">
                        {electivo.observaciones || electivo.descripcion || "Sin descripción disponible."}
                      </p>

                      {/* --- SECCIÓN DE HORARIOS (NUEVO) --- */}
                      {electivo.horarios && electivo.horarios.length > 0 && (
                        <div className="mb-4 pt-3 border-t border-gray-100">
                           <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-xs font-bold text-gray-500 uppercase">Horarios</span>
                           </div>
                           <div className="flex flex-wrap gap-2">
                               {electivo.horarios.map((h, idx) => (
                                   <span key={idx} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-100 font-medium">
                                       {h.dia.substring(0, 3)} {h.horaInicio}-{h.horaTermino}
                                   </span>
                               ))}
                           </div>
                        </div>
                      )}

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

                      {/* Footer con info extra */}
                      <div className="pt-3 border-t border-gray-200 mt-auto">
                        {/* Botón para descargar el Programa del Electivo (PDF) */}
                        <button
                          type="button"
                          className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 shadow-sm"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const blob = await electivoService.descargarSyllabus(electivo.id);
                              const url = window.URL.createObjectURL(new Blob([blob]));
                              const link = document.createElement('a');
                              link.href = url;
                              const nombre = electivo.titulo ? `${electivo.titulo} - Programa del Electivo.pdf` : 'Programa del Electivo.pdf';
                              link.setAttribute('download', nombre);
                              document.body.appendChild(link);
                              link.click();
                              link.parentNode.removeChild(link);
                            } catch (err) {
                              alert(err.message || 'No se pudo descargar el Programa del Electivo');
                            }
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Programa del electivo
                        </button>
                          {/* Profesor si existe */}
                          {electivo.profesor && (
                            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1.5">
                              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="truncate"><span className="font-semibold">Profesor:</span> {electivo.profesor.nombre}</span>
                            </div>
                          )}

                          {/* Ayudante si existe */}
                          {electivo.ayudante && (
                            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1.5">
                              <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="truncate"><span className="font-semibold">Ayudante:</span> {electivo.ayudante}</span>
                            </div>
                          )}

                          {/* Requisitos */}
                          {electivo.requisitos && (
                            <div className="mt-2 text-xs text-gray-500">
                              <span className="font-semibold text-gray-400 uppercase mr-1">Requisitos:</span>
                              <span className="italic">{electivo.requisitos}</span>
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
      </div>
    </div>
  );
};

export default ElectivosDisponibles;