import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import electivoService from '../../services/electivo.service';
import ConfirmModal from '../../components/ConfirmModal';
import SuccessModal from '../../components/SuccessModal';

const Solicitudes = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Tabs: 0 = Electivos, 1 = Inscripciones
  const [activeTab, setActiveTab] = useState(0); 
  
  // Datos
  const [allElectivos, setAllElectivos] = useState([]); 
  const [filteredElectivos, setFilteredElectivos] = useState([]); 
  const [loading, setLoading] = useState(true);

  // --- FILTROS ---
  const [filterStatus, setFilterStatus] = useState('PENDIENTE'); 
  const [filterPeriod, setFilterPeriod] = useState('TODOS'); 
  const [availablePeriods, setAvailablePeriods] = useState([]); 

  // Estados de Interfaz
  const [selectedElectivo, setSelectedElectivo] = useState(null); 
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Configuraciones de Modales Dinámicos
  const [confirmConfig, setConfirmConfig] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    action: null,
    confirmText: 'Confirmar', 
    confirmColor: 'blue'
  });
  const [successConfig, setSuccessConfig] = useState({ isOpen: false, title: '', message: '' });
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  
  // ID temporal para cuando estamos rechazando
  const [rejectingId, setRejectingId] = useState(null); 

  // --- 1. CARGAR DATOS ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await electivoService.getAllElectivosAdmin();
      setAllElectivos(data);
      
      const periods = [...new Set(data.map(e => `${e.anio}-${e.semestre}`))].sort().reverse();
      setAvailablePeriods(periods);

      applyFilters(data, filterStatus, filterPeriod);
    } catch (error) {
      console.error("Error cargando solicitudes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 0) fetchData();
  }, [activeTab]);

  // --- 2. LÓGICA DE FILTRADO ---
  const applyFilters = (data, status, period) => {
    let result = data;
    if (status !== 'TODOS') result = result.filter(e => e.status === status);
    if (period !== 'TODOS') result = result.filter(e => `${e.anio}-${e.semestre}` === period);
    setFilteredElectivos(result);
  };

  const handleFilterStatusChange = (status) => {
    setFilterStatus(status);
    applyFilters(allElectivos, status, filterPeriod);
  };

  const handleFilterPeriodChange = (period) => {
    setFilterPeriod(period);
    applyFilters(allElectivos, filterStatus, period);
  };

  // --- 3. LÓGICA DE CAMBIO DE ESTADO ---
  const handleStatusChange = async (id, newStatus, reason = null) => {
    try {
      setActionLoading(true);
      await electivoService.reviewElectivo(id, newStatus, reason);
      
      const updatedList = allElectivos.map(e => e.id === id ? { ...e, status: newStatus, motivo_rechazo: reason } : e);
      setAllElectivos(updatedList);
      applyFilters(updatedList, filterStatus, filterPeriod);
      
      setSelectedElectivo(null);
      setIsRejectModalOpen(false);
      setRejectingId(null);
      setConfirmConfig({ ...confirmConfig, isOpen: false });

      let successTitle = "Operación Exitosa";
      let successMsg = "El estado del electivo ha sido actualizado.";
      
      if (newStatus === "APROBADO") {
        successTitle = "¡Electivo Aprobado!";
        successMsg = "El electivo ahora es visible para los alumnos.";
      } else if (newStatus === "RECHAZADO") {
        successTitle = "Electivo Rechazado";
        successMsg = "Se ha registrado el rechazo y el motivo.";
      } else if (newStatus === "PENDIENTE") {
        successTitle = "Estado Revertido";
        successMsg = "El electivo ha vuelto al estado Pendiente.";
      }

      setSuccessConfig({ isOpen: true, title: successTitle, message: successMsg });

    } catch (error) {
      alert(error.message || "Error al procesar la solicitud.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- 4. DESCARGAR SYLLABUS ---
  const handleDescargarSyllabus = async (electivo) => {
    try {
      // Llamamos al servicio que devuelve un BLOB
      const blob = await electivoService.descargarSyllabus(electivo.id);
      
      // Creamos una URL temporal
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      // Usamos el nombre guardado o uno genérico
      link.setAttribute('download', electivo.syllabusName || `Syllabus-${electivo.titulo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      alert("Error al descargar el syllabus: " + error.message);
    }
  };

  // --- 5. PREPARADORES DE MODALES ---
  const openApproveConfirm = (electivo) => {
    setSelectedElectivo(null);
    setConfirmConfig({
      isOpen: true,
      title: "¿Aprobar Electivo?",
      message: `Estás a punto de aprobar "${electivo.titulo}". Esto lo habilitará inmediatamente.`,
      confirmText: "Aprobar",
      confirmColor: "green",
      action: () => handleStatusChange(electivo.id, "APROBADO")
    });
  };

  const openRevertConfirm = (electivo) => {
    setSelectedElectivo(null);
    setConfirmConfig({
      isOpen: true,
      title: "¿Cambiar a Pendiente?",
      message: `El electivo "${electivo.titulo}" volverá a estado PENDIENTE.`,
      confirmText: "Confirmar Cambio",
      confirmColor: "blue",
      action: () => handleStatusChange(electivo.id, "PENDIENTE")
    });
  };

  const openRejectModalUI = (electivo) => {
    setSelectedElectivo(null);
    setRejectingId(electivo.id); 
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) return alert("Debes escribir una razón.");
    handleStatusChange(rejectingId, "RECHAZADO", rejectReason);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APROBADO': return 'bg-green-100 text-green-700 border-green-200';
      case 'RECHAZADO': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.action}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText} 
        confirmColor={confirmConfig.confirmColor} 
      />

      <SuccessModal 
        isOpen={successConfig.isOpen}
        onClose={() => setSuccessConfig({ ...successConfig, isOpen: false })}
        title={successConfig.title}
        message={successConfig.message}
      />

      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/jefe/dashboard')} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
              <h1 className="text-xl font-bold text-gray-800">Gestión de Solicitudes</h1>
            </div>
            <button onClick={logout} className="text-sm font-medium text-red-600 hover:text-red-800">Cerrar Sesión</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* TABS */}
        <div className="flex space-x-1 rounded-xl bg-gray-200 p-1 mb-6 max-w-md">
          <button onClick={() => setActiveTab(0)} className={`w-full rounded-lg py-2.5 text-sm font-medium transition-all ${activeTab === 0 ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:text-blue-600'}`}>
            Propuestas Electivos
          </button>
          <button onClick={() => setActiveTab(1)} className={`w-full rounded-lg py-2.5 text-sm font-medium transition-all ${activeTab === 1 ? 'bg-white text-purple-700 shadow' : 'text-gray-600 hover:text-purple-600'}`}>
            Inscripciones Alumnos
          </button>
        </div>

        {/* TAB ELECTIVOS */}
        {activeTab === 0 && (
            <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex gap-2 overflow-x-auto pb-1 w-full md:w-auto scrollbar-hide">
                        {['PENDIENTE', 'APROBADO', 'RECHAZADO', 'TODOS'].map((status) => (
                            <button
                                key={status}
                                onClick={() => handleFilterStatusChange(status)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-colors border shadow-sm whitespace-nowrap ${
                                    filterStatus === status 
                                    ? 'bg-gray-800 text-white border-gray-800' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Periodo:</span>
                        <select 
                            value={filterPeriod}
                            onChange={(e) => handleFilterPeriodChange(e.target.value)}
                            className="bg-transparent border-none text-gray-700 text-sm font-medium focus:ring-0 cursor-pointer outline-none"
                        >
                            <option value="TODOS">Todos los periodos</option>
                            {availablePeriods.map(period => (
                                <option key={period} value={period}>{period}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredElectivos.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="text-4xl mb-3">📭</div>
                            <p>No se encontraron electivos con los filtros seleccionados.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredElectivos.map((electivo) => (
                                <div key={electivo.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-4 justify-between items-start md:items-center animate-fade-in">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getStatusColor(electivo.status)}`}>
                                                {electivo.status}
                                            </span>
                                            <span className="text-xs text-gray-600 font-medium px-2 py-0.5 bg-gray-100 rounded border border-gray-200 flex items-center gap-1">
                                                {electivo.anio}-{electivo.semestre}
                                            </span>
                                            {/* Mostrar Código Electivo Aquí también */}
                                            <span className="text-xs text-gray-500 font-mono px-2 py-0.5 bg-gray-100 rounded border border-gray-200">
                                                COD: {electivo.codigoElectivo}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{electivo.titulo}</h3>
                                        <p className="text-sm text-gray-600 mt-1 mb-3">Profesor: <span className="font-medium text-gray-900">{electivo.profesor?.nombre || "Desconocido"}</span></p>
                                    </div>
                                    <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                                        <button onClick={() => setSelectedElectivo(electivo)} className="w-full md:w-auto px-5 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200">
                                            Ver Detalles y Gestionar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </>
        )}

        {activeTab === 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
                <p>Aquí aparecerán las solicitudes de inscripción de los alumnos (Próximamente).</p>
            </div>
        )}

      </main>

      {/* --- MODAL DETALLES COMPLETO --- */}
      {selectedElectivo && !isRejectModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white rounded-2xl w-full max-w-3xl p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all scale-100">
                <button onClick={() => setSelectedElectivo(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 text-xl">✕</button>
                
                {/* CABECERA */}
                <div className="mb-6 border-b border-gray-100 pb-4">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getStatusColor(selectedElectivo.status)}`}>
                            {selectedElectivo.status}
                        </span>
                        <span className="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded">
                            {selectedElectivo.anio} - Semestre {selectedElectivo.semestre}
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedElectivo.titulo}</h2>
                    <p className="text-gray-500 text-sm mt-1">Propuesto por: <span className="font-semibold text-gray-700">{selectedElectivo.profesor?.nombre}</span></p>
                </div>

                <div className="space-y-6">
                    {/* ALERTA DE RECHAZO */}
                    {selectedElectivo.status === 'RECHAZADO' && selectedElectivo.motivo_rechazo && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                            <h4 className="font-bold text-red-700 text-sm mb-1">Motivo del Rechazo:</h4>
                            <p className="text-red-600 text-sm">{selectedElectivo.motivo_rechazo}</p>
                        </div>
                    )}

                    {/* INFORMACIÓN BÁSICA (GRID) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="block text-xs font-bold text-gray-400 uppercase">Código</span>
                            <span className="text-gray-800 font-mono font-medium">{selectedElectivo.codigoElectivo}</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="block text-xs font-bold text-gray-400 uppercase">Sala</span>
                            <span className="text-gray-800 font-medium">{selectedElectivo.sala}</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="block text-xs font-bold text-gray-400 uppercase">Ayudante</span>
                            <span className="text-gray-800 font-medium">{selectedElectivo.ayudante || "Sin asignar"}</span>
                        </div>
                    </div>

                    {/* OBSERVACIONES (ANTES DESCRIPCIÓN) */}
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">Observaciones / Descripción</h4>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                             {/* AQUÍ ESTABA EL ERROR: Se llama 'observaciones', no 'descripcion' */}
                             {selectedElectivo.observaciones || "Sin observaciones."}
                        </p>
                    </div>

                     {/* REQUISITOS */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">Requisitos Previos</h4>
                        <p className="text-gray-700 text-sm">{selectedElectivo.requisitos || "Ninguno"}</p>
                    </div>

                    {/* GRID DE CUPOS Y HORARIOS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* COLUMNA 1: HORARIOS */}
                        <div className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm">
                            <h4 className="font-bold text-xs text-orange-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Horarios
                            </h4>
                            {selectedElectivo.horarios && selectedElectivo.horarios.length > 0 ? (
                                <ul className="space-y-2">
                                    {selectedElectivo.horarios.map((h, idx) => (
                                        <li key={idx} className="flex justify-between text-sm border-b border-orange-50 pb-2 last:border-0 last:pb-0">
                                            <span className="font-medium text-gray-700">{h.dia}</span>
                                            <span className="text-gray-600 bg-orange-50 px-2 rounded">{h.horaInicio} - {h.horaTermino}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No hay horarios registrados.</p>
                            )}
                        </div>

                        {/* COLUMNA 2: CUPOS */}
                        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                            <h4 className="font-bold text-xs text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                Cupos por Carrera
                            </h4>
                            {selectedElectivo.cuposPorCarrera && selectedElectivo.cuposPorCarrera.length > 0 ? (
                                <ul className="space-y-2">
                                    {selectedElectivo.cuposPorCarrera.map((c, idx) => (
                                        <li key={idx} className="flex justify-between text-sm border-b border-blue-50 pb-2 last:border-0 last:pb-0">
                                            <span className="text-gray-700 truncate max-w-[150px]" title={c.carrera}>{c.carrera}</span>
                                            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{c.cupos}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No hay cupos registrados.</p>
                            )}
                        </div>
                    </div>

                    {/* BOTÓN DESCARGA SYLLABUS */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-1">Documentación</h4>
                            <p className="text-sm text-gray-600">Syllabus del curso (PDF)</p>
                        </div>
                        <button 
                            onClick={() => handleDescargarSyllabus(selectedElectivo)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Descargar
                        </button>
                    </div>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="mt-8 flex gap-3 justify-end pt-4 border-t border-gray-100 sticky bottom-0 bg-white">
                    <button onClick={() => setSelectedElectivo(null)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">Cerrar</button>
                    
                    {selectedElectivo.status === 'PENDIENTE' && (
                        <>
                            <button onClick={() => openRejectModalUI(selectedElectivo)} className="px-5 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors">Rechazar</button>
                            <button onClick={() => openApproveConfirm(selectedElectivo)} className="px-6 py-2.5 bg-green-600 text-white hover:bg-green-700 rounded-xl font-medium shadow-md transition-colors">Aprobar Propuesta</button>
                        </>
                    )}

                    {selectedElectivo.status === 'APROBADO' && (
                        <button onClick={() => openRevertConfirm(selectedElectivo)} className="px-5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl font-medium transition-colors">
                            Cancelar Aprobación
                        </button>
                    )}

                    {selectedElectivo.status === 'RECHAZADO' && (
                        <>
                            <button onClick={() => openRevertConfirm(selectedElectivo)} className="px-5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl font-medium transition-colors">
                                Volver a Pendiente
                            </button>
                            <button onClick={() => openApproveConfirm(selectedElectivo)} className="px-6 py-2.5 bg-green-600 text-white hover:bg-green-700 rounded-xl font-medium shadow-md transition-colors">
                                Reconsiderar y Aprobar
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL DE RECHAZO (Sin cambios) --- */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 transform transition-all scale-100 shadow-2xl">
                <div className="flex items-center gap-3 mb-4 text-red-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <h3 className="text-xl font-bold">Rechazar Propuesta</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">Indica la razón para que el profesor pueda corregir:</p>
                <textarea 
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none bg-gray-50"
                    rows="4"
                    placeholder="Ej: Faltan detalles en el syllabus..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                ></textarea>
                <div className="flex gap-3 mt-6 justify-end">
                    <button onClick={() => setIsRejectModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancelar</button>
                    <button onClick={confirmReject} disabled={actionLoading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-md transition-colors">{actionLoading ? "Enviando..." : "Confirmar Rechazo"}</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Solicitudes;