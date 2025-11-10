import { useNavigate } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import { ROLE_HOME_PATH } from "../../constants/roles.js";

const OPTIONS = [
  {
    id: "inscribir",
    title: "Inscribir electivos",
    description: "Selecciona el electivo que deseas inscribir este semestre.",
    cta: "Ver electivos",
    path: `${ROLE_HOME_PATH.ALUMNO}/inscribir`,
    available: true,
  },
  {
    id: "inscritos",
    title: "Electivos inscritos",
    description: "Consulta el estado de tus electivos inscritos.",
    cta: "Revisar historial",
    path: null,
    available: false,
  },
  {
    id: "comunicarse",
    title: "Comunicarse con el Jefe de Carrera",
    description: "Si tienes alguna duda contacta con el jefe de carrera para resolverlas.",
    cta: "Contactar Jefe de Carrera",
    path: null,
    available: false,
  },
];

function AlumnoDashboard() {
  const navigate = useNavigate();

  const handleNavigate = (option) => {
    if (option.available && option.path) {
      navigate(option.path);
    }
  };

  return (
    <AppShell
      title="Panel del Alumno"
      description="Has ingresado como estudiante. Selecciona una de las opciones para continuar."
    >
      <section className="panel-card panel-card--highlight">
        <header className="panel-card__header">
          <div>
            <span className="panel-card__eyebrow">Estado actual</span>
            <h2>Bienvenido, estás logeado como alumno</h2>
          </div>
          <span className="status-pill status-pill--active">Alumno</span>
        </header>
        <p className="panel-card__summary">
          Desde aquí podrás administrar todo lo relacionado a tus electivos. Elige una de las
          acciones para continuar.
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

export default AlumnoDashboard;


