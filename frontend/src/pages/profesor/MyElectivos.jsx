import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import electivoService from '../../services/electivo.service.js'; // Importación explícita
import ConfirmModal from '../../components/ConfirmModal.jsx';     // Importación explícita

const MyElectivos = () => {
  const navigate = useNavigate();
  const [electivos, setElectivos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el modal de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedElectivoId, setSelectedElectivoId] = useState(null);

  // Cargar datos
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

  // Manejadores de Eliminación
  const openDeleteModal = (id) => {
    setSelectedElectivoId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedElectivoId) return;
    try {
      await electivoService.deleteElectivo(selectedElectivoId);
      setElectivos(electivos.filter(e => e.id !== selectedElectivoId)); // Actualizar UI
      setDeleteModalOpen(false);
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  // Helper para color de estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'APROBADO': return 'bg-green-100 text-green-700 border-green-200';
      case 'RECHAZADO': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      {/* Modal de Confirmación */}
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
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getStatusColor(electivo.status)}`}>
                      {electivo.status}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">ID: {electivo.id}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{electivo.titulo}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-3">{electivo.descripcion}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 gap-4 mt-auto">
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      {electivo.cupos_totales} Cupos
                    </span>
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