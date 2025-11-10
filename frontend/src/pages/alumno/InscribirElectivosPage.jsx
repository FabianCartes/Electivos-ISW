import AppShell from "../../components/layout/AppShell.jsx";

const MOCK_ELECTIVOS = [
  {
    id: 1,
    nombre: "Base de datos No Relacionales",
    descripcion:
      "Aprende a diseñar interfaces y experiencias centradas en el usuario para productos digitales.",
    profesor: "Tatiana Gutiérrez",
    cuposDisponibles: 12,
  },
  {
    id: 2,
    nombre: "Introducción a la Inteligencia Artificial",
    descripcion:
      "Conceptos fundamentales de IA, machine learning y aplicaciones prácticas en la industria.",
    profesor: "Carlos Pérez",
    cuposDisponibles: 8,
  },
  {
    id: 3,
    nombre: "Gestión Ágil de Proyectos",
    descripcion:
      "Explora metodologías ágiles como Scrum y Kanban para liderar equipos de desarrollo.",
    profesor: "Laura Martínez",
    cuposDisponibles: 5,
  },
];

function InscribirElectivosPage() {
  return (
    <AppShell
      title="Inscribir electivos"
      description="Explora la oferta disponible y postúlate a tus electivos favoritos."
    >
      <section className="panel-card panel-card--highlight">
        <header className="panel-card__header">
          <div>
            <span className="panel-card__eyebrow">Oferta disponible</span>
            <h2>Selecciona el electivo que más te interese</h2>
          </div>
          <span className="status-pill status-pill--neutral">
            {`${MOCK_ELECTIVOS.length} electivos`}
          </span>
        </header>
        <p className="panel-card__summary">
          Próximamente conectaremos esta vista con el backend para que puedas postular a tus
          cursos en tiempo real. Por ahora, revisa cómo lucirá la lista.
        </p>

        <div className="electivo-grid">
          {MOCK_ELECTIVOS.map((electivo) => (
            <article key={electivo.id} className="electivo-card">
              <header>
                <h3>{electivo.nombre}</h3>
                <small>Profesor/a: {electivo.profesor}</small>
              </header>
              <p>{electivo.descripcion}</p>
              <footer>
                <span className="chip chip--info">
                  {electivo.cuposDisponibles} cupos disponibles
                </span>
                <button type="button" className="button button--primary" disabled>
                  Inscripción próximamente
                </button>
              </footer>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

export default InscribirElectivosPage;


