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
                      <td className="px-6 py-3">
                        {e.status === 'RECHAZADO' && e.motivo_rechazo ? (
                          <button
                            onClick={() => openReason(`Electivo: ${e.titulo}`, e.motivo_rechazo)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m2-4h.01M12 18a6 6 0 110-12 6 6 0 010 12z"/></svg>
                            Ver motivo
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
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
                      <td className="px-6 py-3">
                        {i.status === 'RECHAZADA' && i.motivo_rechazo ? (
                          <button
                            onClick={() => openReason(`Inscripción de ${i.alumno?.nombre || 'Alumno'}`, i.motivo_rechazo)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m2-4h.01M12 18a6 6 0 110-12 6 6 0 010 12z"/></svg>
                            Ver motivo
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
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
      </main>
    </div>
  );
};

export default Historial;
