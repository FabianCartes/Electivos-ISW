import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import electivoService from '../../services/electivo.service';
import SuccessModal from '../../components/SuccessModal';

const CARRERAS_DISPONIBLES = [
  "Ingeniería Civil en Informática",
  "Ingeniería de Ejecución en Computación",
  "Ingeniería Civil Industrial",
  "Ingeniería Comercial",
  "Otras"
];

const EditElectivo = () => {
  const { id } = useParams(); // Obtenemos el ID de la URL
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true); // Cargando datos iniciales
  const [saving, setSaving] = useState(false);  // Guardando cambios
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Estado para datos básicos
  const [formData, setFormData] = useState({
    titulo: '',
    periodo: '',
    requisitos: '',
    ayudante: '',
    descripcion: ''
  });

  // Estado para la lista dinámica de cupos
  const [cuposList, setCuposList] = useState([]);

  // Estados para el archivo PDF del syllabus
  const [syllabusPDF, setSyllabusPDF] = useState(null);
  const [pdfError, setPdfError] = useState('');
  const [existingSyllabusNombre, setExistingSyllabusNombre] = useState('');

  // 1. CARGAR DATOS AL INICIAR
  useEffect(() => {
    const fetchElectivo = async () => {
      try {
        const data = await electivoService.getElectivoById(id);
        if (data) {
          // Llenar datos básicos
          setFormData({
            titulo: data.titulo,
            periodo: data.periodo || '',
            requisitos: data.requisitos,
            ayudante: data.ayudante || '',
            descripcion: data.descripcion
          });

          // Llenar lista de cupos (si existe la relación en la BD)
          if (data.cuposPorCarrera && data.cuposPorCarrera.length > 0) {
            setCuposList(data.cuposPorCarrera.map(c => ({
              carrera: c.carrera,
              cupos: c.cupos
            })));
          } else {
            // Fallback por si es un dato antiguo sin cupos detallados
            setCuposList([{ carrera: '', cupos: '' }]);
          }

          // Guardar el nombre del syllabus existente
          if (data.syllabusNombre) {
            setExistingSyllabusNombre(data.syllabusNombre);
          }
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

  const handlePDFChange = (e) => {
    const file = e.target.files?.[0];
    setPdfError('');

    if (!file) {
      setSyllabusPDF(null);
      return;
    }

    if (file.type !== 'application/pdf') {
      setPdfError('El archivo debe ser un PDF válido');
      e.target.value = '';
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setPdfError('El PDF no debe superar 10MB');
      e.target.value = '';
      return;
    }

    setSyllabusPDF(file);
  };

  // --- MANEJO DE LISTA DINÁMICA DE CUPOS ---
  const handleCupoChange = (index, field, value) => {
    const newList = [...cuposList];
    newList[index][field] = value;
    setCuposList(newList);
  };

  const addCupoRow = () => {
    setCuposList([...cuposList, { carrera: '', cupos: '' }]);
  };

  const removeCupoRow = (index) => {
    if (cuposList.length > 1) {
      const newList = cuposList.filter((_, i) => i !== index);
      setCuposList(newList);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!syllabusPDF) {
      setError('Debes seleccionar un archivo PDF del syllabus');
      setSaving(false);
      return;
    }

    try {
      // Validamos que haya al menos una carrera con cupos
      const validCuposList = cuposList.filter(item => item.carrera && item.cupos);
      
      if (validCuposList.length === 0) {
        throw new Error("Debes asignar cupos a al menos una carrera.");
      }

      const formDataToSend = new FormData();
      formDataToSend.append('titulo', formData.titulo);
      formDataToSend.append('periodo', formData.periodo);
      formDataToSend.append('requisitos', formData.requisitos);
      formDataToSend.append('ayudante', formData.ayudante);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('cuposList', JSON.stringify(validCuposList));
      formDataToSend.append('syllabusPDF', syllabusPDF);
      
      await electivoService.updateElectivo(id, formDataToSend);
      
      setSaving(false);
      setShowModal(true);
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans relative">
      
      <SuccessModal 
        isOpen={showModal}
        onClose={() => navigate('/profesor/mis-electivos')}
        title="¡Cambios Guardados!"
        message="La información del electivo y sus cupos han sido actualizados exitosamente."
      />

      <div className="max-w-4xl mx-auto">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Editar Electivo</h1>
            <p className="mt-2 text-sm text-gray-500">Modifica los detalles de la asignatura.</p>
          </div>
          <button 
            type="button"
            onClick={() => navigate('/profesor/mis-electivos')}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-yellow-400 to-orange-500"></div>

          <div className="p-8">
            {error && (
              <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg text-sm border-l-4 border-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* 1. INFO GENERAL */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">1. Información General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Asignatura</label>
                    <input type="text" name="titulo" required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.titulo} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Periodo Académico</label>
                    <input type="text" name="periodo" required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.periodo} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ayudante</label>
                    <input type="text" name="ayudante" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.ayudante} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* 2. DISTRIBUCIÓN DE CUPOS (DINÁMICO) */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">2. Distribución de Cupos</h3>
                  <button type="button" onClick={addCupoRow} className="text-sm text-blue-600 font-medium hover:text-blue-800">+ Agregar carrera</button>
                </div>
                
                <div className="space-y-3 bg-gray-50 p-6 rounded-xl border border-gray-200">
                  {cuposList.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-4 items-end">
                      <div className="flex-grow w-full">
                        <label className="block text-xs font-bold text-gray-500 mb-1">CARRERA</label>
                        <select 
                          value={item.carrera} 
                          onChange={(e) => handleCupoChange(index, 'carrera', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                        >
                          <option value="">Selecciona carrera...</option>
                          {CARRERAS_DISPONIBLES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="w-full sm:w-32">
                        <label className="block text-xs font-bold text-gray-500 mb-1">CUPOS</label>
                        <input type="number" min="1" value={item.cupos} onChange={(e) => handleCupoChange(index, 'cupos', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeCupoRow(index)} 
                        disabled={cuposList.length === 1}
                        className={`p-2.5 rounded-lg mb-0.5 ${cuposList.length === 1 ? 'text-gray-300' : 'text-red-500 hover:bg-red-100'}`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* 3. DETALLES */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">3. Detalles Académicos</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Requisitos Previos</label>
                    <input type="text" name="requisitos" required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.requisitos} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Syllabus</label>
                    <textarea name="descripcion" required rows="6" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition resize-none" value={formData.descripcion} onChange={handleChange}></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Archivo Syllabus PDF *</label>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept=".pdf"
                        onChange={handlePDFChange}
                        className="hidden"
                        id="pdf-input"
                      />
                      <label 
                        htmlFor="pdf-input"
                        className="flex items-center justify-center w-full px-6 py-10 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
                      >
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          {!syllabusPDF && !existingSyllabusNombre && (
                            <p className="text-sm text-gray-600">Selecciona o arrastra un PDF</p>
                          )}
                          {existingSyllabusNombre && !syllabusPDF && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">Archivo actual:</p>
                              <p className="text-sm text-green-600 font-medium break-all">{existingSyllabusNombre}</p>
                              <p className="text-xs text-gray-500 mt-2">Selecciona un nuevo PDF para reemplazarlo</p>
                            </div>
                          )}
                          {syllabusPDF && (
                            <div>
                              <svg className="mx-auto h-6 w-6 text-green-500 mb-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <p className="text-sm font-medium text-green-600 break-all">{syllabusPDF.name}</p>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                    {pdfError && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-red-700">{pdfError}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón */}
              <div className="pt-6 flex justify-end">
                <button type="submit" disabled={saving} className="px-8 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-lg hover:bg-blue-700 transition-all">
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
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