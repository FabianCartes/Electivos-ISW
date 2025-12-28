import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import electivoService from '../../services/electivo.service';
import inscripcionService from '../../services/inscripcion.service.js';

const AlumnosInscritos = () => {
  const navigate = useNavigate();
  const [electivos, setElectivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElectivo, setSelectedElectivo] = useState(null);
  const [inscripciones, setInscripciones] = useState([]);
  const [errorMensaje, setErrorMensaje] = useState('');

  // Cargar mis electivos
  useEffect(() => {
    const fetchElectivos = async () => {
      try {
        const data = await electivoService.getMyElectivos();
        setElectivos(data || []);
        // Seleccionar el primero por defecto
        if (data && data.length > 0) {
          setSelectedElectivo(data[0]);
          fetchInscripciones(data[0].id);
        }
      } catch (error) {
        console.error("Error al cargar electivos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchElectivos();
  }, []);

  // Cargar inscripciones para un electivo específico
  const fetchInscripciones = async (electivoId) => {
    try {
      setErrorMensaje('');
      const data = await inscripcionService.getInscripcionesPorElectivo(electivoId, { estado: 'APROBADA' });
      setInscripciones(data || []);
    } catch (error) {
      console.error("Error al cargar inscripciones:", error);
      setInscripciones([]);
      setErrorMensaje(error.message || 'No se pudieron cargar las inscripciones para este electivo.');
    }
  };

  const handleSelectElectivo = (electivo) => {
    setSelectedElectivo(electivo);
    fetchInscripciones(electivo.id);
  };

  // Estadísticas: solo mostrar total inscritos
  const stats = {
    total: inscripciones.length,
  };


  // El backend ya devuelve solo APROBADAS cuando se usa estado=APROBADA
  const visibleInscripciones = inscripciones;

  // Función para generar y descargar PDF
  const handleDownloadPDF = () => {
    if (!selectedElectivo) return;
    const doc = new jsPDF();

    // Colores y estilos
    const mainColor = [41, 128, 185];
    doc.setDrawColor(...mainColor);
    doc.setTextColor(...mainColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(selectedElectivo.titulo || 'Electivo', 14, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(`Código: ${selectedElectivo.codigoElectivo || ''}`, 14, 26);


    // Profesor
    let profesorNombre = 'N/A';
    if (selectedElectivo.profesor) {
      if (typeof selectedElectivo.profesor === 'object') {
        profesorNombre = selectedElectivo.profesor.nombre || selectedElectivo.profesor.email || 'N/A';
      } else if (typeof selectedElectivo.profesor === 'string') {
        profesorNombre = selectedElectivo.profesor;
      }
    }
    doc.setFont('helvetica', 'bold');
    doc.text('Profesor:', 14, 34);
    doc.setFont('helvetica', 'normal');
    doc.text(profesorNombre, 40, 34);

    // Ayudante
    if (selectedElectivo.ayudante?.nombre) {
      doc.setFont('helvetica', 'bold');
      doc.text('Ayudante:', 14, 42);
      doc.setFont('helvetica', 'normal');
      doc.text(selectedElectivo.ayudante.nombre, 40, 42);
    }

    // Horarios (lista y oraciones, mostrando sala explícitamente)
    let horarios = [];
    if (selectedElectivo.horarios && selectedElectivo.horarios.length > 0) {
      horarios = selectedElectivo.horarios.map(h => {
        // Ejemplo: "Lunes 08:00 - 10:00 Sala 101"
        let sala = h.sala || h.salaNombre || h.sala_nombre || '';
        sala = sala ? `Sala ${sala}` : '';
        return `${h.dia} ${h.horaInicio} - ${h.horaFin} ${sala}`.trim();
      });
    }
    if (horarios.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Horarios:', 14, 50);
      doc.setFont('helvetica', 'normal');
      horarios.forEach((h, idx) => {
        doc.text(`• ${h}`, 20, 58 + idx * 8);
      });
    } else {
      doc.setFont('helvetica', 'bold');
      doc.text('Horarios:', 14, 50);
      doc.setFont('helvetica', 'normal');
      doc.text('N/A', 40, 50);
    }

    // Tabla de alumnos
    const alumnos = visibleInscripciones.map((insc, idx) => [
      idx + 1,
      insc.alumno?.nombre || 'N/A',
      insc.alumno?.rut || 'N/A',
      insc.alumno?.email || 'N/A',
      insc.alumno?.carrera || 'N/A',
      insc.prioridad ?? 'N/A',
    ]);

    // Calcular posición de la tabla según cantidad de horarios
    const tablaStartY = 58 + (horarios.length > 0 ? horarios.length * 8 : 8);

    autoTable(doc, {
      startY: tablaStartY,
      head: [['#', 'Nombre', 'RUT', 'Email', 'Carrera', 'Prioridad']],
      body: alumnos,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: mainColor, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [230, 240, 255] },
      margin: { left: 14, right: 14 },
    });

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('Generado por Sistema de Electivos', 14, 290);

    doc.save(`ListaAlumnos_${selectedElectivo.titulo || 'Electivo'}.pdf`);
  };

  

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando alumnos inscritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Alumnos Inscritos</h1>
            <p className="mt-2 text-sm text-gray-500">Consulta quiénes se han inscrito en tus asignaturas.</p>
          </div>
          <button 
            type="button"
            onClick={() => navigate('/profesor/dashboard')}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Volver
          </button>
        </div>

        {electivos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="text-gray-400 mb-4 text-6xl">📭</div>
            <h3 className="text-lg font-medium text-gray-900">No tienes electivos</h3>
            <p className="text-gray-500 mt-2 mb-6">Crea un electivo primero para ver los alumnos inscritos.</p>
            <button 
              onClick={() => navigate('/profesor/crear-electivo')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md"
            >
              Crear Electivo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Panel lateral: Lista de electivos */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-20">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100">
                  <h3 className="text-lg font-bold text-gray-900">Mis Electivos</h3>
                  <p className="text-xs text-gray-600 mt-1">Total: {electivos.length}</p>
                </div>
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {electivos.map((electivo) => (
                    <button
                      key={electivo.id}
                      onClick={() => handleSelectElectivo(electivo)}
                      className={`w-full text-left p-4 transition-all ${
                        selectedElectivo?.id === electivo.id
                          ? 'bg-blue-50 border-l-4 border-l-blue-600'
                          : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                      }`}
                    >
                      <p className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 hover:text-blue-600">{electivo.titulo}</p>
                      <p className="text-xs text-gray-500 mb-2">Código: {electivo.codigoElectivo}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel principal: Alumnos inscritos */}
            <div className="lg:col-span-3">
              {selectedElectivo && (
                <div className="space-y-6">
                  {errorMensaje && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-3 rounded-lg">
                      {errorMensaje}
                    </div>
                  )}
                  
                  {/* Tarjeta de información del electivo */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-2xl font-bold text-gray-900">{selectedElectivo.titulo}</h2>
                            {/* Cupos restantes (aprobadas = inscripciones.length) */}
                            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full border border-green-200">
                              {(() => {
                                const totalCupos = (selectedElectivo.cuposPorCarrera || []).reduce((acc, c) => acc + (c.cupos || 0), 0);
                                const aprobadasCount = inscripciones.length;
                                const restantes = Math.max(0, totalCupos - aprobadasCount);
                                return `Cupos restantes: ${restantes}`;
                              })()}
                            </span>
                          </div>
                          <p className="text-gray-500 mt-1 text-sm">Código: {selectedElectivo.codigoElectivo}</p>
                          <p className="text-gray-500 mt-1 text-sm">{selectedElectivo.observaciones}</p>
                        </div>
                        {/* Botón para descargar PDF */}
                        <button
                          onClick={handleDownloadPDF}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors text-sm font-semibold"
                          title="Descargar la lista de alumnos inscritos en PDF"
                        >
                          Descargar lista de alumnos
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                          <p className="text-xs text-blue-600 font-bold uppercase mb-1">Total Inscritos</p>
                          <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info de cantidad */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">Mostrando alumnos inscritos</div>
                    <div className="text-xs text-gray-500">
                      Mostrando {visibleInscripciones.length} de {inscripciones.length}
                    </div>
                  </div>

                  {/* Lista de alumnos */}
                  {visibleInscripciones.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
                      <div className="text-gray-400 mb-4 text-5xl">👥</div>
                      <h3 className="text-lg font-medium text-gray-900">Sin inscripciones</h3>
                      <p className="text-gray-500 mt-2">
                        {errorMensaje
                          ? 'No es posible mostrar las inscripciones en este momento.'
                          : 'Aún no hay alumnos inscritos en este electivo.'}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Alumno</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Carrera</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Prioridad</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {visibleInscripciones.map((inscripcion, idx) => (
                              <tr key={inscripcion.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                  <div>
                                    <p className="font-bold text-gray-900">{inscripcion.alumno?.nombre || 'N/A'}</p>
                                    <p className="text-xs text-gray-500">{inscripcion.alumno?.rut || 'N/A'}</p>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {inscripcion.alumno?.email || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {inscripcion.alumno?.carrera || 'N/A'}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="inline-block px-3 py-1 text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-full">
                                    Prioridad {inscripcion.prioridad ?? 'N/A'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default AlumnosInscritos;
