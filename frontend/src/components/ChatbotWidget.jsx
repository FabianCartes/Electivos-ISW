import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/user.service.js';

const shortName = (fullName) => {
  if (!fullName) return 'Nombre no disponible';
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} ${parts[1]}`;
  return `${parts[0]} ${parts[parts.length - 2]}`;
};

const matchesAny = (text, variants) => variants.some((v) => text.includes(v));

const makeInitialMessages = (nombre) => ([
  {
    id: 'm1',
    sender: 'bot',
    text: `Hola${nombre ? `, ${nombre}` : ''}. Soy ElectiBot, tu chatbot de confianza para ayudarte en lo que pueda 😊. ¿Tienes dudas? Escríbelas y trataré de ayudarte; si no sé algo, te cuento cómo contactar al jefe de carrera o a Marcia.`,
  },
]);

const BotBubble = ({ text }) => (
  <div className="flex items-start gap-2">
    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">EB</div>
    <div className="rounded-2xl bg-blue-50 border border-blue-100 px-3 py-2 text-sm text-gray-800 shadow-sm max-w-[220px] whitespace-pre-wrap">
      {text}
    </div>
  </div>
);

const UserBubble = ({ text }) => (
  <div className="flex items-start gap-2 justify-end">
    <div className="rounded-2xl bg-gray-900 text-white px-3 py-2 text-sm shadow-sm max-w-[220px] whitespace-pre-wrap">
      {text}
    </div>
    <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center text-sm font-bold">Tú</div>
  </div>
);

const ChatbotWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState(makeInitialMessages(user?.nombre));
  const [input, setInput] = useState('');
  const [profesores, setProfesores] = useState([]);
  const [jefes, setJefes] = useState([]);
  const firstName = user?.nombre ? user.nombre.split(' ')[0] : '';
  const listRef = useRef(null);
  const secretariaNombreCorto = shortName('Marcia Andrea Aguayo Aguayo');

  useEffect(() => {
    // Reiniciar saludo si cambia el usuario (e.g., login/logout)
    setMessages(makeInitialMessages(user?.nombre));

    let active = true;
    const loadProfesores = async () => {
      try {
        const list = await userService.getProfesores();
        if (active) setProfesores(list);
      } catch (err) {
        if (active) setProfesores([]);
      }
    };
    const loadJefes = async () => {
      try {
        const list = await userService.getByRole('JEFE_CARRERA');
        if (active) setJefes(list);
      } catch (err) {
        if (active) setJefes([]);
      }
    };
    if (user) loadProfesores();
    if (user) loadJefes();
    return () => { active = false; };
  }, [user]);

  const launcherLabel = useMemo(() => (isOpen ? 'Ocultar chat' : 'Chat ElectiBot'), [isOpen]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg = { id: crypto.randomUUID(), sender: 'user', text: trimmed };

    // Respuestas solo cuando haya coincidencias específicas
    const textLower = trimmed.toLowerCase();
    const isJefeQuery = matchesAny(textLower, [
      'jefe de carrera',
      'jefe carrera',
      'jefa de carrera',
      'jefa carrera',
      'jefatura',
      'coordinador de carrera',
      'coordinación de carrera',
      'coordinacion de carrera',
      'coordinador carrera',
      'jefe',
      'jefa',
      'carerra',
    ]) && !matchesAny(textLower, ['profesor', 'profesores', 'profe']);

    const isProfesorQuery = matchesAny(textLower, [
      'profesor',
      'profesores',
      'profe',
      'docente',
      'docentes',
    ]);
    let botMsg = null;

    if (isJefeQuery) {
      const filteredJefes = jefes.filter((j) => {
        const nombre = j.nombre?.toLowerCase() || '';
        const correo = (j.email || '').toLowerCase();
        const isGeneric = nombre.includes('admin general') || correo.includes('jefe.carrera@universidad.cl');
        return !isGeneric;
      });
      const listaJefes = filteredJefes.length
        ? `• ${filteredJefes.map((j) => `${shortName(j.nombre)} (${j.email || 'correo no disponible'})`).join('\n• ')}`
        : '• Juan Parra (jparra@ubiobio.cl)';
      botMsg = {
        id: crypto.randomUUID(),
        sender: 'bot',
        text: `Jefe(s) de carrera:\n${listaJefes}\nSecretaria: ${secretariaNombreCorto} (maraguayo@ubiobio.cl). Oficina: Edificio Face Nuevo, primer piso.${firstName ? ` ${firstName}, avísame si necesitas algo más.` : ''}`,
      };
    } else if (isProfesorQuery) {
      const lista = profesores.length
        ? `• ${profesores.map((p) => `${shortName(p.nombre)} (${p.email})`).join('\n• ')}`
        : 'No pude obtener la lista de profesores ahora.';
      botMsg = {
        id: crypto.randomUUID(),
        sender: 'bot',
        text: `Aquí tienes un listado de profesores y sus correos en caso de que tengas consultas:\n${lista}${firstName ? `, ${firstName}` : ''} 😊`,
      };
    } else {
      botMsg = {
        id: crypto.randomUUID(),
        sender: 'bot',
        text: `No tengo la respuesta ahora mismo${firstName ? `, ${firstName}` : ''} 🙏. Si necesitas algo urgente, contacta al jefe de carrera (Juan Parra, jparra@ubiobio.cl) o a su secretaria ${secretariaNombreCorto} (maraguayo@ubiobio.cl).`,
      };
    }

    setMessages((prev) => botMsg ? [...prev, userMsg, botMsg] : [...prev, userMsg]);
    setInput('');
  };

  // Bajar scroll al último mensaje
  useEffect(() => {
    if (!isMinimized && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isMinimized]);

  // Ocultar el widget si no hay sesión iniciada
  if (!user) return null;

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-indigo-500/40 transition"
      >
        <span className="text-sm font-semibold">{launcherLabel}</span>
        <span className="text-lg">💬</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[90vw] shadow-2xl rounded-2xl bg-white border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-lg">💬</div>
          <div>
            <p className="text-sm font-semibold">Chat ElectiBot</p>
            <p className="text-xs text-white/80">Disponible en todas las páginas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMinimized((v) => !v)}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white text-sm"
            title={isMinimized ? 'Restaurar' : 'Minimizar'}
          >
            {isMinimized ? '▢' : '−'}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white text-sm"
            title="Cerrar"
          >
            ×
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex flex-col h-96">
          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              msg.sender === 'bot' ? (
                <BotBubble key={msg.id} text={msg.text} />
              ) : (
                <UserBubble key={msg.id} text={msg.text} />
              )
            ))}
          </div>
          <div className="border-t border-gray-200 bg-white px-3 py-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Escribe tu consulta..."
              />
              <button
                type="button"
                onClick={handleSend}
                className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
