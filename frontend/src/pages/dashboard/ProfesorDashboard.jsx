import { useNavigate } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import { ROLE_HOME_PATH } from "../../constants/roles.js";

const OPTIONS = [
  {
    id: "crear",
    title: "Crear nuevos electivos",
    description: "Añade nuevos cursos electivos al sistema con toda la información necesaria.",
    cta: "Crear electivo",
    path: `${ROLE_HOME_PATH.PROFESOR}/electivos/crear`,
    available: true,
  },
  {
    id: "editar",
    title: "Editar electivos existentes",
    description: "Modifica la información de los electivos que ya has creado.",
    cta: "Ver mis electivos",
    path: `${ROLE_HOME_PATH.PROFESOR}/electivos`,
    available: true,
  },
  {
    id: "ver-lista",
    title: "Ver lista de alumnos inscritos en sus electivos",
    description: "Consulta qué estudiantes están inscritos en cada uno de tus electivos.",
    cta: "Ver inscripciones",
    path: `${ROLE_HOME_PATH.PROFESOR}/inscripciones`,
    available: true,
  },
  {
    id: "cupos",
    title: "Cupos disponibles/ocupados",
    description: "Consulta el estado actual de los cupos en tus electivos.",
    cta: "Ver cupos",
    path: null,
    available: false,
  },
];

function ProfesorDashboard() {
  const navigate = useNavigate();

  const handleNavigate = (option) => {
    if (option.available && option.path) {
      navigate(option.path);
    }
  };

  return (
    <AppShell
      title="Panel del Profesor"
      description="Has ingresado como profesor. Selecciona una de las opciones para continuar."
    >
      <section className="panel-card panel-card--highlight">
        <header className="panel-card__header">
          <div>
            <span className="panel-card__eyebrow">Estado actual</span>
            <h2>Bienvenido, estás logeado como profesor</h2>
          </div>
          <span className="status-pill status-pill--active">Profesor</span>
        </header>
        <p className="panel-card__summary">
          Desde aquí podrás administrar tus electivos y gestionar inscripciones. Elige una de las acciones para continuar.
        </p>

        <div className="option-grid">
          {OPTIONS.map((option) => (
            <article key={option.id} className="option-card">
              <div className="option-card__icon" aria-hidden="true">
                <span>{option.title.charAt(0)}</span>
              </div>
              <h3>{option.title}</h3>
              <p>{option.description}</p>
              <button
                type="button"
                className={`button button--ghost${option.available ? "" : " button--ghost-disabled"}`}
                onClick={() => handleNavigate(option)}
                disabled={!option.available}
              >
                {option.cta}
              </button>
              {!option.available ? (
                <small className="option-card__hint">Disponible próximamente</small>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

export default ProfesorDashboard;


