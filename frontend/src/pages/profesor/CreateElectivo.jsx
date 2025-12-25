import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import electivoService from '../../services/electivo.service';
import SuccessModal from '../../components/SuccessModal';
import userService from '../../services/user.service.js';

// Lista local fallback por si falla la API
const CARRERAS_FALLBACK = [
  "Ingeniería Civil en Informática",
  "Ingeniería de Ejecución en Computación",
  "Ingeniería Civil Industrial",
  "Ingeniería Comercial",
  "Otras"
];

const CreateElectivo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estado para el Modal
  const [showModal, setShowModal] = useState(false);

  // Estado para los datos simples
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

  const [errors, setErrors] = useState({});

  // Carreras desde backend
  const [carreras, setCarreras] = useState(CARRERAS_FALLBACK);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await userService.getCarreras();
        if (mounted && Array.isArray(list) && list.length > 0) setCarreras(list);
      } catch (e) {
        // fallback
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Estado para la lista dinámica de cupos (Maestro-Detalle)
  const [cuposList, setCuposList] = useState([
    { carrera: '', cupos: '' } // Iniciamos con una fila vacía
  ]);

  // Estado para la lista dinámica de horarios
  const [horariosList, setHorariosList] = useState([
    { dia: '', horaInicio: '', horaTermino: '' } // Iniciamos con una fila vacía
  ]);

  // Estados para el archivo PDF del syllabus
  const [syllabusPDF, setSyllabusPDF] = useState(null);
  const [pdfError, setPdfError] = useState('');

  // Verifica si un horario se solapa con otro del mismo día
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
      if (inicio < fin2 && fin > inicio2) return true; // hay intersección
    }
    return false;
  };

  // Maneja cambios en inputs normales
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'codigoElectivo') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: name === 'anio' ? parseInt(value) : value,
    }));
    
    // Validar año en tiempo real
    if (name === 'anio') {
      const anioActual = new Date().getFullYear();
      if (parseInt(value) < anioActual) {
        setErrors(prev => ({
          ...prev,
          anio: `El año debe ser ${anioActual} o posterior`,
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          anio: '',
        }));
      }
    }
  };

  // Maneja cambios en la lista dinámica de cupos
  const handleCupoChange = (index, field, value) => {
    const newList = [...cuposList];
    if (field === 'cupos') {
      newList[index][field] = value === '' ? '' : parseInt(value);
    } else {
      newList[index][field] = value;
    }
    setCuposList(newList);
  };

  // Agregar nueva fila de carrera
  const addCupoRow = () => {
    setCuposList([...cuposList, { carrera: '', cupos: '' }]);
  };

  // Eliminar una fila de carrera
  const removeCupoRow = (index) => {
    if (cuposList.length > 1) {
      const newList = cuposList.filter((_, i) => i !== index);
      setCuposList(newList);
    }
  };

  // Maneja cambios en la lista dinámica de horarios
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

  // Agregar nueva fila de horario
  const addHorarioRow = () => {
    const last = horariosList[horariosList.length - 1];
    if (last && (!last.dia || !last.horaInicio || !last.horaTermino)) {
      setError('Completa el horario anterior antes de agregar otro');
      return;
    }
    setHorariosList([...horariosList, { dia: '', horaInicio: '', horaTermino: '' }]);
    setError('');
  };

  // Eliminar una fila de horario
  const removeHorarioRow = (index) => {
    if (horariosList.length > 1) {
      const newList = horariosList.filter((_, i) => i !== index);
      setHorariosList(newList);
    }
  };

  // Maneja cambios cuando el usuario selecciona un archivo PDF
  const handlePDFChange = (e) => {
    const file = e.target.files?.[0];
    setPdfError('');

    if (!file) {
      setSyllabusPDF(null);
      return;
    }

    // Validar que sea un PDF
    if (file.type !== 'application/pdf') {
      setPdfError('El archivo debe ser un PDF válido');
      e.target.value = '';
      return;
    }

    // Validar tamaño máximo (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setPdfError('El PDF no debe superar 10MB');
      e.target.value = '';
      return;
    }

    setSyllabusPDF(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!syllabusPDF) {
      setError('Debes seleccionar un archivo PDF del syllabus');
      setLoading(false);
      return;
    }

    const anioActual = new Date().getFullYear();
    if (formData.anio < anioActual) {
      setErrors(prev => ({
        ...prev,
        anio: `El año debe ser ${anioActual} o posterior`,
      }));
      setLoading(false);
      return;
    }

    try {
      const validCuposList = cuposList.filter(item => item.carrera && item.cupos);

      if (validCuposList.length === 0) {
        throw new Error("Debes asignar cupos a al menos una carrera.");
      }

      const validHorariosList = horariosList.filter(item => item.dia && item.horaInicio && item.horaTermino);

      if (validHorariosList.length === 0) {
        throw new Error("Debes agregar al menos un horario.");
      }

      // Validar horarios (hora termino > inicio y sin solapes)
      for (let i = 0; i < validHorariosList.length; i++) {
        const horario = validHorariosList[i];
        const [hInicio, mInicio] = horario.horaInicio.split(':').map(Number);
        const [hTermino, mTermino] = horario.horaTermino.split(':').map(Number);
        if (hTermino * 60 + mTermino <= hInicio * 60 + mInicio) {
          throw new Error("La hora de término debe ser posterior a la hora de inicio");
        }
        if (checkHorarioSolapamiento(horario.dia, horario.horaInicio, horario.horaTermino, i, validHorariosList)) {
          throw new Error(`No puedes agregar horarios que se solapan en el mismo día (${horario.dia})`);
        }
      }

      // Validar PDF
      if (!syllabusPDF) {
        throw new Error("Debes seleccionar un PDF para el syllabus.");
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
      formDataToSend.append('syllabusPDF', syllabusPDF);

      await electivoService.createElectivo(formDataToSend);

      setLoading(false);
      setShowModal(true);

    } catch (err) {
      console.error(err);
      setError(err.message || "Error al crear el electivo.");
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate('/profesor/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans relative">

      <SuccessModal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="¡Propuesta Creada!"
        message="El electivo y su distribución de cupos por carrera han sido registrados exitosamente."
      />

      <div className="max-w-4xl mx-auto">

        {/* Encabezado */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Nuevo Electivo</h1>
            <p className="mt-2 text-sm text-gray-500">
              Configura la asignatura y distribuye los cupos por carrera.
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

              {/* --- 1. INFORMACIÓN GENERAL --- */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">1</span>
                  Información General
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Electivo <span className="text-red-500">*</span>
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código Electivo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="codigoElectivo"
                      required
                      placeholder="Ej: 620658"
                      maxLength="6"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                      value={formData.codigoElectivo}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">Exactamente 6 dígitos numéricos</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sala <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="sala"
                      required
                      placeholder="Ej: Sala de especialidades 1"
                      maxLength="50"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                      value={formData.sala}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Año <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      name="anio"
                      required
                      value={formData.anio}
                      onChange={handleChange}
                      min={new Date().getFullYear()}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                    />
                    {errors.anio && <p className="text-red-600 text-sm mt-1">{errors.anio}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semestre <span className="text-red-500">*</span></label>
                    <select
                      name="semestre"
                      required
                      value={formData.semestre}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                    >
                      <option value="1">Semestre 1</option>
                      <option value="2">Semestre 2</option>
                    </select>
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

              {/* --- 2. DISTRIBUCIÓN DE CUPOS --- */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">2</span>
                    Distribución de Cupos
                  </div>
                  <button
                    type="button"
                    onClick={addCupoRow}
                    className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1 transition-colors"
                  >
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
                          {carreras.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      <div className="w-full sm:w-32">
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Cupos</label>
                        <input
                          type="number"
                          min="1"
                          placeholder="0"
                          value={item.cupos}
                          onChange={(e) => handleCupoChange(index, 'cupos', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      {/* Botón Eliminar Fila (Solo si hay más de 1) */}
                      <button
                        type="button"
                        onClick={() => removeCupoRow(index)}
                        disabled={cuposList.length === 1}
                        className={`p-2.5 rounded-lg mb-0.5 transition-colors ${cuposList.length === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-red-500 hover:bg-red-100 hover:text-red-700'
                          }`}
                        title="Eliminar fila"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {/* Totalizador visual (opcional) */}
                  <div className="pt-2 text-right text-xs text-gray-500 font-medium">
                    Total de cupos a ofertar: {cuposList.reduce((acc, curr) => acc + (parseInt(curr.cupos) || 0), 0)}
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* --- 3. DISTRIBUCIÓN DE HORARIOS --- */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">3</span>
                    Distribución de Horarios
                  </div>
                  <button
                    type="button"
                    onClick={addHorarioRow}
                    className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1 transition-colors"
                  >
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
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Término</label>
                        <input
                          type="time"
                          min="08:10"
                          max="22:00"
                          value={item.horaTermino}
                          onChange={(e) => handleHorarioChange(index, 'horaTermino', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      {/* Botón Eliminar Fila (Solo si hay más de 1) */}
                      <button
                        type="button"
                        onClick={() => removeHorarioRow(index)}
                        disabled={horariosList.length === 1}
                        className={`p-2.5 rounded-lg mb-0.5 transition-colors ${horariosList.length === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-red-500 hover:bg-red-100 hover:text-red-700'
                          }`}
                        title="Eliminar fila"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {/* Nota sobre horarios */}
                  <div className="pt-2 text-xs text-gray-600 font-medium">
                    ℹ️ Horarios disponibles: 08:10 - 22:00
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* --- 4. DETALLES ACADÉMICOS --- */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">4</span>
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
                        placeholder="Ej: Haber aprobado Base de Datos"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                        value={formData.requisitos}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Syllabus (PDF) <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={handlePDFChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white cursor-pointer"
                      />
                    </div>

                    {syllabusPDF && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                        <svg className="h-5 w-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div className="text-sm">
                          <p className="font-medium text-green-800">{syllabusPDF.name}</p>
                          <p className="text-xs text-green-700">{(syllabusPDF.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    )}

                    {pdfError && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                        <svg className="h-5 w-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium text-red-800">{pdfError}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observaciones <span className="text-gray-400 font-normal text-xs ml-1">(Opcional)</span>
                    </label>
                    <textarea
                      name="observaciones"
                      rows="6"
                      placeholder="Ej: Máximo 30 estudiantes, se requiere laptop personal, clases sincrónicas obligatorias, Solo IECI, etc..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none bg-gray-50 focus:bg-white"
                      value={formData.observaciones}
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
                  className={`px-8 py-3 text-sm font-bold text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading
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