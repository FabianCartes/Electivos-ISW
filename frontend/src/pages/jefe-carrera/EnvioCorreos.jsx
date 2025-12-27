import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/user.service';
import {
  sendEmailToUser,
  sendEmailToRole,
  sendEmailToAlumnosByCarrera,
} from '../../services/notification.service';

const modosEnvio = [
  { id: 'usuario', label: 'A un usuario específico' },
  { id: 'rol', label: 'A todos por rol' },
  { id: 'carrera', label: 'A alumnos de una carrera' },
];

const rolesDisponibles = [
  { value: 'ALUMNO', label: 'Alumnos' },
  { value: 'PROFESOR', label: 'Profesores' },
  { value: 'JEFE_CARRERA', label: 'Jefes de carrera' },
];

const EnvioCorreos = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [modo, setModo] = useState('rol');
  const [usuarios, setUsuarios] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('PROFESOR');
  const [selectedCarrera, setSelectedCarrera] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingData(true);
        const [alumnos, profesores, jefes, carrerasCanonicas] = await Promise.all([
          userService.getByRole('ALUMNO'),
          userService.getByRole('PROFESOR'),
          userService.getByRole('JEFE_CARRERA'),
          userService.getCarreras(),
        ]);

        const allUsers = [...alumnos, ...profesores, ...jefes];
        const filtered = user?.id
          ? allUsers.filter((u) => u.id !== user.id)
          : allUsers;
        setUsuarios(filtered);
        setCarreras(carrerasCanonicas || []);
      } catch (error) {
        console.error('Error cargando datos para envío de correos:', error);
        setFeedback({
          type: 'error',
          message: 'No se pudieron cargar usuarios o carreras. Intenta recargar la página.',
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchInitialData();
  }, []);

  const nombreJefe = user?.nombre || 'Jefe de Carrera';

  const resetFeedback = () => setFeedback(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetFeedback();

    if (!subject.trim() || !message.trim()) {
      setFeedback({ type: 'error', message: 'Asunto y mensaje son obligatorios.' });
      return;
    }

    try {
      setSending(true);
      let result;

      if (modo === 'usuario') {
        if (!selectedUserId) {
          setFeedback({ type: 'error', message: 'Selecciona un usuario.' });
          return;
        }
        result = await sendEmailToUser({
          userId: Number(selectedUserId),
          subject: subject.trim(),
          message: message.trim(),
        });
      } else if (modo === 'rol') {
        if (!selectedRole) {
          setFeedback({ type: 'error', message: 'Selecciona un rol.' });
          return;
        }
        result = await sendEmailToRole({
          role: selectedRole,
          subject: subject.trim(),
          message: message.trim(),
        });
      } else if (modo === 'carrera') {
        if (!selectedCarrera) {
          setFeedback({ type: 'error', message: 'Selecciona una carrera.' });
          return;
        }
        result = await sendEmailToAlumnosByCarrera({
          carrera: selectedCarrera,
          subject: subject.trim(),
          message: message.trim(),
        });
      }

      const enviados = result?.data?.sent ?? result?.sent ?? 0;
      setFeedback({
        type: 'success',
        message:
          enviados > 0
            ? `Correo(s) enviado(s) correctamente. Total destinatarios: ${enviados}.`
            : 'No se encontraron destinatarios para este envío.',
      });
    } catch (error) {
      console.error('Error enviando correos:', error);
      const msg = error?.response?.data?.message || 'Ocurrió un error al enviar los correos.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setSending(false);
    }
  };

  const usuariosOrdenados = [...usuarios].sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/jefe/dashboard')}
                className="mr-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h3a1 1 0 001-1v-3h2v3a1 1 0 001 1h3a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <span className="text-xl font-bold text-gray-800">Envío de correos</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-sm text-gray-500">
                {nombreJefe}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-red-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Centro de envío de correos</h2>
          <p className="text-gray-500 text-sm">
            Envía comunicados a un usuario específico, a todos los usuarios de un rol o a los alumnos de una carrera.
          </p>
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm border ${
              feedback.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6"
        >
          {/* Selector de modo */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de envío
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {modosEnvio.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setModo(m.id)}
                  className={`flex items-center justify-center px-3 py-2 rounded-lg border text-sm font-medium transition-colors duration-150 ${
                    modo === m.id
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campos específicos según modo */}
          {modo === 'usuario' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Usuario destino</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={loadingData}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              >
                <option value="">Selecciona un usuario</option>
                {usuariosOrdenados.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {modo === 'rol' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Rol destino</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              >
                {rolesDisponibles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {modo === 'carrera' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Carrera (solo alumnos)</label>
              <select
                value={selectedCarrera}
                onChange={(e) => setSelectedCarrera(e.target.value)}
                disabled={loadingData}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              >
                <option value="">Selecciona una carrera</option>
                {carreras.map((carrera) => (
                  <option key={carrera} value={carrera}>
                    {carrera}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Asunto y mensaje */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Asunto</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              placeholder="Ej: Información sobre inscripciones de electivos"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Mensaje</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm resize-y"
              placeholder="Escribe el contenido del correo que será enviado a los destinatarios seleccionados."
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Los correos se enviarán utilizando la configuración SMTP definida para la aplicación.
            </p>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                'Enviar correo'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EnvioCorreos;
