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
  const [allElectivos, setAllElectivos] = useState([]); 
  const [filteredElectivos, setFilteredElectivos] = useState([]); 
  const [filterStatus, setFilterStatus] = useState('PENDIENTE'); 
  const [loading, setLoading] = useState(true);

  // Estados para Interfaz
  const [selectedElectivo, setSelectedElectivo] = useState(null); 
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Estados para Modales Personalizados
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', action: null });
  const [successConfig, setSuccessConfig] = useState({ isOpen: false, title: '', message: '' });
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // --- CARGA DE DATOS ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await electivoService.getAllElectivosAdmin();
      setAllElectivos(data);
      applyFilter(data, filterStatus);
    } catch (error) {
      console.error("Error cargando solicitudes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 0) fetchData();
  }, [activeTab]);

  // --- FILTROS ---
  const applyFilter = (data, status) => {
    if (status === 'TODOS') {
      setFilteredElectivos(data);
    } else {
      setFilteredElectivos(data.filter(e => e.status === status));
    }
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    applyFilter(allElectivos, status);
  };

  // --- LÓGICA DE ACCIONES ---

  const handleStatusChange = async (id, newStatus, reason = null) => {
    try {
      setActionLoading(true);
      await electivoService.reviewElectivo(id, newStatus, reason);
      
      // Actualizar estado local
      const updatedList = allElectivos.map(e => e.id === id ? { ...e, status: newStatus, motivo_rechazo: reason } : e);
      setAllElectivos(updatedList);
      applyFilter(updatedList, filterStatus);
      
      // Cerrar modales de trabajo
      setSelectedElectivo(null);
      setIsRejectModalOpen(false);
      setConfirmConfig({ ...confirmConfig, isOpen: false });

      // Mostrar éxito
      let successTitle = "¡Operación Exitosa!";
      let successMsg = "El estado del electivo ha sido actualizado.";
      
      if (newStatus === "APROBADO") {
        successTitle = "¡Electivo Aprobado!";
        successMsg = "El electivo ahora es visible para los alumnos.";
      } else if (newStatus === "RECHAZADO") {
        successTitle = "Electivo Rechazado";
        successMsg = "Se ha notificado el motivo del rechazo.";
      } else if (newStatus === "PENDIENTE") {
        successTitle = "Estado Revertido";
        successMsg = "El electivo ha vuelto al estado Pendiente.";
      }

      setSuccessConfig({
        isOpen: true,
        title: successTitle,
        message: successMsg
      });

    } catch (error) {
      alert(error.message || "Error al procesar la solicitud.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- PREPARAR CONFIRMACIONES ---

  const openApproveConfirm = (electivo) => {
    setConfirmConfig({
      isOpen: true,
      title: "¿Aprobar Electivo?",
      message: `Estás a punto de aprobar "${electivo.titulo}". Esto lo hará visible para inscripción.`,
      action: () => handleStatusChange(electivo.id, "APROBADO")
    });
  };

  const openRevertConfirm = (electivo) => {
    setConfirmConfig({
      isOpen: true,
      title: "¿Cancelar Aprobación?",
      message: `El electivo "${electivo.titulo}" volverá a estado PENDIENTE y dejará de ser visible para los alumnos.`,
      action: () => handleStatusChange(electivo.id, "PENDIENTE")
    });
  };

  const openRejectModalUI = (electivo) => {
    setSelectedElectivo(electivo);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) return alert("Debes escribir una razón.");
    // Usamos el confirm modal también para el rechazo final por seguridad
    setConfirmConfig({
      isOpen: true,
      title: "¿Confirmar Rechazo?",
      message: "Se enviará el motivo al profesor y el electivo quedará como rechazado.",
      action: () => handleStatusChange(selectedElectivo.id, "RECHAZADO", rejectReason)
    });
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
      
      {/* MODAL DE CONFIRMACIÓN */}
      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.action}
        title={confirmConfig.title}
        message={confirmConfig.message}
      />

      {/* MODAL DE ÉXITO */}
      <SuccessModal 
        isOpen={successConfig.isOpen}
        onClose={() => setSuccessConfig({ ...successConfig, isOpen: false })}
        title={successConfig.title}
        message={successConfig.message}
      />

      {/* NAVBAR */}
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
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['PENDIENTE', 'APROBADO', 'RECHAZADO', 'TODOS'].map((status) => (
                        <button
                            key={status}
                            onClick={() => handleFilterChange(status)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors border ${
                                filterStatus === status 
                                ? 'bg-gray-800 text-white border-gray-800' 
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredElectivos.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="text-4xl mb-3">📭</div>
                            <p>No hay solicitudes en estado <strong>{filterStatus}</strong>.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredElectivos.map((electivo) => (
                                <div key={electivo.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getStatusColor(electivo.status)}`}>
                                                {electivo.status}
                                            </span>
                                            <span className="text-xs text-gray-500 font-medium px-2 py-0.5 bg-gray-100 rounded">
                                                {electivo.periodo}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">{electivo.titulo}</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Profesor: <span className="font-medium text-gray-800">{electivo.profesor?.nombre || "Desconocido"}</span>
                                        </p>
                                    </div>
                                    <div className="flex gap-3 w-full md:w-auto">
                                        {/* Solo mostramos Ver Detalles en la lista, las acciones van dentro */}
                                        <button 
                                            onClick={() => setSelectedElectivo(electivo)}
                                            className="w-full md:w-auto px-5 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                                        >
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

        {/* TAB INSCRIPCIONES (Placeholder) */}
        {activeTab === 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
                <p>Aquí aparecerán las solicitudes de inscripción de los alumnos (Próximamente).</p>
            </div>
        )}

      </main>

      {/* --- MODAL DE DETALLES --- */}
      {selectedElectivo && !isRejectModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl">
                <button onClick={() => setSelectedElectivo(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 text-xl">✕</button>
                
                <div className="mb-6 border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getStatusColor(selectedElectivo.status)}`}>
                            {selectedElectivo.status}
                        </span>
                        <span className="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded">{selectedElectivo.periodo}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedElectivo.titulo}</h2>
                    <p className="text-gray-500 text-sm mt-1">Propuesto por: <span className="font-semibold text-gray-700">{selectedElectivo.profesor?.nombre}</span></p>
                </div>

                <div className="space-y-5">
                    {/* Mensaje de rechazo si existe */}
                    {selectedElectivo.status === 'RECHAZADO' && selectedElectivo.motivo_rechazo && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                            <h4 className="font-bold text-red-700 text-sm mb-1">Motivo del Rechazo:</h4>
                            <p className="text-red-600 text-sm">{selectedElectivo.motivo_rechazo}</p>
                        </div>
                    )}

                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">Descripción</h4>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{selectedElectivo.descripcion}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">Requisitos</h4>
                            <p className="text-gray-700 text-sm">{selectedElectivo.requisitos}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">Ayudante</h4>
                            <p className="text-gray-700 text-sm">{selectedElectivo.ayudante || "Sin asignar"}</p>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                        <h4 className="font-bold text-xs text-blue-500 uppercase tracking-wider mb-3">Distribución de Cupos</h4>
                        <ul className="space-y-2">
                            {selectedElectivo.cuposPorCarrera?.map((c, idx) => (
                                <li key={idx} className="flex justify-between text-sm border-b border-blue-100 pb-2 last:border-0 last:pb-0">
                                    <span className="text-gray-700">{c.carrera}</span>
                                    <span className="font-bold text-blue-700 bg-white px-2 py-0.5 rounded shadow-sm">{c.cupos} cupos</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* BOTONES DE ACCIÓN DENTRO DEL DETALLE */}
                <div className="mt-8 flex gap-3 justify-end pt-4 border-t border-gray-100">
                    <button onClick={() => setSelectedElectivo(null)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">Cerrar</button>
                    
                    {/* CASO 1: Está PENDIENTE -> Mostrar Aprobar/Rechazar */}
                    {selectedElectivo.status === 'PENDIENTE' && (
                        <>
                            <button onClick={() => openRejectModalUI(selectedElectivo)} className="px-5 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors">Rechazar</button>
                            <button onClick={() => openApproveConfirm(selectedElectivo)} className="px-6 py-2.5 bg-green-600 text-white hover:bg-green-700 rounded-xl font-medium shadow-md transition-colors">Aprobar Propuesta</button>
                        </>
                    )}

                    {/* CASO 2: Está APROBADO -> Mostrar Cancelar Aprobación */}
                    {selectedElectivo.status === 'APROBADO' && (
                        <button onClick={() => openRevertConfirm(selectedElectivo)} className="px-5 py-2.5 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300 rounded-xl font-medium transition-colors">
                            Cancelar Aprobación (Volver a Pendiente)
                        </button>
                    )}

                    {/* CASO 3: Está RECHAZADO -> Mostrar Reconsiderar (Aprobar) */}
                    {selectedElectivo.status === 'RECHAZADO' && (
                        <button onClick={() => openApproveConfirm(selectedElectivo)} className="px-6 py-2.5 bg-green-600 text-white hover:bg-green-700 rounded-xl font-medium shadow-md transition-colors">
                            Reconsiderar y Aprobar
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL DE RECHAZO (INPUT) --- */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 transform transition-all scale-100 shadow-2xl">
                <div className="flex items-center gap-3 mb-4 text-red-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <h3 className="text-xl font-bold">Rechazar Propuesta</h3>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">
                    Indica la razón para que el profesor pueda corregir:
                </p>
                
                <textarea 
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none bg-gray-50"
                    rows="4"
                    placeholder="Ej: Faltan detalles en el syllabus..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                ></textarea>

                <div className="flex gap-3 mt-6 justify-end">
                    <button 
                        onClick={() => setIsRejectModalOpen(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={confirmReject}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-md transition-colors"
                    >
                        {actionLoading ? "Enviando..." : "Confirmar Rechazo"}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Solicitudes;