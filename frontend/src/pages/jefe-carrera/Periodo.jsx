import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import periodoService from '../../services/periodo.service';

const Periodo = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const now = new Date();
  const currentYear = now.getFullYear();

  const [anio, setAnio] = useState(currentYear);
  const [semestre, setSemestre] = useState('1');
  const [inicio, setInicio] = useState('');
  const [fin, setFin] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [yearError, setYearError] = useState('');

  const toLocalInput = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${y}-${m}-${dd}T${hh}:${mm}`;
  };

  const fetchPeriodo = async (year, sem) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const p = await periodoService.getPeriodo(year, sem);
      if (p) {
        setInicio(toLocalInput(p.inicio));
        setFin(toLocalInput(p.fin));
      } else {
        setInicio('');
        setFin('');
      }
    } catch (e) {
      setError(e.message || 'Error al cargar el periodo');
    } finally {
      setLoading(false);
    }
  };

  // Convierte el valor del input local a ISO (para enviar seguro al backend)
  const toIsoString = (localDateTime) => {
    const d = new Date(localDateTime);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  };

  const validateRange = (iniStr, finStr) => {
    const ini = new Date(iniStr);
    const finDate = new Date(finStr);
    if (Number.isNaN(ini.getTime()) || Number.isNaN(finDate.getTime())) return 'Fechas inválidas.';
    if (ini >= finDate) return 'La fecha de inicio debe ser anterior a la de fin.';
    return '';
  };

  useEffect(() => {
    fetchPeriodo(anio, semestre);
  }, [anio, semestre]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!anio || !semestre || !inicio || !fin) {
      setError('Debes completar todos los campos.');
      setSuccess('');
      return;
    }

    if (anio < currentYear) {
      setYearError('El año no puede ser anterior al actual.');
      setError('El año no puede ser anterior al actual.');
      setSuccess('');
      return;
    }

    const rangeError = validateRange(inicio, fin);
    if (rangeError) {
      setError(rangeError);
      setSuccess('');
      return;
    }

    const inicioIso = toIsoString(inicio);
    const finIso = toIsoString(fin);
    if (!inicioIso || !finIso) {
      setError('Fechas inválidas. Usa el formato DD-MM-AAAA HH:mm (hora local).');
      setSuccess('');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await periodoService.setPeriodo({ anio, semestre, inicio: inicioIso, fin: finIso });
      setSuccess('Periodo configurado correctamente.');
    } catch (e) {
      setError(e.message || 'Error al configurar el periodo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/jefe/dashboard')}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-800">Configurar periodo de inscripción</h1>
            </div>
            <button
              onClick={logout}
              className="text-sm font-medium text-red-600 hover:text-red-800"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-4">
            Define el año, semestre y el rango de fechas en que los alumnos pueden inscribirse
            en electivos. Solo puede existir un periodo por año y semestre.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                <input
                  type="number"
                  min={currentYear}
                  max="2100"
                  value={anio}
                  onChange={(e) => {
                    const val = Number(e.target.value) || currentYear;
                    setAnio(val);
                    if (val < currentYear) {
                      setYearError('El año no puede ser anterior al actual.');
                      setSuccess('');
                    } else {
                      setYearError('');
                    }
                  }}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                />
                {yearError && (
                  <p className="text-xs text-red-600 mt-1">{yearError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semestre</label>
                <select
                  value={semestre}
                  onChange={(e) => setSemestre(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inicio</label>
                <input
                  type="datetime-local"
                  value={inicio}
                  onChange={(e) => setInicio(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">El selector usa el formato AAAA-MM-DD HH:mm según tu navegador (hora local).</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                <input
                  type="datetime-local"
                  value={fin}
                  onChange={(e) => setFin(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Debe ser posterior al inicio.</p>
              </div>
            </div>

            {loading && (
              <p className="text-sm text-gray-500">Cargando periodo actual...</p>
            )}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{success}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => fetchPeriodo(anio, semestre)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300"
              >
                Recargar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Guardar periodo'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Periodo;
