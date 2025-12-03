import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import electivoService from '../../services/electivo.service.js';
import ConfirmModal from '../../components/ConfirmModal.jsx';

const MyElectivos = () => {
  const navigate = useNavigate();
  const [electivos, setElectivos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el modal de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedElectivoId, setSelectedElectivoId] = useState(null);

  // Estado para el Toast
  const [showToast, setShowToast] = useState(false);

  const fetchElectivos = async () => {
    try {
      const data = await electivoService.getMyElectivos();
      setElectivos(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElectivos();
  }, []);

  const openDeleteModal = (id) => {
    setSelectedElectivoId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedElectivoId) return;
    try {
      await electivoService.deleteElectivo(selectedElectivoId);
      setElectivos(electivos.filter(e => e.id !== selectedElectivoId)); 
      setDeleteModalOpen(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APROBADO': return 'bg-green-100 text-green-700 border-green-200';
      case 'RECHAZADO': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-white border-l-4 border-green-500 shadow-2xl rounded-r-lg p-4 transform transition-all duration-500 animate-bounce-in">
          <div className="bg-green-100 rounded-full p-2">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-sm">¡Eliminado!</h4>
            <p className="text-gray-500 text-xs">El electivo ha sido eliminado correctamente.</p>
          </div>
          <button onClick={() => setShowToast(false)} className="ml-4 text-gray-400 hover:text-gray-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar Electivo?"
        message="Esta acción no se puede deshacer. El electivo se borrará permanentemente."
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Electivos</h1>
            <p className="text-gray-500 mt-1">Gestiona las asignaturas que has propuesto.</p>
          </div>
          <button 
            onClick={() => navigate('/profesor/dashboard')}
            className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Panel
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : electivos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="text-gray-400 mb-4 text-6xl">📭</div>
            <h3 className="text-lg font-medium text-gray-900">No tienes electivos creados</h3>
            <p className="text-gray-500 mt-2 mb-6">Comienza creando tu primera propuesta.</p>
            <button 
              onClick={() => navigate('/profesor/crear-electivo')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md"
            >
              Crear Nuevo
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {electivos.map((electivo) => (
              <div key={electivo.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col hover:-translate-y-1">
                <div className="p-6 flex-grow">
                  {/* Header Tarjeta */}
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getStatusColor(electivo.status)}`}>
                      {electivo.status}
                    </span>
                    <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded">
                        {electivo.periodo || "Sin periodo"}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2" title={electivo.titulo}>
                    {electivo.titulo}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {electivo.descripcion}
                  </p>
                  
                  {/* --- SECCIÓN NUEVA: AYUDANTE --- */}
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

                  {/* --- SECCIÓN NUEVA: DESGLOSE DE CUPOS --- */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cupos por Carrera</p>
                        {/* Total calculado dinámicamente si no existe */}
                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            Total: {electivo.cuposPorCarrera?.reduce((acc, curr) => acc + curr.cupos, 0) || 0}
                        </span>
                    </div>
                    
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                      {electivo.cuposPorCarrera && electivo.cuposPorCarrera.length > 0 ? (
                        electivo.cuposPorCarrera.map((cupo) => (
                          <div key={cupo.id} className="flex justify-between items-center text-sm bg-gray-50 px-2 py-1.5 rounded border border-gray-100">
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

                </div>

                {/* Acciones */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex gap-3">
                  <button 
                    onClick={() => navigate(`/profesor/editar-electivo/${electivo.id}`)}
                    className="flex-1 py-2 text-sm font-medium text-blue-600 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => openDeleteModal(electivo.id)}
                    className="flex-1 py-2 text-sm font-medium text-red-600 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyElectivos;