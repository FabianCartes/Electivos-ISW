import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import electivoService from '../../services/electivo.service';
import SuccessModal from '../../components/SuccessModal';

const EditElectivo = () => {
  const { id } = useParams(); // Obtenemos el ID de la URL
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true); // Cargando datos iniciales
  const [saving, setSaving] = useState(false);  // Guardando cambios
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    cupos: '', // Nota: El input usa 'cupos', el backend puede devolver 'cupos_totales'
    requisitos: '',
    ayudante: '',
    descripcion: ''
  });

  // 1. Cargar datos del electivo al iniciar
  useEffect(() => {
    const fetchElectivo = async () => {
      try {
        const data = await electivoService.getElectivoById(id);
        if (data) {
          setFormData({
            titulo: data.titulo,
            cupos: data.cupos_totales, // Mapeamos cupos_totales a cupos
            requisitos: data.requisitos,
            ayudante: data.ayudante || '',
            descripcion: data.descripcion
          });
        }
      } catch (error) {
        console.error("Error al cargar", error);
        alert("No se pudo cargar la información del electivo.");
        navigate('/profesor/mis-electivos');
      } finally {
        setLoading(false);
      }
    };
    fetchElectivo();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Adaptamos el nombre del campo para que coincida con lo que espera el backend
      const dataToSend = { 
        ...formData, 
        cupos_totales: formData.cupos 
      };
      
      await electivoService.updateElectivo(id, dataToSend);
      
      setSaving(false);
      setShowModal(true); // Mostrar modal de éxito
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al actualizar el electivo.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando información del electivo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      <SuccessModal 
        isOpen={showModal}
        onClose={() => navigate('/profesor/mis-electivos')}
        title="¡Cambios Guardados!"
        message="La información del electivo ha sido actualizada exitosamente."
      />

      <div className="max-w-4xl mx-auto">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Editar Electivo</h1>
            <p className="mt-2 text-sm text-gray-500">
              Modifica los detalles de la asignatura seleccionada.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => navigate('/profesor/mis-electivos')}
            className="group flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-all duration-200 shadow-sm"
          >
            Cancelar
          </button>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-yellow-400 to-orange-500"></div> {/* Barra de color diferente para distinguir Edición */}

          <div className="p-8">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center animate-pulse">
                <svg className="h-5 w-5 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-red-700 font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Sección 1: Información Básica */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">1</span>
                  Información General
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Asignatura</label>
                    <input
                      type="text"
                      name="titulo"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                      value={formData.titulo}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cupos Totales</label>
                    <input
                      type="number"
                      name="cupos"
                      required
                      min="1"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                      value={formData.cupos}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ayudante</label>
                    <input
                      type="text"
                      name="ayudante"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                      value={formData.ayudante}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Sección 2: Detalles Académicos */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">2</span>
                  Detalles Académicos
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Requisitos Previos</label>
                    <input
                      type="text"
                      name="requisitos"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                      value={formData.requisitos}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Syllabus</label>
                    <textarea
                      name="descripcion"
                      required
                      rows="6"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none bg-gray-50 focus:bg-white"
                      value={formData.descripcion}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="pt-6 flex items-center justify-end gap-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate('/profesor/mis-electivos')}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-8 py-3 text-sm font-bold text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    saving 
                      ? 'bg-blue-400 cursor-wait' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                    </span>
                  ) : 'Guardar Cambios'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditElectivo;