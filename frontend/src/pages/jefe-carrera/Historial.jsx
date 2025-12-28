import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import electivoService from '../../services/electivo.service.js';
import inscripcionService from '../../services/inscripcion.service.js';

const Historial = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [loadingElectivos, setLoadingElectivos] = useState(false);
  const [loadingInsc, setLoadingInsc] = useState(false);
  const [electivos, setElectivos] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [reasonModal, setReasonModal] = useState({ open: false, title: '', reason: '' });
  const [editModal, setEditModal] = useState({ open: false, type: null, item: null, newStatus: '', reason: '', saving: false });

  const openReason = (title, reason) => {
    setReasonModal({ open: true, title: title || 'Motivo de rechazo', reason: reason || 'Sin motivo registrado.' });
  };

  const closeReason = () => setReasonModal({ open: false, title: '', reason: '' });

  useEffect(() => {
    const fetchElectivos = async () => {
      try {
        setLoadingElectivos(true);
        const data = await electivoService.getAllElectivosAdmin();
        const finalizados = (data || []).filter(e => e.status === 'APROBADO' || e.status === 'RECHAZADO');
        setElectivos(finalizados);
      } catch (e) {
        console.error('Error cargando electivos historial', e);
        setElectivos([]);
      } finally {
        setLoadingElectivos(false);
      }
    };

    const fetchInscripciones = async () => {
      try {
        setLoadingInsc(true);
        const aprobadas = await inscripcionService.getInscripciones({ estado: 'APROBADA' });
        const rechazadas = await inscripcionService.getInscripciones({ estado: 'RECHAZADA' });
        const finalizadas = [ ...(aprobadas || []), ...(rechazadas || []) ]
          .sort((a, b) => {
            const da = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const db = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return db - da;
          });
        setInscripciones(finalizadas);
      } catch (e) {
        console.error('Error cargando inscripciones historial', e);
        setInscripciones([]);
      } finally {
        setLoadingInsc(false);
      }
    };

    fetchElectivos();
    fetchInscripciones();
  }, []);

  const getElectivoEstadoBadge = (status) => (
    <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${status === 'APROBADO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{status}</span>
  );

  const getInscripcionEstadoBadge = (status) => (
    <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${status === 'APROBADA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{status}</span>
  );

  const openEditElectivo = (electivo) => {
    setEditModal({
      open: true,
      type: 'ELECTIVO',
      item: electivo,
      newStatus: electivo.status || 'APROBADO',
      reason: electivo.motivo_rechazo || '',
      saving: false,
    });
  };

  const openEditInscripcion = (inscripcion) => {
    setEditModal({
      open: true,
      type: 'INSCRIPCION',
      item: inscripcion,
      newStatus: inscripcion.status || 'APROBADA',
      reason: inscripcion.motivo_rechazo || '',
      saving: false,
    });
  };

  const closeEditModal = () => {
    setEditModal({ open: false, type: null, item: null, newStatus: '', reason: '', saving: false });
  };

  const handleSaveEdit = async () => {
    if (!editModal.open || !editModal.item || !editModal.type) return;

    try {
      setEditModal((prev) => ({ ...prev, saving: true }));

      if (editModal.type === 'ELECTIVO') {
        await electivoService.reviewElectivo(editModal.item.id, editModal.newStatus, editModal.newStatus === 'RECHAZADO' ? editModal.reason || null : null);

        setElectivos((prev) => {
          const updated = prev.map((e) =>
            e.id === editModal.item.id
              ? { ...e, status: editModal.newStatus, motivo_rechazo: editModal.newStatus === 'RECHAZADO' ? editModal.reason || null : null }
              : e
          );
          // Historial solo muestra APROBADO/RECHAZADO; si vuelve a PENDIENTE lo sacamos de la lista
          return updated.filter((e) => e.status === 'APROBADO' || e.status === 'RECHAZADO');
        });
      } else if (editModal.type === 'INSCRIPCION') {
        await inscripcionService.updateInscripcionStatus(editModal.item.id, editModal.newStatus, editModal.newStatus === 'RECHAZADA' ? editModal.reason || null : null);

        setInscripciones((prev) => {
          const updated = prev.map((i) =>
            i.id === editModal.item.id
              ? { ...i, status: editModal.newStatus, motivo_rechazo: editModal.newStatus === 'RECHAZADA' ? editModal.reason || null : null }
              : i
          );
          // Historial solo muestra APROBADA/RECHAZADA; si vuelve a PENDIENTE lo sacamos de la lista
          return updated.filter((i) => i.status === 'APROBADA' || i.status === 'RECHAZADA');
        });
      }

      closeEditModal();
    } catch (e) {
      alert(e.message || 'Error al modificar el estado.');
      setEditModal((prev) => ({ ...prev, saving: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/jefe/dashboard')} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
              <h1 className="text-xl font-bold text-gray-800">Historial de Decisiones</h1>
            </div>
            <button onClick={logout} className="text-sm font-medium text-red-600 hover:text-red-800">Cerrar Sesión</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Electivos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Electivos: Aprobados y Rechazados</h2>
            <span className="text-xs text-gray-500">Total: {electivos.length}</span>
          </div>

          {loadingElectivos ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : electivos.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="text-4xl mb-3">📭</div>
              <p>No hay decisiones de electivos registradas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Electivo</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Profesor</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Periodo</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {electivos.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <div>
                          <p className="font-medium text-gray-900 text-sm truncate" title={e.titulo}>{e.titulo}</p>
                          <p className="text-xs text-gray-500">Código: {e.codigoElectivo ?? '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-sm text-gray-800">{e.profesor?.nombre ?? '-'}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="inline-block px-2 py-1 text-xs font-bold bg-gray-100 text-gray-700 rounded">{e.anio}-{e.semestre}</span>
                      </td>
                      <td className="px-6 py-3">
                        {getElectivoEstadoBadge(e.status)}
                      </td>
                      <td className="px-6 py-3 space-x-2">
                        {e.status === 'RECHAZADO' && e.motivo_rechazo && (
                          <button
                            onClick={() => openReason(`Electivo: ${e.titulo}`, e.motivo_rechazo)}
                            className="inline-flex items-center gap-1 px-3 py-1 mb-1 text-xs font-semibold rounded bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m2-4h.01M12 18a6 6 0 110-12 6 6 0 010 12z"/></svg>
                            Ver motivo
                          </button>
                        )}
                        <button
                          onClick={() => openEditElectivo(e)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h2m-1-1v2m-2 4h4m-4 4h4m5-9V5a2 2 0 00-2-2H6a2 2 0 00-2 2v2m0 0v10a2 2 0 002 2h10a2 2 0 002-2V7m-14 0h14"/></svg>
                          Detalles / Modificar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Inscripciones */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Inscripciones: Aprobadas y Rechazadas</h2>
            <span className="text-xs text-gray-500">Total: {inscripciones.length}</span>
          </div>

          {loadingInsc ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : inscripciones.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="text-4xl mb-3">📭</div>
              <p>No hay decisiones de inscripciones registradas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Alumno</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Electivo</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Prioridad</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inscripciones.map((i) => (
                    <tr key={i.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{i.alumno?.nombre || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{i.alumno?.rut || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div>
                          <p className="font-medium text-gray-900 text-sm truncate" title={i.electivo?.titulo}>{i.electivo?.titulo || `ID ${i.electivoId}`}</p>
                          <p className="text-xs text-gray-500">Código: {i.electivo?.codigoElectivo ?? '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="inline-block px-2 py-1 text-xs font-bold bg-indigo-100 text-indigo-700 rounded">{i.prioridad}</span>
                      </td>
                      <td className="px-6 py-3">
                        {getInscripcionEstadoBadge(i.status)}
                      </td>
                      <td className="px-6 py-3 space-x-2">
                        {i.status === 'RECHAZADA' && i.motivo_rechazo && (
                          <button
                            onClick={() => openReason(`Inscripción de ${i.alumno?.nombre || 'Alumno'}`, i.motivo_rechazo)}
                            className="inline-flex items-center gap-1 px-3 py-1 mb-1 text-xs font-semibold rounded bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m2-4h.01M12 18a6 6 0 110-12 6 6 0 010 12z"/></svg>
                            Ver motivo
                          </button>
                        )}
                        <button
                          onClick={() => openEditInscripcion(i)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h2m-1-1v2m-2 4h4m-4 4h4m5-9V5a2 2 0 00-2-2H6a2 2 0 00-2 2v2m0 0v10a2 2 0 002 2h10a2 2 0 002-2V7m-14 0h14"/></svg>
                          Detalles / Modificar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Modal Motivo de Rechazo */}
        {reasonModal.open && (
          <div className="fixed inset-0 z-20 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={closeReason}></div>
            <div className="relative bg-white rounded-xl shadow-lg w-full max-w-lg mx-4">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">{reasonModal.title}</h3>
                <button className="p-2 text-gray-500 hover:text-gray-700" onClick={closeReason} aria-label="Cerrar">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-700 whitespace-pre-line">{reasonModal.reason}</p>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button onClick={closeReason} className="px-3 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded hover:bg-blue-700">Cerrar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para Modificar Estado */}
        {editModal.open && (
          <div className="fixed inset-0 z-30 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={editModal.saving ? undefined : closeEditModal}></div>
            <div className="relative bg-white rounded-xl shadow-lg w-full max-w-lg mx-4">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  {editModal.type === 'ELECTIVO'
                    ? `Modificar decisión de electivo`
                    : `Modificar decisión de inscripción`}
                </h3>
                <button
                  className="p-2 text-gray-500 hover:text-gray-700"
                  onClick={editModal.saving ? undefined : closeEditModal}
                  aria-label="Cerrar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="px-6 py-4 space-y-4">
                {/* Detalles del elemento seleccionado */}
                {editModal.type === 'ELECTIVO' && editModal.item && (
                  <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 space-y-1">
                    <p><span className="font-semibold">Electivo:</span> {editModal.item.titulo || 'Sin título'}</p>
                    <p><span className="font-semibold">Código:</span> {editModal.item.codigoElectivo ?? '-'} </p>
                    <p><span className="font-semibold">Profesor:</span> {editModal.item.profesor?.nombre || 'N/A'}</p>
                    <p><span className="font-semibold">Periodo:</span> {editModal.item.anio ?? '-'} - {editModal.item.semestre ?? '-'}</p>
                    {editModal.item.carrera && (
                      <p><span className="font-semibold">Carrera:</span> {editModal.item.carrera}</p>
                    )}
                    {editModal.item.cuposTotales != null && (
                      <p><span className="font-semibold">Cupos totales:</span> {editModal.item.cuposTotales}</p>
                    )}
                    {Array.isArray(editModal.item.cuposPorCarrera) && editModal.item.cuposPorCarrera.length > 0 && (
                      <div className="mt-1">
                        <p className="font-semibold">Cupos por carrera:</p>
                        <ul className="mt-1 space-y-0.5">
                          {editModal.item.cuposPorCarrera.map((cupo, index) => (
                            <li key={index} className="flex justify-between">
                              <span>{cupo.carrera || '-'} </span>
                              <span className="font-semibold">{cupo.cupos ?? 0}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {editModal.item.descripcion && (
                      <p><span className="font-semibold">Descripción:</span> {editModal.item.descripcion}</p>
                    )}
                    {/* Botón para descargar el Programa del Electivo (PDF) */}
                    <button
                      type="button"
                      className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 shadow-sm"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const blob = await import('../../services/electivo.service.js').then(m => m.descargarSyllabus(editModal.item.id));
                          const url = window.URL.createObjectURL(new Blob([blob]));
                          const link = document.createElement('a');
                          const nombre = editModal.item.titulo ? `${editModal.item.titulo} - Programa del Electivo.pdf` : 'Programa del Electivo.pdf';
                          link.href = url;
                          link.setAttribute('download', nombre);
                          document.body.appendChild(link);
                          link.click();
                          link.parentNode.removeChild(link);
                        } catch (err) {
                          alert(err.message || 'No se pudo descargar el Programa del Electivo');
                        }
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Programa del electivo
                    </button>
                  </div>
                )}

                {editModal.type === 'INSCRIPCION' && editModal.item && (
                  <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 space-y-1">
                    <p><span className="font-semibold">Alumno:</span> {editModal.item.alumno?.nombre || 'N/A'} ({editModal.item.alumno?.rut || 'Sin RUT'})</p>
                    {editModal.item.alumno?.carrera && (
                      <p><span className="font-semibold">Carrera alumno:</span> {editModal.item.alumno.carrera}</p>
                    )}
                    <p><span className="font-semibold">Electivo:</span> {editModal.item.electivo?.titulo || `ID ${editModal.item.electivoId}`}</p>
                    <p><span className="font-semibold">Código electivo:</span> {editModal.item.electivo?.codigoElectivo ?? '-'}</p>
                    {(editModal.item.electivo?.anio != null || editModal.item.electivo?.semestre != null) && (
                      <p><span className="font-semibold">Periodo electivo:</span> {editModal.item.electivo?.anio ?? '-'} - {editModal.item.electivo?.semestre ?? '-'}</p>
                    )}
                    <p><span className="font-semibold">Prioridad:</span> {editModal.item.prioridad}</p>
                    {editModal.item.createdAt && (
                      <p><span className="font-semibold">Fecha de solicitud:</span> {new Date(editModal.item.createdAt).toLocaleString()}</p>
                    )}
                    {editModal.item.updatedAt && (
                      <p><span className="font-semibold">Última actualización:</span> {new Date(editModal.item.updatedAt).toLocaleString()}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nuevo estado</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editModal.newStatus}
                    onChange={(e) => setEditModal((prev) => ({ ...prev, newStatus: e.target.value }))}
                    disabled={editModal.saving}
                  >
                    {editModal.type === 'ELECTIVO' ? (
                      <>
                        <option value="APROBADO">APROBADO</option>
                        <option value="RECHAZADO">RECHAZADO</option>
                        <option value="PENDIENTE">PENDIENTE</option>
                      </>
                    ) : (
                      <>
                        <option value="APROBADA">APROBADA</option>
                        <option value="RECHAZADA">RECHAZADA</option>
                        <option value="PENDIENTE">PENDIENTE</option>
                      </>
                    )}
                  </select>
                </div>

                {(editModal.type === 'ELECTIVO' && editModal.newStatus === 'RECHAZADO') ||
                (editModal.type === 'INSCRIPCION' && editModal.newStatus === 'RECHAZADA') ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Motivo de rechazo (opcional)</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows="4"
                      value={editModal.reason}
                      onChange={(e) => setEditModal((prev) => ({ ...prev, reason: e.target.value }))}
                      disabled={editModal.saving}
                    ></textarea>
                  </div>
                ) : null}
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
                <button
                  onClick={editModal.saving ? undefined : closeEditModal}
                  className="px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded"
                  disabled={editModal.saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                  disabled={editModal.saving}
                >
                  {editModal.saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Historial;
