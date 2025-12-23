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
    codigoElectivo: '',
    titulo: '',
    sala: '',
    observaciones: '',
    anio: new Date().getFullYear(),
    semestre: '1',
    requisitos: '',
    ayudante: ''
  });

  // Estado para la lista dinámica de cupos
  const [cuposList, setCuposList] = useState([]);

  // Estado para la lista dinámica de horarios
  const [horariosList, setHorariosList] = useState([]);

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
            codigoElectivo: data.codigoElectivo || '',
            titulo: data.titulo,
            sala: data.sala || '',
            observaciones: data.observaciones || '',
            anio: data.anio || new Date().getFullYear(),
            semestre: data.semestre || '1',
            requisitos: data.requisitos,
            ayudante: data.ayudante || ''
          });

          // Llenar lista de cupos (si existe la relación en la BD)
          if (data.cuposPorCarrera && data.cuposPorCarrera.length > 0) {
            setCuposList(data.cuposPorCarrera.map(c => ({
              carrera: c.carrera,
              cupos: c.cupos
            })));
          } else {
            setCuposList([{ carrera: '', cupos: '' }]);
          }

          // Llenar lista de horarios
          if (data.horarios && data.horarios.length > 0) {
            setHorariosList(data.horarios.map(h => ({
              dia: h.dia,
              horaInicio: h.horaInicio,
              horaTermino: h.horaTermino
            })));
          } else {
            setHorariosList([{ dia: '', horaInicio: '', horaTermino: '' }]);
          }

          // Guardar el nombre del syllabus existente
          if (data.syllabusName) {
            setExistingSyllabusNombre(data.syllabusName);
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

  // Verifica solapamiento de horarios en un día
  const checkHorarioSolapamiento = (dia, horaInicio, horaTermino, indexActual = null, lista = horariosList) => {
    const [h1, m1] = horaInicio.split(':').map(Number);
    const [h2, m2] = horaTermino.split(':').map(Number);
    const inicio = h1 * 60 + m1;
    const fin = h2 * 60 + m2;

    for (let i = 0; i < lista.length; i++) {
      if (indexActual !== null && i === indexActual) continue;
      const h = lista[i];
      if (h.dia !== dia || !h.horaInicio || !h.horaTermino) continue;
      const [ha, ma] = h.horaInicio.split(':').map(Number);
      const [hb, mb] = h.horaTermino.split(':').map(Number);
      const inicio2 = ha * 60 + ma;
      const fin2 = hb * 60 + mb;
      if (inicio < fin2 && fin > inicio2) return true;
    }
    return false;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'codigoElectivo') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
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
    if (field === 'cupos') {
      newList[index][field] = value === '' ? '' : parseInt(value);
    } else {
      newList[index][field] = value;
    }
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

  // --- MANEJO DE LISTA DINÁMICA DE HORARIOS ---
  const handleHorarioChange = (index, field, value) => {
    const newList = [...horariosList];
    newList[index][field] = value;

    if ((field === 'horaInicio' || field === 'horaTermino') && newList[index].dia) {
      const h = newList[index];
      if (h.horaInicio && h.horaTermino) {
        const solapa = checkHorarioSolapamiento(h.dia, h.horaInicio, h.horaTermino, index);
        setError(solapa ? `Este horario se solapa con otro en ${h.dia}` : '');
      }
    }

    setHorariosList(newList);
  };

  const addHorarioRow = () => {
    const last = horariosList[horariosList.length - 1];
    if (last && (!last.dia || !last.horaInicio || !last.horaTermino)) {
      setError('Completa el horario anterior antes de agregar otro');
      return;
    }
    setHorariosList([...horariosList, { dia: '', horaInicio: '', horaTermino: '' }]);
    setError('');
  };

  const removeHorarioRow = (index) => {
    if (horariosList.length > 1) {
      const newList = horariosList.filter((_, i) => i !== index);
      setHorariosList(newList);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Validar que haya PDF: o uno nuevo seleccionado, o existe el anterior
    if (!syllabusPDF && !existingSyllabusNombre) {
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

      const validHorariosList = horariosList.filter(item => item.dia && item.horaInicio && item.horaTermino);

      if (validHorariosList.length === 0) {
        throw new Error("Debes agregar al menos un horario.");
      }

      // Validar horarios (hora termino > inicio y sin solapes)
      for (const horario of validHorariosList) {
        const [hInicio, mInicio] = horario.horaInicio.split(':').map(Number);
        const [hTermino, mTermino] = horario.horaTermino.split(':').map(Number);
        if (hTermino * 60 + mTermino <= hInicio * 60 + mInicio) {
          throw new Error("La hora de término debe ser posterior a la hora de inicio");
        }
        if (checkHorarioSolapamiento(horario.dia, horario.horaInicio, horario.horaTermino, null, validHorariosList)) {
          throw new Error(`No puedes agregar horarios que se solapan en el mismo día (${horario.dia})`);
        }
      }

      const formDataToSend = new FormData();
      formDataToSend.append('codigoElectivo', formData.codigoElectivo);
      formDataToSend.append('titulo', formData.titulo);
      formDataToSend.append('sala', formData.sala);
      formDataToSend.append('observaciones', formData.observaciones);
      formDataToSend.append('anio', formData.anio);
      formDataToSend.append('semestre', formData.semestre);
      formDataToSend.append('requisitos', formData.requisitos);
      formDataToSend.append('ayudante', formData.ayudante);
      formDataToSend.append('cuposList', JSON.stringify(validCuposList));
      formDataToSend.append('horarios', JSON.stringify(validHorariosList));
      
      // Solo enviar PDF si hay uno nuevo
      if (syllabusPDF) {
        formDataToSend.append('syllabusPDF', syllabusPDF);
      }
      
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
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">1</span>
                  Información General
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Asignatura <span className="text-red-500">*</span></label>
                    <input type="text" name="titulo" required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" value={formData.titulo} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código Electivo <span className="text-red-500">*</span></label>
                    <input type="text" name="codigoElectivo" required placeholder="Ej: 620658" maxLength="6" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" value={formData.codigoElectivo} onChange={handleChange} />
                    <p className="text-xs text-gray-500 mt-1">Exactamente 6 dígitos numéricos</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sala <span className="text-red-500">*</span></label>
                    <input type="text" name="sala" required placeholder="Ej: Sala de especialidades 1" maxLength="50" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" value={formData.sala} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Año <span className="text-red-500">*</span></label>
                    <input type="number" name="anio" required value={formData.anio} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semestre <span className="text-red-500">*</span></label>
                    <select name="semestre" required value={formData.semestre} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white">
                      <option value="1">Semestre 1</option>
                      <option value="2">Semestre 2</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ayudante <span className="text-gray-400 font-normal text-xs ml-1">(Opcional)</span></label>
                    <input type="text" name="ayudante" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" value={formData.ayudante} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* 2. DISTRIBUCIÓN DE CUPOS */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">2</span>
                    Distribución de Cupos
                  </div>
                  <button type="button" onClick={addCupoRow} className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Agregar otra carrera
                  </button>
                </h3>
                
                <div className="space-y-3 bg-gray-50 p-6 rounded-xl border border-gray-200">
                  {cuposList.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-4 items-end animate-fade-in">
                      <div className="flex-grow w-full">
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Carrera</label>
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
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Cupos</label>
                        <input type="number" min="1" value={item.cupos} onChange={(e) => handleCupoChange(index, 'cupos', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeCupoRow(index)} 
                        disabled={cuposList.length === 1}
                        className={`p-2.5 rounded-lg mb-0.5 transition-colors ${cuposList.length === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-100 hover:text-red-700'}`}
                        title="Eliminar fila"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                  <div className="pt-2 text-right text-xs text-gray-500 font-medium">
                    Total de cupos a ofertar: {cuposList.reduce((acc, curr) => acc + (parseInt(curr.cupos) || 0), 0)}
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* 3. DISTRIBUCIÓN DE HORARIOS */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">3</span>
                    Distribución de Horarios
                  </div>
                  <button type="button" onClick={addHorarioRow} className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Agregar otro horario
                  </button>
                </h3>

                <div className="space-y-3 bg-gray-50 p-6 rounded-xl border border-gray-200">
                  {horariosList.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-4 items-end animate-fade-in">
                      <div className="flex-grow w-full">
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Día</label>
                        <select
                          value={item.dia}
                          onChange={(e) => handleHorarioChange(index, 'dia', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                        >
                          <option value="">Selecciona día...</option>
                          <option value="LUNES">Lunes</option>
                          <option value="MARTES">Martes</option>
                          <option value="MIERCOLES">Miércoles</option>
                          <option value="JUEVES">Jueves</option>
                          <option value="VIERNES">Viernes</option>
                        </select>
                      </div>

                      <div className="w-full sm:w-32">
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Inicio</label>
                        <input
                          type="time"
                          min="08:10"
                          max="22:00"
                          value={item.horaInicio}
                          onChange={(e) => handleHorarioChange(index, 'horaInicio', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div className="w-full sm:w-32">
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Termino</label>
                        <input
                          type="time"
                          min="08:10"
                          max="22:00"
                          value={item.horaTermino}
                          onChange={(e) => handleHorarioChange(index, 'horaTermino', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeHorarioRow(index)}
                        disabled={horariosList.length === 1}
                        className={`p-2.5 rounded-lg mb-0.5 transition-colors ${horariosList.length === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-100 hover:text-red-700'}`}
                        title="Eliminar fila"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <div className="pt-2 text-xs text-gray-600 font-medium">
                    ℹ️ Horarios disponibles: 08:10 - 22:00
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* 4. DETALLES ACADÉMICOS */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">4</span>
                  Detalles Académicos
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Requisitos Previos <span className="text-gray-400 font-normal text-xs ml-1">(Opcional)</span></label>
                    <input type="text" name="requisitos" placeholder="Ej: Haber aprobado Base de Datos" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" value={formData.requisitos} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Syllabus (PDF) <span className="text-red-500 font-bold">*</span></label>
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
                              <p className="text-sm font-medium text-green-700">{syllabusPDF.name}</p>
                              <p className="text-xs text-gray-500">{(syllabusPDF.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                    {pdfError && <p className="mt-2 text-sm text-red-600">{pdfError}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observaciones <span className="text-gray-400 font-normal text-xs ml-1">(Opcional)</span>
                    </label>
                    <textarea name="observaciones" rows="6" placeholder="Ej: Máximo 30 estudiantes, se requiere laptop personal, clases sincrónicas obligatorias..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition resize-none bg-gray-50 focus:bg-white" value={formData.observaciones} onChange={handleChange}></textarea>
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