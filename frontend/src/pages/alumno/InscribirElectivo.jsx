import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SuccessModal from '../../components/SuccessModal'; 
import electivoService from '../../services/electivo.service';
import inscripcionService from '../../services/inscripcion.service.js';

const InscribirElectivo = () => {
  const navigate = useNavigate();
  const [electivos, setElectivos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [prioridades, setPrioridades] = useState({ p1: '', p2: '', p3: '' });

  useEffect(() => {
    const fetchElectivos = async () => {
      try {
        const data = await electivoService.getElectivosDisponibles();
        // Filtro adicional de seguridad
        const electivosAprobados = (data || []).filter(e => e.status === "APROBADO");
        setElectivos(electivosAprobados);
      } catch (err) {
        console.error("Error al cargar electivos:", err);
        setElectivos([]);
      }
    };
    fetchElectivos();
  }, []);

  const handleSelect = (e) => {
    const { name, value } = e.target;
    setPrioridades(prev => ({ ...prev, [name]: value }));
  };

  const getSelectedData = (id) => electivos.find(e => String(e.id) === String(id));

  const formatPeriodo = (electivo) => {
    if (electivo.anio && electivo.semestre) return `${electivo.anio}-${electivo.semestre}`;
    return "Sin periodo";
  };

  const calcularTotalCupos = (cuposPorCarrera) => {
    if (!cuposPorCarrera || cuposPorCarrera.length === 0) return 0;
    return cuposPorCarrera.reduce((total, cupo) => total + (cupo.cupos || 0), 0);
  };

  const estaSeleccionado = (electivoId) => Object.values(prioridades).includes(String(electivoId));

  const colorClasses = {
    blue: 'bg-blue-600',
    indigo: 'bg-indigo-600',
    purple: 'bg-purple-600'
  };

  const handleConfirmarPostulacion = async () => {
    // Debe existir al menos prioridad 1
    if (!prioridades.p1) return;

    const selecciones = [
      { id: prioridades.p1, prioridad: 1 },
      prioridades.p2 ? { id: prioridades.p2, prioridad: 2 } : null,
      prioridades.p3 ? { id: prioridades.p3, prioridad: 3 } : null,
    ].filter(Boolean);

    try {
      // Ejecutar inscripciones en serie para manejar errores de forma clara
      for (const sel of selecciones) {
        await inscripcionService.createInscripcion(Number(sel.id), sel.prioridad);
      }
      setShowModal(true);
    } catch (err) {
      console.error("Error al inscribirse:", err.message);
      alert(err.message || "No se pudo completar la postulación");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans relative">
      <SuccessModal 
        isOpen={showModal} 
        onClose={() => navigate('/alumno/dashboard')} 
        title="Postulación Enviada"
        message="Tus 3 prioridades han sido registradas exitosamente."
      />

      <div className="max-w-6xl mx-auto">
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
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Selección de Prioridades</h1>
          <p className="text-gray-500 text-lg">Organiza tus opciones del semestre por orden de importancia.</p>
        </div>

        {/* --- GRID DE SELECCIÓN --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[
            { id: 'p1', label: 'Prioridad 1', color: 'blue' },
            { id: 'p2', label: 'Prioridad 2', color: 'indigo' },
            { id: 'p3', label: 'Prioridad 3', color: 'purple' }
          ].map((p, index) => {
            const dataElectivo = prioridades[p.id] ? getSelectedData(prioridades[p.id]) : null;

            return (
              <div key={p.id} className="flex flex-col gap-6">
                <div className={`bg-white p-6 rounded-3xl shadow-sm border-2 transition-all duration-300 ${
                  prioridades[p.id] ? 'border-blue-500 shadow-md' : 'border-gray-100 hover:border-gray-200'
                }`}>
                  <div className="flex items-center gap-4 mb-6">
                    <span className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${colorClasses[p.color]}`}>
                      {index + 1}
                    </span>
                    <h3 className="font-bold text-gray-800 text-lg">{p.label}</h3>
                  </div>
                  
                  <select
                    name={p.id}
                    value={prioridades[p.id]}
                    onChange={handleSelect}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="">Selecciona un electivo...</option>
                    {electivos.map(e => (
                      <option 
                        key={e.id} 
                        value={e.id} 
                        disabled={Object.values(prioridades).includes(String(e.id)) && prioridades[p.id] !== String(e.id)}
                      >
                        {e.titulo}
                      </option>
                    ))}
                  </select>
                </div>

                {/* INFO DE LA SELECCIÓN */}
                {dataElectivo && (
                  <div className="bg-white p-6 rounded-3xl shadow-xl border-t-4 border-blue-500 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h4 className="font-bold text-gray-900 text-base mb-2 break-words">
                      {dataElectivo.titulo}
                    </h4>
                    <p className="text-sm text-gray-600 italic break-words whitespace-pre-wrap mb-4">
                      "{dataElectivo.observaciones || "Sin descripción disponible"}"
                    </p>
                    
                    {/* Horarios en la tarjeta de selección */}
                    {dataElectivo.horarios && dataElectivo.horarios.length > 0 && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Horarios
                        </p>
                        <ul className="space-y-1">
                          {dataElectivo.horarios.map((h, idx) => (
                            <li key={idx} className="flex justify-between text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded">
                              <span className="font-semibold">{h.dia}</span>
                              <span>{h.horaInicio} - {h.horaTermino}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={handleConfirmarPostulacion}
            disabled={!prioridades.p1}
            className={`px-16 py-4 rounded-2xl font-bold text-white shadow-2xl transition-all ${
              !prioridades.p1 ? 'bg-gray-300' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-xl'
            }`}
          >
            Confirmar Postulación
          </button>
        </div>

        {/* --- LISTA COMPLETA DE ELECTIVOS --- */}
        <div className="mt-16 mb-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Electivos Disponibles</h2>
              <p className="text-gray-500">Consulta la información completa antes de seleccionar.</p>
            </div>

            {electivos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4 text-5xl">📭</div>
                <p className="text-gray-500 text-lg">No hay electivos disponibles.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {electivos.map((electivo) => {
                  const seleccionado = estaSeleccionado(electivo.id);
                  const totalCupos = calcularTotalCupos(electivo.cuposPorCarrera);
                  
                  return (
                    <div
                      key={electivo.id}
                      className={`border-2 rounded-2xl p-6 transform transition-all duration-300 ${
                        seleccionado
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-gray-900 flex-1 pr-4">
                          {electivo.titulo}
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                          {formatPeriodo(electivo)}
                        </span>
                      </div>

                      {seleccionado && (
                        <div className="mb-3 flex items-center gap-2 text-blue-600 text-sm font-medium">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Ya seleccionado</span>
                        </div>
                      )}

                      {/* --- ARREGLO 1: break-words --- */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 break-words">
                        {electivo.observaciones || "Sin descripción disponible."}
                      </p>

                      {/* --- ARREGLO 2: MOSTRAR HORARIOS EN LISTA --- */}
                      {electivo.horarios && electivo.horarios.length > 0 && (
                         <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Horarios</p>
                            <div className="flex flex-wrap gap-2">
                                {electivo.horarios.map((h, idx) => (
                                    <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                                        {h.dia.slice(0,3)} {h.horaInicio}-{h.horaTermino}
                                    </span>
                                ))}
                            </div>
                         </div>
                      )}

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

                      {electivo.ayudante && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                          <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span><span className="font-semibold">Ayudante:</span> {electivo.ayudante}</span>
                        </div>
                      )}

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

export default InscribirElectivo;