import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import electivoService from '../../services/electivo.service';
import SuccessModal from '../../components/SuccessModal'; // Asegúrate de tener este componente creado

const CreateElectivo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estado para controlar el Modal de Éxito
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    cupos: '',
    requisitos: '',
    ayudante: '',
    descripcion: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Enviamos los datos al backend
      await electivoService.createElectivo(formData);
      
      // AL TERMINAR CON ÉXITO:
      setLoading(false);
      setShowModal(true); // ¡Mostramos el modal en vez de redirigir al instante!
      
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al crear el electivo. Intenta nuevamente.");
      setLoading(false);
    }
  };

  // Función que se ejecuta al cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false);
    navigate('/profesor/dashboard'); // Ahora sí redirigimos
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans relative">
      
      {/* --- INTEGRACIÓN DEL MODAL --- */}
      <SuccessModal 
        isOpen={showModal}
        onClose={handleCloseModal}
        title="¡Propuesta Creada!"
        message="El electivo se ha registrado exitosamente en el sistema. Quedará en estado 'Pendiente' hasta que el Jefe de Carrera lo apruebe."
      />

      <div className="max-w-4xl mx-auto">
        
        {/* Encabezado con botón de volver */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Nuevo Electivo</h1>
            <p className="mt-2 text-sm text-gray-500">
              Completa la ficha técnica para proponer una nueva asignatura electiva.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => navigate('/profesor/dashboard')}
            className="group flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-all duration-200 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Panel
          </button>
        </div>

        {/* Tarjeta del Formulario */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

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
                      placeholder="Ej: Inteligencia Artificial Avanzada"
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
                      placeholder="Ej: 30"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                      value={formData.cupos}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ayudante <span className="text-gray-400 font-normal text-xs ml-1">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      name="ayudante"
                      placeholder="Ej: Carlos Pérez"
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
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="requisitos"
                        required
                        placeholder="Ej: Haber aprobado Base de Datos"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                        value={formData.requisitos}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Syllabus</label>
                    <textarea
                      name="descripcion"
                      required
                      rows="6"
                      placeholder="Describe los objetivos, metodología y contenidos principales del electivo..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none bg-gray-50 focus:bg-white"
                      value={formData.descripcion}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-6 flex items-center justify-end gap-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate('/profesor/dashboard')}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-8 py-3 text-sm font-bold text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    loading 
                      ? 'bg-blue-400 cursor-wait' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </span>
                  ) : (
                    'Crear Propuesta'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateElectivo;